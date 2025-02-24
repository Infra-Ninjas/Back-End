import express from "express";
import cors from "cors";
import "dotenv/config";
//import connectDB from "../../Back-End/database-service/config/mongodb.js";
//import cloudinary from "../../Back-End/database-service/config/cloudinary.js";
import axios from "axios";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4001;
//connectDB();
//console.log("Cloudinary Config Loaded:", cloudinary.config());

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/admin", doctorRouter); // added new route to list doctors in admin panel

// Test Route
app.get("/", (req, res) => {
  res.send("API WORKING for admin-service");
});

// Debug Routes
app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Routes registered directly
        console.log(`Registered Route: ${middleware.route.path}`);
    } else if (middleware.name === "router") { // Routes inside a router
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                console.log(`Registered Route: ${handler.route.path}`);
            }
        });
    }
});

// Start Server
app.listen(port, () => console.log("Admin-Service Server Started", port));
