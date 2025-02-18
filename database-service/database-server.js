import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
//import connectCloudinary from './config/cloudinary.js';
import cloudinary from './config/cloudinary.js';
// app config
const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(express.json())
app.use(cors())
connectDB()
//connectCloudinary()
console.log("Cloudinary Config Loaded:", cloudinary.config());

// api endpoints
app.get('/',(reg,res)=>{
    res.send('API WORKING for database-service')
    })
    
    app.listen(port, ()=> console.log("Database-service Server Started",port))
