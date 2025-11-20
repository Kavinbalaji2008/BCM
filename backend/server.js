import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


import userRoutes from "./routes/user_route.js";
import contactRoutes from "./routes/contact_route.js";
import interactionRoutes from "./routes/interactionRoutes.js";

dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// MongoDB Atlas connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("📇 Business Contact Manager API is running...");
});

// API routes
app.use("/api/user", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/interactions", interactionRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
