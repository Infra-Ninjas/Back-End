import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

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
    console.log("Route /list-appointments hit with query:", req.query);
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: userId",
      });
    }

    console.log("Fetching appointments for userId:", userId);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments`, {
      params: { userId },
    });
    console.log("Appointment response from db-service:", appointmentResponse.data);

    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this user",
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
      return res.json({ success: false, message: "Unauthorized action" });
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

    // Release doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorResponse = await axios.get(`${dbServiceUrl}/doctors/${docId}`);
    if (!doctorResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    const doctorData = doctorResponse.data.data;
    let slots_booked = doctorData.slots_booked || {};

    // Remove the cancelled slot
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    }

    // Update doctor's slots_booked in db-service
    await axios.put(`${dbServiceUrl}/doctors/${docId}/slots`, {
      slots_booked,
    });

    res.json({ success: true, message: 'Appointment Cancelled' });
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



export { bookAppointment, listAppointment, cancelAppointment, listDoctors };