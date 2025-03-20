import validator from "validator";
import axios from "axios";
import FormData from "form-data";

const DATABASE_SERVICE_URL = "http://db-service:5000/api"; // Base URL for db-service (corrected from /upload-image)

const addDoctor = async (req, res) => {
  try {
    console.log("📩 Incoming Request Body:", req.body);

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

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
    } = req.body;

    let { address } = req.body;

    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid address format" });
      }
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Weak Password" });
    }

    let imageUrl = null;
    if (req.file) {
      console.log("📤 Forwarding image to `db-service`...");
      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      try {
        const uploadResponse = await axios.post(
          `${DATABASE_SERVICE_URL}/upload-image`, // Use the correct endpoint
          formData,
          {
            headers: { ...formData.getHeaders() },
          }
        );

        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.imageUrl;
          console.log("✅ Image Uploaded:", imageUrl);
        } else {
          return res
            .status(500)
            .json({ success: false, message: "Image Upload Failed" });
        }
      } catch (err) {
        console.error("❌ Image Upload Error:", err.message);
        return res
          .status(500)
          .json({ success: false, message: "Image Upload Error" });
      }
    } else {
      imageUrl = "default-profile.png";
    }

    const doctorData = {
      name,
      email,
      password,
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

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Admin token missing" });
    }

    const response = await axios.post(
      `${DATABASE_SERVICE_URL}/doctors`,
      doctorData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Doctor Added:", response.data);

    res
      .status(201)
      .json({ success: true, message: "Doctor added successfully!" });
  } catch (error) {
    console.error("❌ Error adding doctor:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    // Fetch doctors from db-service
    console.log("Fetching doctors from db-service...");
    const doctorsResponse = await axios.get(`${DATABASE_SERVICE_URL}/doctors`);
    if (!doctorsResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No doctors found",
      });
    }
    const doctors = doctorsResponse.data.data;

    // Fetch users from db-service
    console.log("Fetching users from db-service...");
    const usersResponse = await axios.get(`${DATABASE_SERVICE_URL}/users`);
    if (!usersResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    const users = usersResponse.data.data;

    // Fetch appointments from db-service
    console.log("Fetching appointments from db-service...");
    const appointmentsResponse = await axios.get(`${DATABASE_SERVICE_URL}/appointments`);
    if (!appointmentsResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No appointments found",
      });
    }
    const appointments = appointmentsResponse.data.data;

    // Prepare dashboard data
    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5), // Get the 5 most recent appointments
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

export { addDoctor, adminDashboard };