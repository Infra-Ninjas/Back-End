import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios"; // Import axios for API calls

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking for required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    // Validating password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = { name, email, password: hashedPassword };

    // 🔥 Instead of importing userModel, send a request to db-service
    const dbServiceUrl = "http://db-service:5000/users"; // Adjust API route as per db-service

    const response = await axios.post(dbServiceUrl, userData);
    
    if (response.status !== 201) {
      return res.status(response.status).json(response.data);
    }

    const user = response.data;

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { registerUser };
