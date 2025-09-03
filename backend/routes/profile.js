const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profile-pictures/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name; // Get original file name without extension
    const ext = path.extname(file.originalname); // Get file extension
    let uniqueSuffix = originalName; // Start with original name

    // Check if file with the same name exists and generate a new name if it does
    let count = 1;
    while (
      fs.existsSync(path.join("uploads/profile-pictures", uniqueSuffix + ext))
    ) {
      uniqueSuffix = originalName + `(${count})`; // Append (1), (2), etc.
      count++;
    }

    cb(null, uniqueSuffix + ext); // Save with the unique name
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
// Get user profile
router.get("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("profile");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.profile || {});
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Update user profile
router.put(
  "/:userId",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ msg: "User not found" });

      if (user._id.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ msg: "Not authorized to update this profile" });
      }

      // Handle profile picture removal
      if (req.body.profilePicture === "") {
        // Delete old profile picture if exists
        if (user.profile.profilePicture) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            user.profile.profilePicture
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        req.body.profilePicture = "";
      }
      // If a new profile picture is uploaded
      else if (req.file) {
        // Delete old profile picture if exists
        if (user.profile.profilePicture) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            user.profile.profilePicture
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Update profile picture path
        req.body.profilePicture = req.file.path;
      }

      // Handle avatar options
      if (req.body.avatarOption === "robot") {
        req.body.avatar = `https://gravatar.com/avatar/${req.params.userId}?s=400&d=robohash&r=x`;
      } else if (req.body.avatarOption === "cat") {
        req.body.avatar = `https://robohash.org/${req.params.userId}?set=set4&bgset=bg1&size=400x400`;
      } else if (req.body.avatarOption === "custom") {
        req.body.avatar = req.body.avatarCustomUrl;
      } else if (req.body.avatarOption === "none") {
        req.body.avatar = "";
      }

      // Update profile fields
      user.profile = {
        ...user.profile,
        ...req.body,
      };

      await user.save();
      res.json(user.profile);
    } catch (err) {
      res.status(500).send("Server error: " + err.message);
    }
  }
);
router.delete("/:userId/picture", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this profile" });
    }

    // Delete the profile picture file if it exists
    if (user.profile.profilePicture) {
      const imagePath = path.join(__dirname, "..", user.profile.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Clear the profile picture field
      user.profile.profilePicture = "";
      await user.save();
    }

    res.json({ msg: "Profile picture deleted successfully" });
  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
});
// Public route to get user's profile for QR scanning
router.get("/public/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("profile");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return only necessary data for the card
    const cardData = {
      userType: user.profile.userType,
      fullName: user.profile.fullName,
      jobTitle: user.profile.jobTitle,
      department: user.profile.department,
      company: user.profile.company,
      phone: user.profile.phone,
      email: user.profile.email,
      website: user.profile.website,
      linkedin: user.profile.linkedin,
      facebook: user.profile.facebook,
      bio: user.profile.bio,
      avatar: user.profile.avatar,
      profilePicture: user.profile.profilePicture,

      // Student specific
      institutionName: user.profile.institutionName,
      aimInLife: user.profile.aimInLife,
      hobby: user.profile.hobby,

      // Businessman specific
      businessName: user.profile.businessName,
      businessType: user.profile.businessType,
      position: user.profile.position,

      // Official specific
      officialPosition: user.profile.officialPosition,
    };

    res.json(cardData);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
