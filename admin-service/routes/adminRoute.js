import express from 'express';
import axios from 'axios'; // Import axios to call authentication-service
import { addDoctor } from '../controllers/adminController.js';

const adminRouter = express.Router();

// ✅ Middleware to Validate JWT via Authentication Service
const authAdminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']; // Get Authorization Header
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        }

        const token = authHeader.split(' ')[1]; // Extract token

        // ✅ Call authentication-service API for token validation
        const response = await axios.post('http://authentication-service:4000/api/auth/validate-token', { token });

        if (response.data.success) {
            req.admin = response.data.admin; // Store admin details in request
            next(); // Proceed to next middleware
        } else {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }
    } catch (error) {
        console.error('Auth Error:', error.response ? error.response.data : error.message);
        return res.status(403).json({
            success: false,
            message: 'Invalid or Expired Token',
            error: error.response ? error.response.data : error.message
        });
    }
};

// ✅ Apply Middleware to Secure the Route
adminRouter.post('/add-doctor', authAdminMiddleware, addDoctor);

export default adminRouter;
