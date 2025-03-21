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

    // Validate request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Fetch doctor from db-service
    console.log(`Fetching doctor with email ${email} from db-service...`);
    const response = await axios.get(`${dbServiceUrl}/doctors`, {
      params: { email },
    });

    if (!response.data.success || !response.data.data.length) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const doctor = response.data.data[0];
    console.log("Doctor fetched from db-service:", doctor);

    // Verify password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return success response with token, role, and docId
    res.json({
      success: true,
      token,
      role: doctor.role,
      docId: doctor._id, // Add docId to the response
    });
  } catch (error) {
    console.error("Error in doctor login:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { loginDoctor };