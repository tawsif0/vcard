const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const User = require("../models/User");

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
router.put("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if the logged-in user is the owner
    if (user._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this profile" });
    }

    // Update profile fields
    user.profile = {
      ...user.profile,
      ...req.body
    };

    await user.save();
    res.json(user.profile);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Public route to get user's profile for QR scanning
router.get("/public/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("profile");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return only necessary data for the card
    const cardData = {
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
      avatar: user.profile.avatar
    };

    res.json(cardData);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
