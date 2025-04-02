import axios from "axios";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

const dbServiceUrl = "http://db-service:5000/api";
const authServiceUrl =  "http://authentication-service:4000/api";

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
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure db-service is running and accessible at:", dbServiceUrl);
    }
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

    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format",
      });
    }

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
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure db-service is running and accessible at:", dbServiceUrl);
    }
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
    const user = req.user;

    if (!docId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: docId, appointmentId",
      });
    }

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

    if (docId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only cancel your own appointments",
      });
    }

    console.log(`Fetching appointment ${appointmentId} from db-service...`);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments/${appointmentId}`);
    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const appointmentData = appointmentResponse.data.data;

    if (appointmentData.docId !== docId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action: Appointment does not belong to this doctor",
      });
    }

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

    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
      if (slots_booked[slotDate].length === 0) {
        delete slots_booked[slotDate];
      }
    }

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
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure db-service is running and accessible at:", dbServiceUrl);
    }
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
    const user = req.user;

    if (!docId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: docId, appointmentId",
      });
    }

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

    if (docId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only complete your own appointments",
      });
    }

    console.log(`Fetching appointment ${appointmentId} from db-service...`);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments/${appointmentId}`);
    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const appointmentData = appointmentResponse.data.data;

    if (appointmentData.docId !== docId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action: Appointment does not belong to this doctor",
      });
    }

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
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure db-service is running and accessible at:", dbServiceUrl);
    }
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API for doctor dashboard
const doctorDashboard = async (req, res) => {
  try {
    const user = req.user;
    const docId = user.id;

    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format in token",
      });
    }

    console.log(`Fetching appointments for docId ${docId} from db-service...`);
    const appointmentResponse = await axios.get(`${dbServiceUrl}/appointments`, {
      params: { docId, sort: "-slotDate" },
    });
    console.log("Appointment response from db-service:", appointmentResponse.data);

    if (!appointmentResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this doctor",
      });
    }

    const appointments = appointmentResponse.data.data;

    let earnings = 0;
    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount || 0;
      }
    });

    const patients = new Set(appointments.map((item) => item.userId));
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
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure db-service is running and accessible at:", dbServiceUrl);
    }
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;
    const user = req.user;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: docId",
      });
    }

    if (!ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid docId format",
      });
    }

    if (docId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only update your own profile",
      });
    }

    const updateData = {};
    if (fees !== undefined) updateData.fees = Number(fees);
    if (available !== undefined) updateData.available = available === true || available === "true";

    // Handle the nested address field
    if (address !== undefined) {
      // Check if address is an object with the required subfields
      if (typeof address !== "object" || address === null) {
        return res.status(400).json({
          success: false,
          message: "Address must be an object with street, city, state, and zip fields",
        });
      }

      const { street, city, state, zip } = address;

      // Validate required subfields
      if (!street || !city || !state || !zip) {
        return res.status(400).json({
          success: false,
          message: "Address object must include street, city, state, and zip",
        });
      }

      // Assign the nested address object
      updateData.address = { street, city, state, zip };
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    console.log(`Updating doctor profile for docId ${docId} at db-service...`);
    console.log(`Request URL: ${dbServiceUrl}/doctors/${docId}`);
    console.log(`Update Data: ${JSON.stringify(updateData)}`);
    const updateResponse = await axios.put(`${dbServiceUrl}/doctors/${docId}`, updateData);

    if (!updateResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: updateResponse.data.message || "Failed to update profile",
      });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Error updating doctor profile:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure db-service is running and accessible at:", dbServiceUrl);
    }
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

// API for doctor login (forward to authentication-service)
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email and password are required",
      });
    }

    // Forward the login request to authentication-service
    console.log(`Forwarding login request for email ${email} to authentication-service...`);
    const authResponse = await axios.post(`${authServiceUrl}/api/doctor/login`, {
      email,
      password,
    });

    // Return the response from authentication-service
    res.status(authResponse.status).json(authResponse.data);
  } catch (error) {
    console.error("Error during doctor login:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused. Ensure authentication-service is running and accessible at:", authServiceUrl);
    }
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      // Forward the error response from authentication-service
      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error("No response received from authentication-service:", error.request);
    } else {
      console.error("Error in request setup:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// API to get doctor profile data
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = req.doctor; // Assuming this comes from an authDoctor middleware
    const doctorId = doctor.id; // Use authenticated doctor's ID

    // Validate ObjectId format
    if (!ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctorId format in token",
      });
    }

    // Fetch doctor data from db-service
    console.log(`Fetching profile for doctorId: ${doctorId} from db-service...`);
    const doctorResponse = await axios.get(`${dbServiceUrl}/doctors/${doctorId}`);
    if (!doctorResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const doctorData = doctorResponse.data.data;
    
    // Optionally remove sensitive fields if needed
    const { slots_booked, ...profileData } = doctorData; // Remove slots_booked from response if not needed
    
    res.json({ 
      success: true, 
      doctorData: profileData 
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error.message, error.response?.data);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};

export { doctorList, doctorAppointments, cancelAppointment, completeAppointment, doctorDashboard, updateDoctorProfile, doctorLogin, getDoctorProfile };