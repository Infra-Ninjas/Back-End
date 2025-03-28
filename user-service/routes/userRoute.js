import express from "express";
import multer from "multer"; // Import multer
import { bookAppointment, listAppointment, cancelAppointment, listDoctors, getProfile, updateProfile } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

// Define multer storage (memory storage to keep file in buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Define the upload middleware

const userRouter = express.Router();

console.log("Registering user routes...");
userRouter.post('/book-appointment', authUser, bookAppointment);

userRouter.get('/list-appointments', authUser, listAppointment);
console.log("Registered route: GET /list-appointments");

userRouter.post('/cancel-appointment', authUser, cancelAppointment);

userRouter.get('/list-doctors', authUser, listDoctors);

userRouter.get('/get-profile', authUser, getProfile);

userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);

console.log("Registered route: GET /list-doctors");

export default userRouter;