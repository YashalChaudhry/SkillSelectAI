import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dns from "node:dns";
import User from "../models/User.js";
import { authRequired } from "../middleware/authMiddleware.js";

dns.setDefaultResultOrder("ipv4first");

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "skillselect_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SkillSelect@2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skillselect.ai";
const PASSWORD_RESET_EXP_MINUTES = parseInt(process.env.PASSWORD_RESET_EXP_MINUTES || "15", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const ADMIN_DEFAULT_PERMISSIONS = {
  manageRecruiters: true,
  manageSystemSettings: true,
  manageIntegrations: true,
  viewAnalytics: true,
  viewTechnicalLogs: true,
};

function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendPasswordResetEmail({ to, resetLink }) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const smtpFamily = parseInt(process.env.SMTP_FAMILY || "4", 10);

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error("SMTP is not configured");
  }

  let transportHost = smtpHost;
  try {
    const ipv4Hosts = await dns.promises.resolve4(smtpHost);
    if (ipv4Hosts && ipv4Hosts.length > 0) {
      transportHost = ipv4Hosts[0];
    }
  } catch (resolveErr) {
    // Fall back to original host if IPv4 resolution fails.
  }

  const transporter = nodemailer.createTransport({
    host: transportHost,
    port: smtpPort,
    secure: smtpSecure,
    family: smtpFamily,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: smtpHost,
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: "SkillSelectAI Password Reset",
    html: `
      <p>You requested a password reset for your SkillSelectAI account.</p>
      <p>This link expires in ${PASSWORD_RESET_EXP_MINUTES} minutes.</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  return true;
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include both letters and numbers",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "recruiter",
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("Signup error", err);
    return res.status(500).json({ message: "Failed to signup" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.toLowerCase() : "";
    const normalizedUsername = typeof username === "string" ? username.trim() : "";

    if ((!normalizedEmail && !normalizedUsername) || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    // Hardcoded admin login path.
    if (
      normalizedUsername === ADMIN_USERNAME ||
      normalizedEmail === ADMIN_EMAIL.toLowerCase()
    ) {
      const adminPasswordOk = password === ADMIN_PASSWORD;
      if (!adminPasswordOk) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      let adminUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
      if (!adminUser) {
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
        adminUser = await User.create({
          name: "SkillSelect Admin",
          email: ADMIN_EMAIL.toLowerCase(),
          passwordHash,
          role: "admin",
          permissions: ADMIN_DEFAULT_PERMISSIONS,
        });
      } else {
        if (adminUser.role !== "admin") {
          adminUser.role = "admin";
        }
        adminUser.permissions = {
          ...ADMIN_DEFAULT_PERMISSIONS,
          ...(adminUser.permissions || {}),
        };
        await adminUser.save();
      }

      const token = signToken(adminUser);

      return res.json({
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ message: "Failed to login" });
  }
});

// Request password reset link
router.post("/forgot-password/request", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXP_MINUTES * 60 * 1000);

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const baseUrl = FRONTEND_URL.replace(/\/$/, "");
    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendPasswordResetEmail({ to: user.email, resetLink });

    return res.json({
      message: "Password reset link sent to your email",
      expiresInMinutes: PASSWORD_RESET_EXP_MINUTES,
    });
  } catch (err) {
    console.error("Forgot password request error", err);
    if (err.message === "SMTP is not configured") {
      return res.status(503).json({ message: "Email service is not configured. Please contact support." });
    }
    return res.status(500).json({ message: "Failed to send reset link" });
  }
});

// Reset password using token
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Token and password fields are required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include both letters and numbers",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const tokenHash = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Forgot password reset error", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

// Current user info
router.get("/me", authRequired, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
