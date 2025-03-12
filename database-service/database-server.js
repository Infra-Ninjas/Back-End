import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js"; // Doctor Routes
import uploadRouter from "./routes/uploadRoute.js"; // Image Upload Route
import userRouter from "./routes/userRoute.js"; // user Routes
//import userRouter from "../user-service/routes/userRoute.js";

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
//app.use("/api", userRouter); // user route
//app.use("/api", userRouter);  // Keeps /api/users
//app.use("/", userRouter);  // Allows /users
app.use("/api", userRouter); // Mounts /api/user/register and /api/users


// Root route
app.get("/", (req, res) => {
  res.send("API WORKING for database-service");
});

// Start server
app.listen(port, () => console.log("Database-service Server Started on Port", port));
