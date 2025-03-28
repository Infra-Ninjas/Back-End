import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const dbServiceUrl = process.env.DB_SERVICE_URL || "http://db-service:5000/api";

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

    // Check if the doctor was found
    if (!response.data.success || !response.data.data.length) {
      return res
        .status(401) // Change to 401 for failed login
        .json({ success: false, message: "Invalid email or password" });
    }

    const doctor = response.data.data[0];
    console.log("Doctor fetched from db-service:", doctor);

    // Verify password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
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
      docId: doctor._id,
    });
  } catch (error) {
    console.error("Error in doctor login:", error.message, error.stack);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      // Handle 404 specifically as a failed login attempt
      if (error.response.status === 404) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    } else if (error.request) {
      console.error("No response received from db-service:", error.request);
    } else {
      console.error("Error in request setup:", error.message);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Verify Token (already present from previous steps)
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    // Fetch the user from db-service to ensure they still exist
    const response = await axios.get(`${dbServiceUrl}/doctors`, {
      params: { email: decoded.email },
    });

    if (!response.data.success || !response.data.data.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = response.data.data[0];

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export { loginDoctor, verifyToken };