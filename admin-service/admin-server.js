import express from "express";
import cors from "cors";
import "dotenv/config";
import axios from "axios"; // ✅ Fixed typo
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4001;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Allow form-data parsing
//app.use(upload.none()); // ✅ Allows form-data without files
app.use(cors());

// API Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctors", doctorRouter); // ✅ Changed the prefix for doctors

// Test Route
app.get("/", (req, res) => {
  res.send("API WORKING for admin-service");
});

// Debug Routes (List all registered routes)
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`Registered Route: ${middleware.route.path}`);
  } else if (middleware.name === "router") {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`Registered Route: ${handler.route.path}`);
      }
    });
  }
});

// Start Server
app.listen(port, () =>
  console.log(`✅ Admin-Service Server Started on port ${port}`)
);
