import express from "express";
import { doctorAppointments, doctorList, cancelAppointment, completeAppointment, doctorDashboard, updateDoctorProfile } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.get("/appointments", authDoctor, doctorAppointments);
doctorRouter.post("/cancel-appointment", authDoctor, cancelAppointment);
doctorRouter.post("/complete-appointment", authDoctor, completeAppointment); // Added complete-appointment route
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
export default doctorRouter;