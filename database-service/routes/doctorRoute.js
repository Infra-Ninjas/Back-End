import express from "express";
import bcrypt from "bcrypt";
import Doctor from "../models/doctorModel.js";
import adminAuth from "../middlewares/auth.js";

const doctorRouter = express.Router();

// Create a new doctor (POST /api/doctors) - Used by Admin
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

// Get all doctors (GET /api/doctors)
doctorRouter.get("/", async (req, res) => {
  try {
    const { email, available } = req.query;
    let query = {};

    if (email) {
      const doctor = await Doctor.findOne({ email }).select("+password +role");
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      return res.status(200).json({ success: true, data: [doctor] });
    }

    if (available === "true") {
      query.available = true;
    }

    const doctors = await Doctor.find(query).select("-password -email -role -slots_booked");

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ success: false, message: "No doctors found" });
    }

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single doctor by ID (GET /api/doctors/:id)
doctorRouter.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password -role"); // Include slots_booked
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update doctor's slots_booked (PUT /api/doctors/:id/slots)
doctorRouter.put("/:id/slots", async (req, res) => {
  try {
    const { slots_booked } = req.body;
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { slots_booked },
      { new: true }
    );
    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, message: "Slots updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default doctorRouter;