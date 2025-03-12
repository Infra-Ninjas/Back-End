import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const dbServiceUrl = "http://db-service:5000/api"; // Base URL for db-service

const registerUser = async (req, res) => {
  try {
    console.log("📥 Received Body:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Send user data to db-service
    const userData = { name, email, password: hashedPassword };
    const response = await axios.post(`${dbServiceUrl}/user/register`, userData);

    if (!response.data.success) {
      return res.status(response.status).json(response.data);
    }

    const user = response.data.data; // Extract user data from db-service response
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const response = await axios.get(`${dbServiceUrl}/users`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

export { registerUser, getAllUsers };