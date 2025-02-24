import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js"; // Doctor Routes
import uploadRouter from "./routes/uploadRoute.js"; // Image Upload Route

// app config
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());
connectDB();
console.log("Cloudinary Config Loaded:", cloudinary.config());

// ✅ Move API routes outside `app.get("/")`
app.use("/api/doctors", doctorRouter);
app.use("/api", uploadRouter); // Add upload route

// Root route
app.get("/", (req, res) => {
  res.send("API WORKING for database-service");
});

// Start server
app.listen(port, () => console.log("Database-service Server Started on Port", port));
