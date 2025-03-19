import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4002;

app.use(express.json());
app.use(cors());

// Debug: Log when routes are mounted
console.log("Mounting userRouter at /api/user");
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("✅ User-Service API is working!");
});

app.listen(port, () => console.log(`🚀 User-Service started on port ${port}`));