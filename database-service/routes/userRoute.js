import express from "express";
import User from "../models/userModel.js";

const userRouter = express.Router();

// Register a user
userRouter.post("/user/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = new User({ name, email, password, role: role || "Patient" });
    await user.save();

    res.status(201).json({ success: true, data: { _id: user._id, name, email, role: user.role } });
  } catch (error) {
    console.error("Error in db-service register:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get users (include password for login query)
userRouter.get("/users", async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const users = await User.find(query).select(email ? "+password" : "-password"); // Include password if querying by email
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error in db-service get users:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get a single user by ID (GET /api/users/:userId)
userRouter.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export default userRouter;