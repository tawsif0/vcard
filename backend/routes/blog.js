const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Blog = require("../models/Blog");
const { auth } = require("../middlewares/auth");

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/blogs");
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
      "blog-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
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

// Get all blogs for a user
router.get("/", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ userId: req.user.id }).sort({ id: 1 });

    res.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Create new blog
router.post("/", auth, async (req, res) => {
  try {
    const { title, image, category, content, excerpt, date } = req.body;

    // Find the highest id to auto-increment
    const highestBlog = await Blog.findOne({ userId: req.user.id })
      .sort({ id: -1 })
      .limit(1);

    const newId = highestBlog ? highestBlog.id + 1 : 1;

    const blog = new Blog({
      userId: req.user.id,
      id: newId,
      title,
      image,
      category,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      date: date || new Date().toISOString().split("T")[0],
    });

    await blog.save();

    res.json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update blogs array
router.patch("/", auth, async (req, res) => {
  try {
    const blogs = req.body;

    // Delete all existing blogs for this user
    await Blog.deleteMany({ userId: req.user.id });

    // Insert new blogs with user ID
    const blogsWithUserId = blogs.map((blog) => ({
      ...blog,
      userId: req.user.id,
    }));

    const result = await Blog.insertMany(blogsWithUserId);

    res.json({
      success: true,
      message: "Blogs updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update single blog - Support both MongoDB _id and numeric id
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let blog;

    // Check if id is a MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Use MongoDB _id
      blog = await Blog.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      // Use numeric id
      blog = await Blog.findOneAndUpdate(
        { id: parseInt(id), userId: req.user.id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Delete blog - Support both MongoDB _id and numeric id
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    let blog;

    // Check if id is a MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Use MongoDB _id
      blog = await Blog.findOneAndDelete({
        _id: id,
        userId: req.user.id,
      });
    } else {
      // Use numeric id
      blog = await Blog.findOneAndDelete({
        id: parseInt(id),
        userId: req.user.id,
      });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Upload image endpoint
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file type not supported",
      });
    }

    const imageUrl = `/uploads/blogs/${req.file.filename}`;

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
