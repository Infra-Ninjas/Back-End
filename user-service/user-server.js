import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/userRoute.js";

// Load environment variables
dotenv.config();

// App Config
const app = express();
const port = process.env.PORT || 4002;
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/user", userRouter);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ User-Service API is working!");
});

// Start Server
app.listen(port, () => console.log(`🚀 User-Service started on port ${port}`));
