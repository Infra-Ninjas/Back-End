import express from "express";

const userRouter = express.Router();

// Remove registration and getAllUsers routes
// Add other user-specific routes later if needed
userRouter.get("/", (req, res) => {
  res.send("User-service placeholder");
});

export default userRouter;