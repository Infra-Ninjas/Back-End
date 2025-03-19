import express from "express";
import axios from "axios";
import { addDoctor } from "../controllers/adminController.js";
import multer from "multer";
import { appointmentCancel, appointmentsAdmin } from "../controllers/appointmentController.js";

const upload = multer({ storage: multer.memoryStorage() });
const adminRouter = express.Router();

// Middleware to Validate JWT via Authentication Service
const authAdminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    const token = authHeader.split(" ")[1];

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

adminRouter.post("/add-doctor", authAdminMiddleware, upload.single("image"), addDoctor);
adminRouter.get("/list-appointments", authAdminMiddleware, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdminMiddleware, appointmentCancel);

export default adminRouter;