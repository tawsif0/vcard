const express = require("express");
const router = express.Router();
const About = require("../models/About");
const { auth } = require("../middlewares/auth");

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

module.exports = router;
