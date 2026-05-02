import mongoose from "mongoose";

const apiIntegrationSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    endpoint: { type: String, default: "" },
    keyMask: { type: String, default: "" },
    configured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["healthy", "degraded", "down", "unknown"],
      default: "unknown",
    },
    lastCheckedAt: { type: Date, default: null },
  },
  { _id: false }
);

const adminConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "primary", unique: true, index: true },
    aiConfiguration: {
      provider: { type: String, default: "openai" },
      model: { type: String, default: "gpt-4o-mini" },
      maxTokens: { type: Number, default: 2048 },
      temperature: { type: Number, default: 0.3 },
      autoRetry: { type: Boolean, default: true },
    },
    integrations: {
      openai: { type: apiIntegrationSchema, default: () => ({ provider: "OpenAI" }) },
      huggingFace: { type: apiIntegrationSchema, default: () => ({ provider: "Hugging Face" }) },
      googleSpeech: { type: apiIntegrationSchema, default: () => ({ provider: "Google Speech-to-Text" }) },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("AdminConfig", adminConfigSchema);
