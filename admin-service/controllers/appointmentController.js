import axios from "axios";
import { ObjectId } from "mongodb"; // Import ObjectId for validation

const DATABASE_SERVICE_URL = "http://db-service:5000/api"; // Base URL for db-service

const appointmentsAdmin = async (req, res) => {
  try {
    console.log("📩 Fetching appointments from `db-service` for admin...");

    const response = await axios.get(`${DATABASE_SERVICE_URL}/appointments`);

    if (!response.data.success) {
      return res.status(404).json({
        success: false,
        message: response.data.message || "No appointments found",
      });
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error fetching appointments for admin:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Server error",
    });
  }
};

// API to cancel appointment
const appointmentCancel = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: appointmentId",
      });
    }

    if (!ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointmentId format",
      });
    }

    console.log(`Fetching appointment ${appointmentId} from db-service...`);
    const appointmentResponse = await axios.get(`${DATABASE_SERVICE_URL}/appointments/${appointmentId}`);
    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const appointmentData = appointmentResponse.data.data;

    console.log(`Updating appointment ${appointmentId} to cancelled...`);
    const updateAppointmentResponse = await axios.put(`${DATABASE_SERVICE_URL}/appointments/${appointmentId}`, {
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
    console.log(`Fetching doctor ${docId} from db-service...`);
    const doctorResponse = await axios.get(`${DATABASE_SERVICE_URL}/doctors/${docId}`);
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

    console.log(`Updating doctor ${docId} slots_booked in db-service...`);
    const doctorUpdateResponse = await axios.put(`${DATABASE_SERVICE_URL}/doctors/${docId}/slots`, {
      slots_booked,
    });
    if (!doctorUpdateResponse.data.success) {
      console.error("Failed to update doctor slots, but appointment was cancelled.");
      return res.status(500).json({
        success: false,
        message: "Failed to update doctor slots",
      });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(`Error cancelling appointment ${appointmentId}:`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

export { appointmentsAdmin, appointmentCancel };