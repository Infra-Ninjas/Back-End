import axios from "axios";

const authServiceUrl = "http://authentication-service:4000/api";

//const authServiceUrl = "http://localhost:4000/api";
const authDoctor = async (req, res, next) => {
  try {
    console.log("Raw Authorization header:", req.headers.authorization);
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Extracted token:", token);
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    console.log("Sending validation request to:", `${authServiceUrl}/auth/validate-token`);
    const response = await axios.post(`${authServiceUrl}/auth/validate-token`, { token });
    console.log("Validation response:", response.data);
    if (!response.data.success) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    const user = response.data.user;
    console.log("Validated user:", user);
    if (user.role !== 2) {
      return res.status(403).json({ success: false, message: "Access denied: doctor only" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token validation error:", error.message, error.stack);
    res.status(403).json({ success: false, message: "Token validation failed" });
  }
};

export default authDoctor;