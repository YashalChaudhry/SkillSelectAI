import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "recruiter", "candidate"], default: "recruiter" },
    permissions: {
      manageRecruiters: { type: Boolean, default: false },
      manageSystemSettings: { type: Boolean, default: false },
      manageIntegrations: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: false },
      viewTechnicalLogs: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
