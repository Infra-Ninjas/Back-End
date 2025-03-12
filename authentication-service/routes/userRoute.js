import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser); // Patients only
userRouter.post("/login", loginUser); // Patients and Doctors

export default userRouter;