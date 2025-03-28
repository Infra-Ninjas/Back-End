import express from "express";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { ObjectId } = mongoose.Types;

const doctorRouter = express.Router();

// Create a new doctor (POST /api/doctors)
doctorRouter.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image,
      available,
      slots_booked,
      date,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, and password are required",
      });
    }

    // Check if doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor instance
    const doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees), // Ensure fees is a number
      address,
      image,
      available: available === true || available === "true", // Handle string/boolean
      slots_booked: slots_booked || {}, // Default to empty object if not provided
      date: date || Date.now(), // Use provided date or current time
    });

    // Save to MongoDB
    await doctor.save();
    console.log("Doctor Created:", doctor);

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Error creating doctor:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all doctors or a doctor by email (GET /api/doctors)
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

    const doctors = await Doctor.find(query).select("-password -email -role");
    if (doctors.length === 0) {
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

// Update doctor profile (PUT /api/doctors/:id)
doctorRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fees, address, available } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    // Prepare update data, only including provided fields
    const updateData = {};
    if (fees !== undefined) updateData.fees = Number(fees);
    if (address !== undefined) updateData.address = address;
    if (available !== undefined) updateData.available = available === true || available === "true";

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({ success: true, message: "Doctor profile updated", data: doctor });
  } catch (error) {
    console.error("Error updating doctor profile:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default doctorRouter;