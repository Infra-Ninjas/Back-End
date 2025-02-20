import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const authRouter = express.Router();

// Validate Token API (Called by admin-service)
authRouter.post("/validate-token", (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied: Not an Admin" });
    }

    res.json({ success: true, admin: token_decode });
  } catch (error) {
    res
      .status(403)
      .json({ success: false, message: "Invalid or Expired Token" });
  }
});

export default authRouter;
