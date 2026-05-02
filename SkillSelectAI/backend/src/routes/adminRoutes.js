import { Router } from "express";
import mongoose from "mongoose";
import os from "os";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import InterviewSession from "../models/InterviewSession.js";
import AdminConfig from "../models/AdminConfig.js";
import AdminLog from "../models/AdminLog.js";
import { authRequired, adminRequired } from "../middleware/authMiddleware.js";

const router = Router();

const defaultPermissions = {
  manageRecruiters: false,
  manageSystemSettings: false,
  manageIntegrations: false,
  viewAnalytics: true,
  viewTechnicalLogs: false,
};

const integrationSpecs = {
  openai: {
    provider: "OpenAI",
    endpoint: "https://api.openai.com/v1/models",
    envKeyName: "OPENAI_API_KEY",
  },
  huggingFace: {
    provider: "Hugging Face",
    endpoint: "https://api-inference.huggingface.co/models",
    envKeyName: "HUGGINGFACE_API_KEY",
  },
  googleSpeech: {
    provider: "Google Speech-to-Text",
    endpoint: "https://speech.googleapis.com/v1/speech:recognize",
    envKeyName: "GOOGLE_APPLICATION_CREDENTIALS",
  },
};

function buildIntegrationDefaults() {
  const openaiKey = process.env.OPENAI_API_KEY || "";
  const hfKey = process.env.HUGGINGFACE_API_KEY || "";
  const googleCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";

  return {
    openai: {
      provider: integrationSpecs.openai.provider,
      endpoint: integrationSpecs.openai.endpoint,
      configured: Boolean(openaiKey),
      keyMask: maskCredential(openaiKey),
      status: openaiKey ? "healthy" : "degraded",
      enabled: true,
      lastCheckedAt: new Date(),
    },
    huggingFace: {
      provider: integrationSpecs.huggingFace.provider,
      endpoint: integrationSpecs.huggingFace.endpoint,
      configured: Boolean(hfKey),
      keyMask: maskCredential(hfKey),
      status: hfKey ? "healthy" : "degraded",
      enabled: true,
      lastCheckedAt: new Date(),
    },
    googleSpeech: {
      provider: integrationSpecs.googleSpeech.provider,
      endpoint: integrationSpecs.googleSpeech.endpoint,
      configured: Boolean(googleCreds),
      keyMask: maskCredential(googleCreds),
      status: googleCreds ? "healthy" : "degraded",
      enabled: true,
      lastCheckedAt: new Date(),
    },
  };
}

function maskCredential(raw) {
  if (!raw || typeof raw !== "string") {
    return "";
  }
  if (raw.length <= 8) {
    return "*".repeat(raw.length);
  }
  return `${raw.slice(0, 4)}***${raw.slice(-4)}`;
}

async function writeLog(req, category, message, metadata = {}, level = "info") {
  try {
    await AdminLog.create({
      actorId: req.user?._id || null,
      actorEmail: req.user?.email || "",
      category,
      level,
      message,
      metadata,
    });
  } catch (err) {
    console.error("Failed to write admin log:", err.message);
  }
}

async function getOrCreateAdminConfig(userId) {
  let config = await AdminConfig.findOne({ key: "primary" });
  const defaultIntegrations = buildIntegrationDefaults();

  if (!config) {
    config = await AdminConfig.create({
      key: "primary",
      aiConfiguration: {
        provider: "openai",
        model: "gpt-4o-mini",
        maxTokens: 2048,
        temperature: 0.3,
        autoRetry: true,
      },
      integrations: defaultIntegrations,
      updatedBy: userId || null,
    });
  } else {
    const existing = config.integrations?.toObject ? config.integrations.toObject() : (config.integrations || {});
    config.integrations = {
      ...defaultIntegrations,
      ...existing,
      openai: {
        ...defaultIntegrations.openai,
        ...(existing.openai || {}),
      },
      huggingFace: {
        ...defaultIntegrations.huggingFace,
        ...(existing.huggingFace || {}),
      },
      googleSpeech: {
        ...defaultIntegrations.googleSpeech,
        ...(existing.googleSpeech || {}),
      },
    };
    await config.save();
  }

  return config;
}

router.use(authRequired, adminRequired);

router.get("/overview", async (req, res) => {
  try {
    const [
      totalRecruiters,
      totalAdmins,
      totalCandidates,
      totalJobs,
      totalInterviews,
      completedInterviews,
      recentLogs,
      newestRecruiters,
      avgCandidateScore,
      avgInterviewScore,
    ] = await Promise.all([
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "admin" }),
      Candidate.countDocuments({}),
      Job.countDocuments({}),
      Interview.countDocuments({}),
      InterviewSession.countDocuments({ status: "Completed" }),
      AdminLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ role: "recruiter", createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Candidate.aggregate([
        { $match: { matchScore: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$matchScore" } } },
      ]),
      Candidate.aggregate([
        { $match: { interviewScore: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$interviewScore" } } },
      ]),
    ]);

    const dbState = mongoose.connection.readyState;
    const dbStateText = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

    return res.json({
      users: {
        recruiters: totalRecruiters,
        admins: totalAdmins,
        newRecruitersThisWeek: newestRecruiters,
      },
      hiring: {
        candidates: totalCandidates,
        jobs: totalJobs,
        interviews: totalInterviews,
        completedInterviews,
        averageMatchScore: Number(avgCandidateScore?.[0]?.avg || 0).toFixed(1),
        averageInterviewScore: Number(avgInterviewScore?.[0]?.avg || 0).toFixed(1),
      },
      platform: {
        uptimeSeconds: process.uptime(),
        nodeVersion: process.version,
        dbStatus: dbStateText,
        logsLast24h: recentLogs,
      },
    });
  } catch (err) {
    console.error("Admin overview error", err);
    return res.status(500).json({ message: "Failed to load admin overview" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const query = String(req.query.search || "").trim();
    const match = { role: "recruiter" };

    if (query) {
      match.$or = [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ];
    }

    const users = await User.find(match)
      .sort({ createdAt: -1 })
      .select("name email role permissions createdAt updatedAt")
      .lean();

    return res.json({ users });
  } catch (err) {
    console.error("Admin users error", err);
    return res.status(500).json({ message: "Failed to load users" });
  }
});

router.patch("/users/:userId/permissions", async (req, res) => {
  try {
    const { userId } = req.params;
    const incoming = req.body?.permissions || {};

    const user = await User.findOne({ _id: userId, role: "recruiter" });
    if (!user) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    user.permissions = {
      ...defaultPermissions,
      ...(user.permissions || {}),
      ...incoming,
    };

    await user.save();

    await writeLog(req, "users", "Updated recruiter permissions", {
      userId,
      permissions: user.permissions,
    });

    return res.json({
      message: "Permissions updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("Permission update error", err);
    return res.status(500).json({ message: "Failed to update permissions" });
  }
});

router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId, role: "recruiter" });
    if (!user) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const recruiterJobs = await Job.find({ createdBy: user._id }).select("_id");
    const recruiterJobIds = recruiterJobs.map((j) => j._id);

    await Promise.all([
      Candidate.deleteMany({ job: { $in: recruiterJobIds } }),
      Interview.deleteMany({ jobId: { $in: recruiterJobIds } }),
      InterviewSession.deleteMany({ jobId: { $in: recruiterJobIds } }),
      Job.deleteMany({ _id: { $in: recruiterJobIds } }),
      User.deleteOne({ _id: user._id }),
    ]);

    await writeLog(req, "users", "Deleted recruiter account", {
      deletedUserId: user._id,
      deletedEmail: user.email,
      deletedJobs: recruiterJobIds.length,
    }, "warning");

    return res.json({ message: "Recruiter deleted successfully" });
  } catch (err) {
    console.error("User delete error", err);
    return res.status(500).json({ message: "Failed to delete recruiter" });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const config = await getOrCreateAdminConfig(req.user?._id);
    return res.json({ config });
  } catch (err) {
    console.error("Settings fetch error", err);
    return res.status(500).json({ message: "Failed to load admin settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const config = await getOrCreateAdminConfig(req.user?._id);
    const { aiConfiguration, integrations } = req.body || {};

    if (aiConfiguration) {
      config.aiConfiguration = {
        ...config.aiConfiguration,
        ...aiConfiguration,
      };
    }

    if (integrations) {
      const existingIntegrations = config.integrations?.toObject ? config.integrations.toObject() : (config.integrations || {});
      const normalized = {
        ...buildIntegrationDefaults(),
        ...existingIntegrations,
      };
      Object.keys(integrations).forEach((key) => {
        if (!normalized[key]) return;
        const target = integrations[key] || {};
        normalized[key] = {
          ...normalized[key],
          ...target,
          keyMask: target.rawKey ? maskCredential(target.rawKey) : normalized[key].keyMask,
          configured: Boolean(target.rawKey || normalized[key].keyMask),
          lastCheckedAt: new Date(),
        };
        delete normalized[key].rawKey;
      });
      config.integrations = normalized;
    }

    config.updatedBy = req.user?._id || null;
    await config.save();

    await writeLog(req, "settings", "Updated admin system settings", {
      hasAiConfig: Boolean(aiConfiguration),
      integrationsUpdated: Object.keys(integrations || {}),
    });

    return res.json({ message: "Settings updated", config });
  } catch (err) {
    console.error("Settings update error", err);
    return res.status(500).json({ message: "Failed to update admin settings" });
  }
});

router.get("/health", async (req, res) => {
  try {
    const config = await getOrCreateAdminConfig(req.user?._id);
    const existingIntegrations = config.integrations?.toObject ? config.integrations.toObject() : (config.integrations || {});
    const defaults = buildIntegrationDefaults();
    const integrations = {
      ...defaults,
      ...existingIntegrations,
      openai: {
        ...defaults.openai,
        ...(existingIntegrations.openai || {}),
      },
      huggingFace: {
        ...defaults.huggingFace,
        ...(existingIntegrations.huggingFace || {}),
      },
      googleSpeech: {
        ...defaults.googleSpeech,
        ...(existingIntegrations.googleSpeech || {}),
      },
    };

    const memoryUsage = process.memoryUsage();
    const dbState = mongoose.connection.readyState;

    return res.json({
      server: {
        status: "online",
        uptimeSeconds: process.uptime(),
        platform: os.platform(),
        cpuArch: os.arch(),
        memory: {
          rss: memoryUsage.rss,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
        },
      },
      database: {
        status: dbState === 1 ? "connected" : "degraded",
        readyState: dbState,
      },
      apis: {
        openai: integrations.openai,
        huggingFace: integrations.huggingFace,
        googleSpeech: integrations.googleSpeech,
      },
    });
  } catch (err) {
    console.error("Health fetch error", err);
    return res.status(500).json({ message: "Failed to load health metrics" });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const [logs, activity] = await Promise.all([
      AdminLog.find({}).sort({ createdAt: -1 }).limit(100).lean(),
      InterviewSession.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    return res.json({
      logs,
      activity,
    });
  } catch (err) {
    console.error("Reports error", err);
    return res.status(500).json({ message: "Failed to load reports" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const past30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [userGrowth, interviewsByDay] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: past30d }, role: "recruiter" } },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
      ]),
      Interview.aggregate([
        { $match: { createdAt: { $gte: past30d } } },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
      ]),
    ]);

    return res.json({ userGrowth, interviewsByDay });
  } catch (err) {
    console.error("Analytics error", err);
    return res.status(500).json({ message: "Failed to load analytics" });
  }
});

export default router;
