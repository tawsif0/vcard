const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const About = require("../models/About");
const { auth } = require("../middlewares/auth");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/services");
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
      "service-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

// Update the fileFilter in multer configuration
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }

  // Check file extension
  const fileExt = path.extname(file.originalname).toLowerCase();
  const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

  if (!allowedExt.includes(fileExt)) {
    return cb(
      new Error("Only JPEG, PNG, GIF, WebP, and BMP images are allowed!"),
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

// Get all about data for a user
router.get("/", auth, async (req, res) => {
  try {
    let aboutData = await About.findOne({ userId: req.user.id });

    if (!aboutData) {
      // Create default about data with proper structure
      aboutData = new About({
        userId: req.user.id,
        personal: {
          name: "",
          email: "",
          phone: "",
          address: "",
          education: "",
          languages: "",
          nationality: "",
          freelance: "Available",
          description: "",
        },
        brands: [],
        pricing: [],
        services: [],
        testimonials: [],
      });
      await aboutData.save();
    }

    // Ensure data structure is consistent
    const responseData = {
      personal: aboutData.personal || {},
      brands: aboutData.brands || [],
      pricing: aboutData.pricing || [],
      services: aboutData.services || [],
      testimonials: aboutData.testimonials || [],
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching about data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update entire about document
router.put("/", auth, async (req, res) => {
  try {
    const { personal, brands, pricing, services, testimonials } = req.body;

    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          ...(personal && { personal }),
          ...(brands && { brands }),
          ...(pricing && { pricing }),
          ...(services && { services }),
          ...(testimonials && { testimonials }),
        },
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "About data updated successfully",
      data: aboutData,
    });
  } catch (error) {
    console.error("Error updating about data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update personal information
router.patch("/personal", auth, async (req, res) => {
  try {
    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { personal: req.body } },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Personal information updated successfully",
      data: aboutData.personal,
    });
  } catch (error) {
    console.error("Error updating personal information:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update brands
router.patch("/brands", auth, async (req, res) => {
  try {
    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { brands: req.body } },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Brands updated successfully",
      data: aboutData.brands,
    });
  } catch (error) {
    console.error("Error updating brands:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update pricing plans
router.patch("/pricing", auth, async (req, res) => {
  try {
    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { pricing: req.body } },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Pricing plans updated successfully",
      data: aboutData.pricing,
    });
  } catch (error) {
    console.error("Error updating pricing plans:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update services
router.patch("/services", auth, async (req, res) => {
  try {
    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { services: req.body } },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Services updated successfully",
      data: aboutData.services,
    });
  } catch (error) {
    console.error("Error updating services:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update testimonials
router.patch("/testimonials", auth, async (req, res) => {
  try {
    const aboutData = await About.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { testimonials: req.body } },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Testimonials updated successfully",
      data: aboutData.testimonials,
    });
  } catch (error) {
    console.error("Error updating testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Upload image endpoint - FIXED with proper error handling
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file type not supported",
      });
    }

    // Construct the image URL - use relative path for frontend
    const imageUrl = `/uploads/services/${req.file.filename}`;

    console.log("Image uploaded successfully:", {
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl,
    });

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
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
