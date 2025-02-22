import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "../../Back-End/database-service/config/mongodb.js";
import cloudinary from "../../Back-End/database-service/config/cloudinary.js";
import userRouter from "./routes/userRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4002;
connectDB();
console.log("Cloudinary Config Loaded:", cloudinary.config());

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/user", userRouter);// user path


// Test Route
app.get("/", (req, res) => {
    res.send("API WORKING for user-service");
  });
  
// Start Server
app.listen(port, () => console.log("User-Service Server Started", port));
