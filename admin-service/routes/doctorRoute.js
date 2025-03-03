import express from "express";
import { allDoctors } from "../controllers/doctorController.js";

const doctorRouter = express.Router();

// 🔹 Route to get all doctors from `db-service`
doctorRouter.get("/all-doctors", allDoctors); // ✅ Use GET instead of POST

export default doctorRouter;
