import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const authAdmin = async (req, res, next) => {
  try {
    // Extract token from headers (expecting Bearer token format)
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login Again" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Check if decoded token matches admin credentials
    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied: Not an Admin" });
    }

    req.admin = token_decode; // Store decoded token data in request
    next(); // Proceed to next middleware or controller
  } catch (error) {
    console.log(error);
    res.status(403).json({ success: false, message: error.message });
  }
};

export default authAdmin;
