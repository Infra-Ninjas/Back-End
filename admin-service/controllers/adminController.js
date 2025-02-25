import validator from "validator";
import bcrypt from "bcrypt";
import axios from "axios";
import FormData from "form-data";

const DATABASE_SERVICE_URL = "http://db-service:5000/api/upload-image"; // ✅ Ensure this is correct

const addDoctor = async (req, res) => {
  try {
    console.log("📩 Incoming Request Body:", req.body); // ✅ Debugging log
    const requiredFields = [
      "name",
      "email",
      "password",
      "speciality",
      "degree",
      "experience",
      "about",
      "fees",
      "address",
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const { name, email, password, speciality, degree, experience, about, fees } = req.body;

    let { address } = req.body;

    // 🔹 Parse the `address` field if it's a string
    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid address format" });
      }
    }


    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Weak Password" });
    }

    // 🔹 Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = null;
    if (req.file) {
      console.log("📤 Forwarding image to `db-service`...");
      // 🔹 Convert file to a stream and send to `db-service`
      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    
      try {
        const uploadResponse = await axios.post(DATABASE_SERVICE_URL, formData, {
          headers: { ...formData.getHeaders() },
        });
    
        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.imageUrl;
          console.log("✅ Image Uploaded:", imageUrl);
        } else {
          return res.status(500).json({ success: false, message: "Image Upload Failed" });
        }
      } catch (err) {
        console.error("❌ Image Upload Error:", err.message);
        return res.status(500).json({ success: false, message: "Image Upload Error" });
      }
    } else {
      imageUrl = "default-profile.png"; // ✅ Fallback in case no image is provided
    }
    

    // 🔹 Prepare doctor data
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

    // 🔹 Send to database service
    const response = await axios.post("http://db-service:5000/api/doctors", doctorData, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Doctor Added:", response.data);

    res.status(201).json({ success: true, message: "Doctor added successfully!" });

  } catch (error) {
    console.error("❌ Error adding doctor:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { addDoctor };
