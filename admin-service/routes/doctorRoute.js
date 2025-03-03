import express from "express";
import { allDoctors } from "../controllers/doctorController.js";
import axios from "axios";

const doctorRouter = express.Router();

// ✅ Middleware to Validate JWT via Authentication Service
const authAdminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Validate token with authentication-service
    const response = await axios.post("http://authentication-service:4000/api/auth/validate-token", { token });

    if (response.data.success) {
      req.admin = response.data.admin;
      next();
    } else {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }
  } catch (error) {
    console.error("Auth Error:", error.response ? error.response.data : error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or Expired Token",
      error: error.response ? error.response.data : error.message
    });
  }
};

// ✅ Protect the `/all-doctors` route with `authAdminMiddleware`
doctorRouter.get("/all-doctors", authAdminMiddleware, allDoctors);

export default doctorRouter;
