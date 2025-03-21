import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js";
import uploadRouter from "./routes/uploadRoute.js";
import userRouter from "./routes/userRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
connectDB();
console.log("Cloudinary Config Loaded:", cloudinary.config());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected:", mongoose.connection.host))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter); // Mount doctor routes here
app.use("/api", uploadRouter);         // Upload routes
app.use("/api", userRouter);           // User routes

app.get("/", (req, res) => {
  res.send("API WORKING for database-service");
});

app.listen(port, () => console.log("Database-service Server Started on Port", port));