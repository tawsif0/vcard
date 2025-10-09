const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ProfileShare = require("../models/ProfileShare");
const { auth } = require("../middlewares/auth");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/profile-share");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname).toLowerCase();
    let uniqueSuffix = originalName;
    let count = 1;

    while (fs.existsSync(path.join(uploadsDir, uniqueSuffix + ext))) {
      uniqueSuffix = `${originalName}(${count})`;
      count++;
    }

    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }

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

// Get profile share data
router.get("/", auth, async (req, res) => {
  try {
    let profileShare = await ProfileShare.findOne({ userId: req.user.id });

    if (!profileShare) {
      // Create default profile share data
      profileShare = new ProfileShare({
        userId: req.user.id,
        profileData: {
          fullName: "",
          designation: "",
          profilePicture: "",
          logo: "",
          city: "",
          socialMedias: [],
          profileUrl: "",
        },
        qrSettings: {
          dotColor: "#06b6d4",
          bgColor: "transparent",
          pattern: "square",
        },
        displaySettings: {
          showAvatarInQR: true,
          showLogoInQR: false,
        },
        qrCodeImage: "",
      });
      await profileShare.save();
    }

    res.json({
      success: true,
      data: profileShare,
    });
  } catch (error) {
    console.error("Error fetching profile share data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update profile share data
router.put("/", auth, async (req, res) => {
  try {
    const { profileData, qrSettings, displaySettings, qrCodeImage } = req.body;

    const profileShare = await ProfileShare.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          ...(profileData && { profileData }),
          ...(qrSettings && { qrSettings }),
          ...(displaySettings && { displaySettings }),
          ...(qrCodeImage && { qrCodeImage }),
        },
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Profile share data updated successfully",
      data: profileShare,
    });
  } catch (error) {
    console.error("Error updating profile share data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Upload logo
router.post("/upload-logo", auth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file type not supported",
      });
    }

    const logoUrl = `/uploads/profile-share/${req.file.filename}`;

    // Update profile share with logo
    const profileShare = await ProfileShare.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          "profileData.logo": logoUrl,
          "displaySettings.showLogoInQR": true,
          "displaySettings.showAvatarInQR": false,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      logoUrl: logoUrl,
      data: profileShare,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logo upload",
      error: error.message,
    });
  }
});

// Remove logo
router.delete("/remove-logo", auth, async (req, res) => {
  try {
    const profileShare = await ProfileShare.findOne({ userId: req.user.id });

    if (profileShare && profileShare.profileData.logo) {
      // Delete the logo file from server
      const logoPath = path.join(
        __dirname,
        "..",
        profileShare.profileData.logo
      );
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    const updatedProfileShare = await ProfileShare.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          "profileData.logo": "",
          "displaySettings.showLogoInQR": false,
          "displaySettings.showAvatarInQR": true,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Logo removed successfully",
      data: updatedProfileShare,
    });
  } catch (error) {
    console.error("Error removing logo:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Save QR code as image
router.post("/save-qr", auth, async (req, res) => {
  try {
    const { qrCodeImage } = req.body;

    const profileShare = await ProfileShare.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { qrCodeImage } },
      { new: true }
    );

    res.json({
      success: true,
      message: "QR code saved successfully",
      data: profileShare,
    });
  } catch (error) {
    console.error("Error saving QR code:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Multer error handling
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
