import express from "express";
import { registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

// User Registration Route
userRouter.post("/register", registerUser);

export default userRouter;
