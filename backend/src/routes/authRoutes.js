import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "skillselect_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SkillSelect@2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skillselect.ai";

const ADMIN_DEFAULT_PERMISSIONS = {
  manageRecruiters: true,
  manageSystemSettings: true,
  manageIntegrations: true,
  viewAnalytics: true,
  viewTechnicalLogs: true,
};

function signToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
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

// Current user info
router.get("/me", authRequired, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
