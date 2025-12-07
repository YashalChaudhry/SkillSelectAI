// Main entry point
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jobRoutes from "./src/routes/jobRoutes.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { connectDB } from "./src/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Static storage directory for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes (API-prefixed and fallback non-prefixed for legacy frontend)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/jobs", jobRoutes);
app.use("/jobs", jobRoutes);

app.use("/api/candidates", candidateRoutes);
app.use("/candidates", candidateRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
});
