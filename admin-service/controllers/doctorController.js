import axios from "axios";

const DATABASE_SERVICE_URL = "http://db-service:5000/api/doctors"; // ✅ Ensure the correct service name

export const allDoctors = async (req, res) => {
  try {
    console.log("📩 Fetching doctors from `db-service`...");

    // 🔹 Send GET request to `db-service`
    const response = await axios.get(DATABASE_SERVICE_URL);

    // 🔹 Forward response from `db-service` to client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
