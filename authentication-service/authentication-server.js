process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

import express from "express";
import cors from "cors";
import "dotenv/config";
import adminRouter from "./routes/adminRoute.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js"; // Ensure this import is present

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Register API Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter); // This line caused the error if userRouter wasn’t imported

// Test Endpoint
app.get("/", (req, res) => {
  res.send("API WORKING for authentication-service");
});

app.listen(port, () =>
  console.log("Authentication-service Server Started on port", port)
);