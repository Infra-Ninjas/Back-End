import validator from 'validator';
import bcrypt from 'bcrypt';
//import { v2 as cloudinary } from '../../database-service/config/cloudinary.js';
import cloudinary from '../../database-service/config/cloudinary.js';
import doctorModel from '../../database-service/models/doctorModel.js';

// API for adding a doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Checking for required fields
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter a Valid Email" });
        }

        // Validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter a Strong Password" });
        }

        // Hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Ensure an image is provided
        if (!imageFile) {
            return res.json({ success: false, message: "Image is required" });
        }

        // Convert image to Base64 format for Cloudinary
        const base64EncodedFile = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(base64EncodedFile, {
            folder: "doctors",
            resource_type: "auto"
        });

        const doctorData = {
            name,
            email,
            image: imageUpload.secure_url,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        };

        // Save doctor data in the database
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor Added Successfully" });

    } catch (error) {
        console.error("Error adding doctor:", error);
        res.json({ success: false, message: error.message });
    }
};

export { addDoctor };
