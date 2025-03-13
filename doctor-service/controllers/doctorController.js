import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const dbServiceUrl = "http://db-service:5000/api";

// List all doctors
const doctorList = async (req, res) => {
  try {
    // Fetch all doctors from db-service
    const response = await axios.get(`${dbServiceUrl}/doctors`);

    if (!response.data.success) {
      return res.status(500).json({ success: false, message: "Failed to fetch doctors" });
    }

    const doctors = response.data.data;
    res.json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { doctorList };