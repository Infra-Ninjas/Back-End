import validator from "validator";
import bcrypt from "bcrypt";
//import { v2 as cloudinary } from '../../database-service/config/cloudinary.js';
import cloudinary from "../../database-service/config/cloudinary.js";
import doctorModel from "../../database-service/models/doctorModel.js";
import axios from "axios";

const DATABASE_SERVICE_URL = "http://localhost:5000/api/doctors";

// API for adding a doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image, // Accept image URL from request
    } = req.body;

    const imageFile = req.file;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      (!imageFile && !image) // Ensure either file or URL is provided
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Weak Password" });
    }

    // Hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = image; // Use provided image URL

    if (imageFile) {
      // Convert file to Base64
      const base64EncodedFile = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

      // Upload to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(base64EncodedFile, {
        folder: "doctors",
        resource_type: "auto",
      });

      imageUrl = imageUpload.secure_url; // Set uploaded image URL
    }

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    // Save doctor data
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added Successfully" });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.json({ success: false, message: error.message });
  }
};

export { addDoctor };
