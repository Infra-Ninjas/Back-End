import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose"; // Import mongoose to use ObjectId

dotenv.config();

const { ObjectId } = mongoose.Types; // Use mongoose.Types.ObjectId
const dbServiceUrl = "http://db-service:5000/api";

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // Validate request body
    if (!userId || !docId || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, docId, slotDate, slotTime",
      });
    }

    // Fetch doctor data from db-service
    const docResponse = await axios.get(`${dbServiceUrl}/doctors/${docId}`);
    if (!docResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    const docData = docResponse.data.data;

    // Check doctor availability
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    // Check slot availability
    let slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Update slots_booked
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
    slots_booked[slotDate].push(slotTime);

    // Fetch user data from db-service
    const userResponse = await axios.get(`${dbServiceUrl}/users/${userId}`);
    if (!userResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userData = userResponse.data.data;

    // Prepare appointment data
    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData: { ...docData, slots_booked: undefined }, // Remove slots_booked from docData
      amount: docData.fees,
      date: Date.now(),
    };

    // Save appointment to db-service
    const appointmentResponse = await axios.post(
      `${dbServiceUrl}/appointments`,
      appointmentData
    );
    if (!appointmentResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to save appointment",
      });
    }

    // Update doctor's slots_booked in db-service
    await axios.put(`${dbServiceUrl}/doctors/${docId}/slots`, {
      slots_booked,
    });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error("Error booking appointment:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const user = req.user; // From authUser middleware
    const userId = user.id; // Use authenticated user's ID

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format in token",
      });
    }

    // Fetch non-cancelled appointments for userId from db-service
    console.log("Fetching non-cancelled appointments for userId:", userId);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments`, {
      params: {
        userId,
        cancelled: false, // Filter out cancelled appointments
      },
    });
    console.log("Appointment response from db-service:", appointmentResponse.data);

    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No active appointments found for this user",
      });
    }

    const appointments = appointmentResponse.data.data;
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error.message, error.response?.data);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    // Validate request body
    if (!userId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, appointmentId",
      });
    }

    // Fetch appointment data from db-service
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments/${appointmentId}`);
    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const appointmentData = appointmentResponse.data.data;

    // Verify appointment user
    if (appointmentData.userId !== userId) {
      return res.status(403).json({ // Changed to 403 for unauthorized
        success: false,
        message: "Unauthorized action",
      });
    }

    // Check if appointment is already cancelled
    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    // Check if appointment is completed
    if (appointmentData.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
      });
    }

    // Update appointment cancelled status in db-service
    const updateAppointmentResponse = await axios.put(`${dbServiceUrl}/appointments/${appointmentId}`, {
      cancelled: true,
    });
    if (!updateAppointmentResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update appointment",
      });
    }

    // Send success response
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.error("Error cancelling appointment:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to list all doctors for the user
const listDoctors = async (req, res) => {
  try {
    console.log("📩 Fetching doctors from `db-service` for user...");

    // Pass query parameters (e.g., available) to db-service
    const response = await axios.get(`${dbServiceUrl}/doctors`, {
      params: { available: true }, // Only fetch available doctors
    });

    if (!response.data.success) {
      return res.status(404).json({
        success: false,
        message: "No doctors found",
      });
    }

    res.status(200).json({ success: true, doctors: response.data.data });
  } catch (error) {
    console.error("❌ Error fetching doctors for user:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Server error",
    });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const user = req.user; // From authUser middleware
    const userId = user.id; // Use authenticated user's ID

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format in token",
      });
    }

    // Fetch user data from db-service
    console.log(`Fetching profile for userId: ${userId} from db-service...`);
    const userResponse = await axios.get(`${dbServiceUrl}/users/${userId}`);
    if (!userResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userResponse.data.data;
    res.json({ success: true, userData });
  } catch (error) {
    console.error("Error fetching user profile:", error.message, error.response?.data);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const user = req.user; // From authUser middleware
    const userId = user.id; // Use authenticated user's ID
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file; // From multer middleware

    // Validate required fields
    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, phone, dob, gender",
      });
    }

    // Validate dob format (e.g., YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth format (use YYYY-MM-DD)",
      });
    }

    // Validate phone format (e.g., 123-456-7890)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format (use 123-456-7890)",
      });
    }

    // Validate ObjectId format for userId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format in token",
      });
    }

    // Prepare profile data to update
    const profileData = {
      name,
      phone,
      address: address ? JSON.parse(address) : undefined, // Parse address if provided
      dob,
      gender,
    };

    // If an image is provided, upload it to db-service
    let imageUrl = null;
    if (imageFile) {
      console.log("Uploading image to db-service...");
      console.log("req.file contents:", imageFile);

      // Check if buffer exists
      if (!imageFile.buffer) {
        return res.status(400).json({
          success: false,
          message: "Image file buffer is missing",
        });
      }

      // Convert the buffer to a Blob
      const blob = new Blob([imageFile.buffer], { type: imageFile.mimetype });

      const formData = new FormData();
      formData.append("image", blob, imageFile.originalname); // Use Blob and filename
      formData.append("folder", "users"); // Specify the "users" folder for user profile images

      const imageResponse = await axios.post(`${dbServiceUrl}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!imageResponse.data.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
        });
      }

      imageUrl = imageResponse.data.imageUrl;
      profileData.image = imageUrl; // Add image URL to profile data
    }

    // Update user profile in db-service
    console.log(`Updating profile for userId: ${userId} in db-service...`);
    const updateResponse = await axios.put(`${dbServiceUrl}/users/${userId}`, profileData);
    if (!updateResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: updateResponse.data.message || "Failed to update profile",
      });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Error updating user profile:", error.message, error.response?.data);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

export { bookAppointment, listAppointment, cancelAppointment, listDoctors, getProfile, updateProfile };