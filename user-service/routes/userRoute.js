import express from 'express'
import { registerUser } from '../controllers/userController.js';

import authAdmin from '../../authentication-service/middlewares/authAdmin.js';

const userRouter = express.Router();

// Apply Middleware to Secure the Route

userRouter.post('/register', registerUser);

export default userRouter;
