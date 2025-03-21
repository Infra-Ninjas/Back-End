import axios from "axios";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

const dbServiceUrl = "http://db-service:5000/api";

// List all doctors
const doctorList = async (req, res) => {
  try {
    console.log("Attempting to fetch doctors from db-service at:", `${dbServiceUrl}/doctors?format=structured`);
    const response = await axios.get(`${dbServiceUrl}/doctors`, {
      params: { format: "structured" },
    });
    console.log("Response from db-service:", response.data);

    if (!response.data.success) {
      console.log("db-service response unsuccessful:", response.data);
      return res.status(500).json({ success: false, message: "Failed to fetch doctors" });
    }

    const doctors = response.data.data;
    res.json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching doctors from db-service:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received from db-service:", error.request);
    } else {
      console.error("Error in request setup:", error.message);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// API to get doctor appointments for doctor panel
const doctorAppointments = async (req, res) => {
  try {
    console.log("Route /appointments hit with query:", req.query);
    const { docId } = req.query;
    const user = req.user; // From authDoctor middleware

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: docId",
      });
    }

    // Validate docId format
    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format",
      });
    }

    // Ensure the docId matches the authenticated doctor's ID
    if (docId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only view your own appointments",
      });
    }

    console.log("Fetching appointments for docId:", docId);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments`, {
      params: { docId },
    });
    console.log("Appointment response from db-service:", appointmentResponse.data);

    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this doctor",
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
    const { docId, appointmentId } = req.body;
    const user = req.user; // From authDoctor middleware

    // Validate request body
    if (!docId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: docId, appointmentId",
      });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format",
      });
    }
    if (!ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointmentId format",
      });
    }

    // Ensure the docId matches the authenticated doctor's ID
    if (docId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only cancel your own appointments",
      });
    }

    // Fetch appointment data from db-service
    console.log(`Fetching appointment ${appointmentId} from db-service...`);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments/${appointmentId}`);
    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const appointmentData = appointmentResponse.data.data;

    // Verify appointment belongs to the doctor
    if (appointmentData.docId !== docId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action: Appointment does not belong to this doctor",
      });
    }

    // Check if appointment is already cancelled or completed
    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }
    if (appointmentData.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
      });
    }

    // Update appointment cancelled status in db-service
    console.log(`Updating appointment ${appointmentId} to cancelled...`);
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
    const { slotDate, slotTime } = appointmentData;
    console.log(`Fetching doctor ${docId} from db-service...`);
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
      if (slots_booked[slotDate].length === 0) {
        delete slots_booked[slotDate]; // Clean up empty slot dates
      }
    }

    // Update doctor's slots_booked in db-service
    console.log(`Updating doctor's slots_booked for docId ${docId}...`);
    const updateDoctorResponse = await axios.put(`${dbServiceUrl}/doctors/${docId}/slots`, {
      slots_booked,
    });
    if (!updateDoctorResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update doctor's slots",
      });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error("Error cancelling appointment:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to complete appointment
const completeAppointment = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const user = req.user; // From authDoctor middleware

    // Validate request body
    if (!docId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: docId, appointmentId",
      });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format",
      });
    }
    if (!ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointmentId format",
      });
    }

    // Ensure the docId matches the authenticated doctor's ID
    if (docId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only complete your own appointments",
      });
    }

    // Fetch appointment data from db-service
    console.log(`Fetching appointment ${appointmentId} from db-service...`);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments/${appointmentId}`);
    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const appointmentData = appointmentResponse.data.data;

    // Verify appointment belongs to the doctor
    if (appointmentData.docId !== docId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action: Appointment does not belong to this doctor",
      });
    }

    // Check if appointment is already cancelled or completed
    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Cannot complete a cancelled appointment",
      });
    }
    if (appointmentData.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Appointment is already completed",
      });
    }

    // Update appointment completed status in db-service
    console.log(`Updating appointment ${appointmentId} to completed...`);
    const updateAppointmentResponse = await axios.put(`${dbServiceUrl}/appointments/${appointmentId}`, {
      isCompleted: true,
    });
    if (!updateAppointmentResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update appointment",
      });
    }

    res.json({ success: true, message: "Appointment Completed" });
  } catch (error) {
    console.error("Error completing appointment:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API for doctor dashboard
const doctorDashboard = async (req, res) => {
  try {
    const user = req.user; // From authDoctor middleware
    const docId = user.id; // Use authenticated doctor's ID

    // Validate docId format
    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format in token",
      });
    }

    // Fetch appointments from db-service
    console.log(`Fetching appointments for docId ${docId} from db-service...`);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments`, {
      params: { docId, sort: "-slotDate" }, // Sort by slotDate descending
    });
    console.log("Appointment response from db-service:", appointmentResponse.data);

    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this doctor",
      });
    }

    const appointments = appointmentResponse.data.data;

    // Calculate earnings
    let earnings = 0;
    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount || 0; // Fallback to 0 if amount is missing
      }
    });

    // Calculate unique patients using a Set
    const patients = new Set(appointments.map((item) => item.userId));

    // Get the 5 latest appointments (already sorted by db-service)
    const latestAppointments = appointments.slice(0, 5);

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.size,
      latestAppointments,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error.message, error.stack);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

export { doctorList, doctorAppointments, cancelAppointment, completeAppointment, doctorDashboard };