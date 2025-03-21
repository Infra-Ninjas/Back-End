import express from "express";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

const doctorRouter = express.Router();

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

// Get a doctor by ID (GET /api/doctors/:id)
doctorRouter.get("/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Error fetching doctor by ID:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update doctor's slots_booked (PUT /api/doctors/:id/slots)
doctorRouter.put("/:id/slots", async (req, res) => {
  try {
    const { id } = req.params;
    const { slots_booked } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    if (!slots_booked || typeof slots_booked !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid slots_booked data",
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { slots_booked },
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({ success: true, message: "Doctor slots updated", data: doctor });
  } catch (error) {
    console.error("Error updating doctor slots:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default doctorRouter;