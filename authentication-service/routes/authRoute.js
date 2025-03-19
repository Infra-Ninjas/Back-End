import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const authRouter = express.Router();

// Generic Token Validation API (Called by user-service)
authRouter.post("/validate-token", (req, res) => {
  console.log("Received Request Body:", req.body);
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", token_decode); // Debugging line

    // Return user data including role
    res.json({
      success: true,
      user: {
        id: token_decode.id || token_decode._id, // Handle different ID field names
        email: token_decode.email,
        role: token_decode.role || 0 // Default to 0 if role is missing
      }
    });
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or Expired Token" });
  }
});

// Optional: Keep the admin-specific validation if needed
authRouter.post("/validate-admin-token", (req, res) => {
  console.log("Received Request Body:", req.body);
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", token_decode);

    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Access Denied: Not an Admin" });
    }

    res.json({ success: true, admin: token_decode });
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or Expired Token" });
  }
});

export default authRouter;