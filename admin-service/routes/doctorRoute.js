import express from 'express'
import { allDoctors } from '../controllers/doctorController.js';

import authAdmin from '../../authentication-service/middlewares/authAdmin.js';

const doctorRouter = express.Router();

// Apply Middleware to Secure the Route
doctorRouter.post('/all-doctors', authAdmin, allDoctors);
//doctorRouter.post('/all-doctors', allDoctors);

export default doctorRouter;
