import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import adminRouter from './routes/adminRoute.js';

// app config
const app = express()
const port = process.env.PORT || 4000

// middlewares
app.use(express.json())

// Fix: Configure CORS properly
app.use(cors({
    origin: '*',  // Allow all origins (use specific frontend URL in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Fix: Allow external connections to the backend
app.listen(port, '0.0.0.0', () => console.log(`Authentication-service Server Started on port ${port}`));

// api endpoints
app.use('/api/admin', adminRouter)

app.get('/', (req, res) => {
    res.send('API WORKING for authentication-service')
});
