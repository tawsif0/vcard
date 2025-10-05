const router = require("express").Router();
const Portfolio = require("../models/Portfolio");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for portfolio image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/portfolio/";
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
    while (fs.existsSync(path.join("uploads/portfolio", uniqueSuffix + ext))) {
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

// Helper function for error handling
function sendError(res, status = 500, msg = "Server error") {
  return res.status(status).json({ msg });
}

// ========== UPLOAD IMAGE ROUTE ==========
router.post("/upload-image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "No file uploaded");
    }

    const filePath = `/uploads/portfolio/${req.file.filename}`;
    
    res.json({
      msg: "Image uploaded successfully",
      filePath: filePath,
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    sendError(res, 500, "Server error during upload");
  }
});

// ========== GET COMPLETE PORTFOLIO ==========
router.get("/", auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({
        user: req.user.id,
        categories: [],
        projects: [],
        isPublished: false,
        settings: {
          template: "modern",
          colorScheme: "purple",
          layout: "grid"
        }
      });
      await portfolio.save();
    }
    
    return res.json(portfolio);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    return sendError(res);
  }
});

// ========== CATEGORIES CRUD ==========

// GET categories
router.get("/categories", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    return res.json({ categories: portfolio?.categories || [] });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return sendError(res);
  }
});

// POST categories - Add new category
router.post("/categories", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return sendError(res, 400, "Category name is required");
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    // Check for duplicate category names
    const existingCategory = portfolio.categories.find(
      cat => cat.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (existingCategory) {
      return sendError(res, 400, "Category with this name already exists");
    }

    const newCategory = {
      name: name.trim(),
      createdAt: new Date()
    };

    portfolio.categories.push(newCategory);
    await portfolio.save();

    const savedCategory = portfolio.categories[portfolio.categories.length - 1];
    
    return res.json({ 
      msg: "Category added successfully", 
      category: savedCategory
    });
  } catch (err) {
    console.error("Error adding category:", err);
    return sendError(res);
  }
});

// PUT categories - Update specific category
router.put("/categories/:catId", auth, async (req, res) => {
  try {
    const { catId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return sendError(res, 400, "Category name is required");
    }

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return sendError(res, 404, "Portfolio not found");

    const category = portfolio.categories.id(catId);
    if (!category) return sendError(res, 404, "Category not found");

    // Check for duplicate category names (excluding current category)
    const existingCategory = portfolio.categories.find(
      cat => cat.name.toLowerCase() === name.trim().toLowerCase() && cat._id.toString() !== catId
    );
    
    if (existingCategory) {
      return sendError(res, 400, "Another category with this name already exists");
    }

    category.name = name.trim();
    await portfolio.save();

    const updatedCategory = portfolio.categories.id(catId);
    
    return res.json({ 
      msg: "Category updated successfully", 
      category: updatedCategory 
    });
  } catch (err) {
    console.error("Error updating category:", err);
    return sendError(res);
  }
});

// DELETE categories - Remove category
router.delete("/categories/:catId", auth, async (req, res) => {
  try {
    const { catId } = req.params;

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return sendError(res, 404, "Portfolio not found");

    const category = portfolio.categories.id(catId);
    if (!category) return sendError(res, 404, "Category not found");

    // Check if category is being used in any projects
    const projectsUsingCategory = portfolio.projects.filter(
      project => project.category === category.name
    );
    
    if (projectsUsingCategory.length > 0) {
      return sendError(res, 400, `Cannot delete category. It is being used in ${projectsUsingCategory.length} project(s).`);
    }

    portfolio.categories.pull({ _id: catId });
    await portfolio.save();

    return res.json({ msg: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    return sendError(res);
  }
});

// ========== PROJECTS CRUD ==========

// GET projects
router.get("/projects", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    return res.json({ projects: portfolio?.projects || [] });
  } catch (err) {
    console.error("Error fetching projects:", err);
    return sendError(res);
  }
});

// POST projects - Add new project
router.post("/projects", auth, async (req, res) => {
  try {
    const {
      title,
      projectType,
      category,
      client,
      duration,
      budget,
      description,
      image,
      technologies,
      status
    } = req.body;

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    const newProject = {
      title: title || "",
      projectType: projectType || "",
      category: category || "",
      client: client || "",
      duration: duration || "",
      budget: budget || "",
      description: description || "",
      image: image || "",
      technologies: technologies || [],
      status: status || "planning"
    };

    portfolio.projects.push(newProject);
    await portfolio.save();

    const savedProject = portfolio.projects[portfolio.projects.length - 1];
    
    return res.json({ 
      msg: "Project added successfully", 
      project: savedProject
    });
  } catch (err) {
    console.error("Error adding project:", err);
    return sendError(res);
  }
});

// In the PUT projects route, add image file deletion when image is removed
router.put("/projects/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return sendError(res, 404, "Portfolio not found");

    const project = portfolio.projects.id(projectId);
    if (!project) return sendError(res, 404, "Project not found");

    // Check if image is being removed
    if (updateData.image === "" && project.image && project.image.startsWith('/uploads/portfolio/')) {
      const imagePath = path.join(__dirname, '..', project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        project[key] = updateData[key];
      }
    });

    await portfolio.save();

    const updatedProject = portfolio.projects.id(projectId);
    
    return res.json({ 
      msg: "Project updated successfully", 
      project: updatedProject 
    });
  } catch (err) {
    console.error("Error updating project:", err);
    return sendError(res);
  }
});

// DELETE projects - Remove project
router.delete("/projects/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return sendError(res, 404, "Portfolio not found");

    const project = portfolio.projects.id(projectId);
    if (!project) return sendError(res, 404, "Project not found");

    // Delete associated image file if exists
    if (project.image && project.image.startsWith('/uploads/portfolio/')) {
      const imagePath = path.join(__dirname, '..', project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    portfolio.projects.pull({ _id: projectId });
    await portfolio.save();

    return res.json({ msg: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    return sendError(res);
  }
});

// ========== PORTFOLIO SETTINGS ==========
router.put("/settings", auth, async (req, res) => {
  try {
    const { template, colorScheme, layout } = req.body;

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return sendError(res, 404, "Portfolio not found");

    // Update settings
    if (template !== undefined) portfolio.settings.template = template;
    if (colorScheme !== undefined) portfolio.settings.colorScheme = colorScheme;
    if (layout !== undefined) portfolio.settings.layout = layout;

    await portfolio.save();

    return res.json({ 
      msg: "Portfolio settings updated successfully", 
      settings: portfolio.settings 
    });
  } catch (err) {
    console.error("Error updating portfolio settings:", err);
    return sendError(res);
  }
});

// ========== PUBLISH PORTFOLIO ==========
router.put("/publish", auth, async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    if (typeof isPublished !== 'boolean') {
      return sendError(res, 400, "isPublished must be a boolean");
    }

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) return sendError(res, 404, "Portfolio not found");

    portfolio.isPublished = isPublished;
    portfolio.lastUpdated = new Date();
    await portfolio.save();

    return res.json({ 
      msg: `Portfolio ${isPublished ? 'published' : 'unpublished'} successfully`, 
      isPublished 
    });
  } catch (err) {
    console.error("Error updating publish status:", err);
    return sendError(res);
  }
});

// ========== PUBLIC PORTFOLIO ==========
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const portfolio = await Portfolio.findOne({ 
      user: userId, 
      isPublished: true 
    }).populate("user", "name email profile");
    
    if (!portfolio) {
      return sendError(res, 404, "Portfolio not found or not published");
    }
    
    return res.json(portfolio);
  } catch (err) {
    console.error("Error fetching public portfolio:", err);
    return sendError(res);
  }
});

// ========== BULK OPERATIONS ==========

// Save all categories at once
router.post("/categories/bulk", auth, async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return sendError(res, 400, "Categories must be an array");
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.categories = categories.map(cat => ({
      name: cat.name.trim(),
      createdAt: cat.createdAt || new Date()
    }));

    await portfolio.save();

    return res.json({ 
      msg: "Categories saved successfully", 
      categories: portfolio.categories 
    });
  } catch (err) {
    console.error("Error saving categories:", err);
    return sendError(res);
  }
});

// Save all projects at once
router.post("/projects/bulk", auth, async (req, res) => {
  try {
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return sendError(res, 400, "Projects must be an array");
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.projects = projects.map(proj => ({
      title: proj.title || "",
      projectType: proj.projectType || "",
      category: proj.category || "",
      client: proj.client || "",
      duration: proj.duration || "",
      budget: proj.budget || "",
      description: proj.description || "",
      image: proj.image || "",
      technologies: proj.technologies || [],
      status: proj.status || "planning",
      createdAt: proj.createdAt || new Date()
    }));

    await portfolio.save();

    return res.json({ 
      msg: "Projects saved successfully", 
      projects: portfolio.projects 
    });
  } catch (err) {
    console.error("Error saving projects:", err);
    return sendError(res);
  }
});

module.exports = router;