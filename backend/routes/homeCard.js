const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const HomeCard = require("../models/HomeCard");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/homecard-profile-pictures/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    let uniqueSuffix = originalName;

    let count = 1;
    while (
      fs.existsSync(
        path.join("uploads/homecard-profile-pictures", uniqueSuffix + ext)
      )
    ) {
      uniqueSuffix = originalName + `(${count})`;
      count++;
    }

    cb(null, uniqueSuffix + ext);
  },
});

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
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Get user's home card
router.get("/my-homecard", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const homeCard = await HomeCard.findOne({ userId: req.user.id }).populate(
      "userId",
      "name email"
    );

    if (!homeCard) {
      return res.status(404).json({
        message: "Home card not found",
        homeCard: null,
      });
    }

    res.json({
      message: "Home card retrieved successfully",
      homeCard,
    });
  } catch (err) {
    console.error("Error fetching home card:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// Create or update home card
router.put(
  "/my-homecard",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const {
        template,
        fullName,
        designation,
        city,
        socialMedias,
        showImage,
        templateData,
      } = req.body;

      let parsedSocialMedias = [];
      if (socialMedias) {
        parsedSocialMedias =
          typeof socialMedias === "string"
            ? JSON.parse(socialMedias)
            : socialMedias;
      }
      let parsedTemplateData = {};
      if (templateData) {
        parsedTemplateData =
          typeof templateData === "string"
            ? JSON.parse(templateData)
            : templateData;
      }
      let homeCard = await HomeCard.findOne({ userId: req.user.id });

      let profilePicturePath = homeCard?.profileData?.profilePicture;

      if (req.file) {
        if (profilePicturePath && fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
        }
        profilePicturePath = req.file.path;
      }

      if (req.body.removeProfilePicture === "true" && profilePicturePath) {
        if (fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
        }
        profilePicturePath = null;
      }

      const homeCardData = {
        userId: req.user.id,
        template: template || "influencer",
        templateData: parsedTemplateData,
        profileData: {
          fullName,
          designation,
          city,
          profilePicture: profilePicturePath,
          socialMedias: parsedSocialMedias,
        },
        showImage: showImage !== undefined ? showImage : true,
      };

      if (homeCard) {
        homeCard = await HomeCard.findOneAndUpdate(
          { userId: req.user.id },
          homeCardData,
          { new: true, runValidators: true }
        );
      } else {
        homeCard = new HomeCard(homeCardData);
        await homeCard.save();
      }

      res.json({
        message: "Home card saved successfully",
        homeCard,
      });
    } catch (err) {
      console.error("Error saving home card:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);

// Get public home card (for QR code navigation)
router.get("/public/:userId", async (req, res) => {
  try {
    const homeCard = await HomeCard.findOne({
      userId: req.params.userId,
      isActive: true,
    }).populate("userId", "name email");

    if (!homeCard) {
      return res.status(404).json({
        message: "Home card not found or not active",
      });
    }

    let profilePictureUrl = null;
    if (homeCard.profileData.profilePicture) {
      profilePictureUrl = `${req.protocol}://${req.get("host")}/${
        homeCard.profileData.profilePicture
      }`;
    }

    const publicHomeCard = {
      template: homeCard.template,
      templateData: homeCard.templateData,
      profileData: {
        fullName: homeCard.profileData.fullName,
        designation: homeCard.profileData.designation,
        city: homeCard.profileData.city,
        profilePicture: profilePictureUrl,
        socialMedias: homeCard.profileData.socialMedias,
      },
      showImage: homeCard.showImage,
      user: {
        name: homeCard.userId.name,
        email: homeCard.userId.email,
      },
    };

    res.json({
      message: "Home card retrieved successfully",
      homeCard: publicHomeCard,
    });
  } catch (err) {
    console.error("Error fetching public home card:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// Get all templates
router.get("/templates", auth, async (req, res) => {
  try {
    const templates = [
      {
        id: "influencer",
        name: "Influencer",
        description: "Modern influencer style with animated background",
      },
      {
        id: "hero",
        name: "Hero",
        description: "Clean professional hero style",
      },
      {
        id: "executive",
        name: "Executive",
        description: "Corporate executive style",
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Simple and clean design",
      },
      {
        id: "creative",
        name: "Creative",
        description: "Artistic and creative layout",
      },
      { id: "glass", name: "Glass", description: "Glass morphism effect" },
      {
        id: "neon",
        name: "Neon Glow",
        description: "Neon lights and glow effects",
      },
      {
        id: "cyberpunk",
        name: "Cyberpunk",
        description: "Futuristic cyberpunk theme",
      },
      {
        id: "luxury",
        name: "Luxury Gold",
        description: "Premium luxury gold theme",
      },
      {
        id: "minimal",
        name: "Minimal Dark",
        description: "Dark minimal aesthetic",
      },
    ];

    res.json({
      message: "Templates retrieved successfully",
      templates,
    });
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
