import express from "express";
import { bookAppointment, listAppointment, cancelAppointment, listDoctors } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();

console.log("Registering user routes...");
userRouter.post('/book-appointment', authUser, bookAppointment);

userRouter.get('/list-appointments', authUser, listAppointment);
console.log("Registered route: GET /list-appointments");

userRouter.post('/cancel-appointment', authUser, cancelAppointment);

userRouter.get('/list-doctors', authUser, listDoctors);
console.log("Registered route: GET /list-doctors");

export default userRouter;