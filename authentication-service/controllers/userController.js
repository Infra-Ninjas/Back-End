import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const dbServiceUrl = "http://db-service:5000/api";

// Patient Registration (Public)
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: "Patient", // Fixed to Patient only
    };

    const response = await axios.post(`${dbServiceUrl}/user/register`, userData);
    if (!response.data.success) {
      return res.status(response.status).json(response.data);
    }

    const user = response.data.data;
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ success: true, token, role: user.role });
  } catch (error) {
    console.error("Error registering patient:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// User Login (Patients and Doctors)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const response = await axios.get(`${dbServiceUrl}/users`, { params: { email } });
    if (!response.data.success || !response.data.data.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const user = response.data.data[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.error("Error in user login:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { registerUser, loginUser };