import validator from "validator";
import bcrypt from "bcrypt";
import axios from "axios";
import FormData from "form-data";  

const DATABASE_SERVICE_URL = "http://db-service:5000/api/doctors"; // ✅ Replace with actual service URL

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
      image, // Optional image URL
    } = req.body;

    console.log("➡️ Received Doctor Data:", req.body);

    const imageFile = req.file; // Extract uploaded image file

    // 🔹 Validate required fields
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      console.error("❌ Missing required details.");
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      console.error("❌ Invalid email format.");
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      console.error("❌ Weak password (less than 8 characters).");
      return res.status(400).json({ success: false, message: "Weak Password" });
    }

    // 🔹 Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = image; // Default to provided URL

    if (imageFile) {
      // 🔹 Upload image to `database-service`
      const formData = new FormData();
      formData.append("image", imageFile.buffer, { filename: imageFile.originalname });

      try {
        console.log("📤 Uploading image...");
        const uploadResponse = await axios.post(`${DATABASE_SERVICE_URL}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.imageUrl;
          console.log("✅ Image uploaded successfully:", imageUrl);
        } else {
          console.error("❌ Image Upload Failed:", uploadResponse.data.message);
          return res.status(500).json({ success: false, message: "Image Upload Failed" });
        }
      } catch (err) {
        console.error("❌ Image Upload Error:", err.message);
        return res.status(500).json({ success: false, message: "Image Upload Error" });
      }
    }

    // 🔹 Prepare doctor data for `database-service`
    const doctorData = {
      name,
      email,
      password: hashedPassword, 
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image: imageUrl, 
      available: true,  
      slots_booked: {}, 
      date: Date.now(), 
    };

    // 🔹 Save doctor directly in database-service
    try {
      console.log("📤 Sending doctor data to Database-Service:", doctorData);
      const response = await axios.post(DATABASE_SERVICE_URL, doctorData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Database-Service Response:", response.data);

      res.status(201).json({ success: true, message: "Doctor added successfully!" });

    } catch (error) {
      console.error("❌ Database-service error:", error.response?.data || error.message);

      if (error.response?.data?.code === 11000) {
        return res.status(400).json({ success: false, message: "Doctor with this email already exists." });
      }

      res.status(500).json({ success: false, message: "Database Service Error" });
    }

  } catch (error) {
    console.error("❌ Error adding doctor:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { addDoctor };
