import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "../../Back-End/database-service/config/mongodb.js";
//import connectDB from 'Y:/CAA/Winter 2024/Capstone/Back-End/database-service/config/mongodb.js';
import cloudinary from "../../Back-End/database-service/config/cloudinary.js";
//import connectCloudinary from 'Y:/CAA/Winter 2024/Capstone/Back-End/database-service/config/cloudinary.js';
//import connectCloudinary from 'Y:/CAA/Winter 2024/Capstone/Back-End/database-service/config/cloudinary.js';
//const connectCloudinary = require('../../database-service/config/cloudinary.js');
import adminRouter from "./routes/adminRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4001;
connectDB();
//connectCloudinary()
console.log("Cloudinary Config Loaded:", cloudinary.config());

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/admin", adminRouter);

// localhost:4001/api/admin/add-doctor

app.get("/", (reg, res) => {
  res.send("API WORKING for admin-service");
});

app.listen(port, () => console.log("Admin-Service Server Started", port));
