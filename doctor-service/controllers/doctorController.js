import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const dbServiceUrl = "http://db-service:5000/api";

// List all doctors
const doctorList = async (req, res) => {
  try {
    // Fetch all doctors from db-service with structured format
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

export { doctorList };