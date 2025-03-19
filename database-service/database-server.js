import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js"; // Doctor Routes
import uploadRouter from "./routes/uploadRoute.js"; // Image Upload Route
import userRouter from "./routes/userRoute.js"; // user Routes
import appointmentRouter from "./routes/appointmentRoute.js"; // appointment route

//import doctorRouter from "./routes/doctorRoute.js"; // Add doctorRouter
//import userRouter from "../user-service/routes/userRoute.js";

// app config
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());
connectDB();
console.log("Cloudinary Config Loaded:", cloudinary.config());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected:", mongoose.connection.host))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ✅ Move API routes outside `app.get("/")`
app.use("/api/appointments", appointmentRouter); // book appointment fo user
app.use("/api/doctors", doctorRouter);
app.use("/api", uploadRouter); // Add upload route
//app.use("/api", userRouter); // user route
//app.use("/api", userRouter);  // Keeps /api/users
//app.use("/", userRouter);  // Allows /users
app.use("/api", userRouter); // Mounts /api/user/register and /api/users
app.use("/api", doctorRouter); // Add doctorRouter




// Root route
app.get("/", (req, res) => {
  res.send("API WORKING for database-service");
});

// Start server
app.listen(port, () => console.log("Database-service Server Started on Port", port));
