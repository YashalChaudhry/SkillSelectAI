// Main entry point
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import jobRoutes from "./src/routes/jobRoutes.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import interviewRoutes from "./src/routes/interviewRoutes.js";
import { connectDB } from "./src/db.js";
import ErrorResponse from "./src/utils/errorResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Static storage directory for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes (API-prefixed and fallback non-prefixed for legacy frontend)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/jobs", jobRoutes);
app.use("/jobs", jobRoutes);

app.use("/api/candidates", candidateRoutes);
app.use("/candidates", candidateRoutes);

// Question routes
app.use("/api", questionRoutes);

// Interview routes
app.use("/api/interviews", interviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found'
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
