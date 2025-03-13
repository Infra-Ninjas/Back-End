import express from "express";
import bcrypt from "bcrypt";
import Doctor from "../models/doctorModel.js";
import adminAuth from "../middlewares/auth.js"; // Import the middleware

const doctorRouter = express.Router();

// ✅ 1. Create a new doctor (POST /api/doctors) - Used by Admin
doctorRouter.post("/", adminAuth, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new Doctor({ ...rest, password: hashedPassword });
    await newDoctor.save();
    res.status(201).json({ message: "Doctor created successfully", newDoctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ 2. Get all doctors (GET /api/doctors)
doctorRouter.get("/", async (req, res) => {
  try {
    const { email, format } = req.query;
    let query = {};

    if (email) {
      query.email = email;
    }

    const doctors = await Doctor.find(query).select("-password -email");

    if (email) {
      const doctor = await Doctor.findOne({ email }).select("+password +role");
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      return res.status(200).json({ success: true, data: [doctor] });
    }

    if (format === "structured") {
      res.status(200).json({ success: true, data: doctors });
    } else {
      res.json(doctors);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default doctorRouter;