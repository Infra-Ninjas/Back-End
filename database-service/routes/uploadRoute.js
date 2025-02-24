import express from "express";
import upload from "../middlewares/multer.js"; // Use multer inside database-service
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    // Convert file to Base64
    const base64EncodedFile = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(base64EncodedFile, {
      folder: "doctors",
      resource_type: "auto",
    });

    res.json({ success: true, imageUrl: imageUpload.secure_url });
  } catch (error) {
    console.error("Image upload error:", error);
    res.json({ success: false, message: error.message });
  }
});

export default router;
