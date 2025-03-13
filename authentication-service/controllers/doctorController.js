import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const dbServiceUrl = "http://db-service:5000/api";

// Doctor Login (Doctors only)
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Fetch doctor from db-service
    const response = await axios.get(`${dbServiceUrl}/doctors`, {
      params: { email },
    });

    if (!response.data.success || !response.data.data.length) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const doctor = response.data.data[0];

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, role: doctor.role });
  } catch (error) {
    console.error("Error in doctor login:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { loginDoctor };