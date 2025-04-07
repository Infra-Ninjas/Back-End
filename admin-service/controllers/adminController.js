import validator from "validator";
import axios from "axios";
import FormData from "form-data";

const DATABASE_SERVICE_URL = "http://db-service:5000/api"; // Base URL for db-service (corrected from /upload-image)

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

    // 🔹 Parse the `address` field if it's a string
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
      console.log("📤 Forwarding image to `db-service` at:", `${DATABASE_SERVICE_URL}/upload-image`);
      console.log("📤 Image Details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.buffer.length,
      });
    
      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    
      try {
        const uploadResponse = await axios.post(
          `${DATABASE_SERVICE_URL}/upload-image`, // Should resolve to http://db-service:5000/api/upload-image
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
        console.error("❌ Image Upload Error Details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        return res.status(500).json({
          success: false,
          message: "Image Upload Error: " + (err.response?.data?.message || err.message),
        });
      }
    } else {
      imageUrl = "default-profile.png";
    }
    // 🔹 Prepare doctor data (send plaintext password)
    const doctorData = {
      name,
      email,
      password, // Send plaintext password, let db-service hash it
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

    // 🔹 Extract and validate the admin token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Admin token missing" });
    }

    // 🔹 Send to database service with Authorization header
    const response = await axios.post(
      "http://db-service:5000/api/doctors",
      doctorData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Forward the admin token
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

    // Calculate total revenue from completed appointments
    const completedAppointments = appointments.filter(appointment => appointment.isCompleted === true);
    console.log("Completed appointments:", completedAppointments);

    const totalRevenue = completedAppointments.reduce((sum, appointment) => {
      const revenue = appointment.amount || 0;
      console.log("Appointment revenue:", revenue); // Log each amount being added
      return sum + revenue;
    }, 0);
    console.log("Total revenue calculated:", totalRevenue);

    // Get the five most recent appointments
    const latestAppointments = appointments
      .sort((a, b) => b.date - a.date) // Sort by date in descending order (most recent first)
      .slice(0, 5); // Take the first 5
    console.log("Latest appointments:", latestAppointments);

    // Prepare dashboard data
    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      totalRevenue: totalRevenue, // Total revenue from completed appointments
      latestAppointments: latestAppointments, // Five most recent appointments
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