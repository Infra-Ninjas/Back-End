import express from "express";
import { registerUser, getAllUsers } from "../controllers/userController.js"; // Import getAllUsers

const userRouter = express.Router();

// User Registration Route
userRouter.post("/register", registerUser);

// ✅ Add Get Users Route
userRouter.get("/users", getAllUsers); // Ensure this function exists in the controller

export default userRouter;
