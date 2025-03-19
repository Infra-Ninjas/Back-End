import express from "express";
import Appointment from "../models/appointmentModel.js";

const appointmentRouter = express.Router();

// Create a new appointment (POST /api/appointments)
appointmentRouter.post("/", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json({ success: true, message: "Appointment created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get appointments by userId (GET /api/appointments)
appointmentRouter.get("/", async (req, res) => {
  try {
    console.log("Received GET /api/appointments with query:", req.query);
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId query parameter is required" });
    }

    const appointments = await Appointment.find({ userId });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ success: false, message: "No appointments found for this user" });
    }

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment by ID (GET /api/appointments/:id)
appointmentRouter.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error("Error fetching appointment by ID:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update appointment by ID (PUT /api/appointments/:id)
appointmentRouter.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.status(200).json({ success: true, message: "Appointment updated", data: appointment });
  } catch (error) {
    console.error("Error updating appointment:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default appointmentRouter;