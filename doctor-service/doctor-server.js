import express from "express";
import cors from "cors";
import "dotenv/config";
import doctorRouter from "./routes/doctorRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4003;

// middlewares
app.use(express.json());
app.use(cors());

// Register API Endpoints
app.use("/api/doctor", doctorRouter);

// Root route
app.get("/", (req, res) => {
  res.send("API WORKING for doctor-service");
});

// Start server
app.listen(port, () => console.log("Doctor-service Server Started on Port", port));