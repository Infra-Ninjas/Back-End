import axios from "axios";

const dbServiceUrl = "http://authentication-service:4000/api";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    const response = await axios.post(`${dbServiceUrl}/auth/validate-token`, { token });
    if (!response.data.success) {
      return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }

    req.admin = response.data.admin; // Attach admin data to request
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Token Validation Failed" });
  }
};

export default adminAuth;