import express from "express";
import Doctor from "../models/doctorModel.js";

const doctorRouter = express.Router(); 

// ✅ 1. Create a new doctor (POST /api/doctors)
doctorRouter.post("/", async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    await newDoctor.save();
    res.status(201).json({ message: "Doctor created successfully", newDoctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ 2. Get all doctors (GET /api/doctors)
doctorRouter.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
// ✅ 3. Get a single doctor by ID (GET /api/doctors/:id)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 4. Update a doctor by ID (PUT /api/doctors/:id)
router.put("/:id", async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor updated successfully", updatedDoctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 5. Delete a doctor by ID (DELETE /api/doctors/:id)
router.delete("/:id", async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

export default doctorRouter;
