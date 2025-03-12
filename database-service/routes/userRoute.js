import express from "express";
import axios from "axios";
import User from "../models/userModel.js"; // Import the user model

const userRouter = express.Router();

// Register a user (called by user-service)
userRouter.post("/user/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = new User({ name, email, password }); // Password is already hashed by user-service
    await user.save();

    res.status(201).json({ success: true, data: { _id: user._id, name, email } });
  } catch (error) {
    console.error("Error in db-service register:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get all users
userRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error in db-service get users:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default userRouter;