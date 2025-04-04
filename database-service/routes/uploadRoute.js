import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ✅ Correct Multer Configuration (Memory Storage for Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Get the folder from the request body or query (default to "uploads" if not specified)
    const folder = req.body.folder || req.query.folder || "uploads";

    // Convert file buffer to Base64
    const base64EncodedFile = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary with the specified folder
    console.log(`Uploading image to Cloudinary in folder: ${folder}...`);
    const imageUpload = await cloudinary.uploader.upload(base64EncodedFile, {
      folder: folder, // Use the specified folder
      resource_type: "auto",
    });

    res.json({ success: true, imageUrl: imageUpload.secure_url });
  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    res.status(500).json({ success: false, message: "Image Upload Failed" });
  }
});

export default router;