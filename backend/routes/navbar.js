const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Navbar = require("../models/Navbar");
const { auth } = require("../middlewares/auth");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/navbar");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "navbar-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }

  const fileExt = path.extname(file.originalname).toLowerCase();
  const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];

  if (!allowedExt.includes(fileExt)) {
    return cb(
      new Error("Only JPEG, PNG, GIF, WebP, BMP, and SVG images are allowed!"),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Get navbar for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    let navbar = await Navbar.findOne({ userId: req.user.id });

    // If no navbar exists, create a default one
    if (!navbar) {
      navbar = new Navbar({
        userId: req.user.id,
        name: "",
        logo: "",
        content: "",
      });
      await navbar.save();
    }

    res.json({
      success: true,
      navbar: navbar,
    });
  } catch (error) {
    console.error("Error fetching navbar:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Create or update navbar
router.put("/", auth, async (req, res) => {
  try {
    const { name, logo, content } = req.body;

    // Find existing navbar or create new one
    let navbar = await Navbar.findOne({ userId: req.user.id });

    if (navbar) {
      // Update existing navbar
      navbar.name = name || "";
      navbar.logo = logo || "";
      navbar.content = content || "";
      await navbar.save();
    } else {
      // Create new navbar
      navbar = new Navbar({
        userId: req.user.id,
        name: name || "",
        logo: logo || "",
        content: content || "",
      });
      await navbar.save();
    }

    res.json({
      success: true,
      message: "Navbar saved successfully",
      navbar: navbar,
    });
  } catch (error) {
    console.error("Error saving navbar:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Upload logo endpoint
router.post("/upload-logo", auth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file type not supported",
      });
    }

    const filePath = `/uploads/navbar/${req.file.filename}`;

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      filePath: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during upload",
      error: error.message,
    });
  }
});

// Delete navbar
router.delete("/", auth, async (req, res) => {
  try {
    const navbar = await Navbar.findOneAndDelete({ userId: req.user.id });

    if (!navbar) {
      return res.status(404).json({
        success: false,
        message: "Navbar not found",
      });
    }

    // Optionally delete the logo file from server
    if (navbar.logo) {
      const logoPath = path.join(__dirname, "..", navbar.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    res.json({
      success: true,
      message: "Navbar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting navbar:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

module.exports = router;
