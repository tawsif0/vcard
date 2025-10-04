const express = require("express");
const router = express.Router();
const BlogCategory = require("../models/BlogCategory");
const { auth } = require("../middlewares/auth");

// Get all blog categories for a user
router.get("/", auth, async (req, res) => {
  try {
    const categories = await BlogCategory.find({ userId: req.user.id }).sort({
      id: 1,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Create new blog category
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Find the highest id to auto-increment
    const highestCategory = await BlogCategory.findOne({ userId: req.user.id })
      .sort({ id: -1 })
      .limit(1);

    const newId = highestCategory ? highestCategory.id + 1 : 1;

    // Check if category name already exists for this user
    const existingCategory = await BlogCategory.findOne({
      userId: req.user.id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Blog category already exists",
      });
    }

    const category = new BlogCategory({
      userId: req.user.id,
      id: newId,
      name: name.trim(),
    });

    await category.save();

    res.json({
      success: true,
      message: "Blog category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error creating blog category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update blog categories array
router.patch("/", auth, async (req, res) => {
  try {
    const categories = req.body;

    // Delete all existing categories for this user
    await BlogCategory.deleteMany({ userId: req.user.id });

    // Insert new categories with user ID
    const categoriesWithUserId = categories.map((category) => ({
      ...category,
      userId: req.user.id,
    }));

    const result = await BlogCategory.insertMany(categoriesWithUserId);

    res.json({
      success: true,
      message: "Blog categories updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating blog categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update single blog category
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await BlogCategory.findOneAndUpdate(
      { id: parseInt(id), userId: req.user.id },
      { $set: { name: name.trim() } },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    res.json({
      success: true,
      message: "Blog category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating blog category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Delete blog category
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findOneAndDelete({
      id: parseInt(id),
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    res.json({
      success: true,
      message: "Blog category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
