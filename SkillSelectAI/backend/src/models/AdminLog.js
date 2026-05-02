import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorEmail: { type: String, default: "" },
    category: {
      type: String,
      enum: ["auth", "users", "settings", "integrations", "health", "analytics", "system"],
      required: true,
    },
    level: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "info",
    },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminLogSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model("AdminLog", adminLogSchema);
