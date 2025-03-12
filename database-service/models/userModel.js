import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "Not Set" }, // Change to default image path if needed
  address: { type: Object, default: { line1: "", line2: "" } },
  gender: { type: String, default: "Not Selected" },
  dob: { type: String, default: "Not Selected" },
  phone: { type: String, default: "0000000000" },
  role: { type: String, enum: ["Admin", "Doctor", "Patient"], default: "Patient", required: true }, // Add role field
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;