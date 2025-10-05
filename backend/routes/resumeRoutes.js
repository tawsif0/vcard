const router = require("express").Router();
const Resume = require("../models/Resume");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for resume file uploads (logos, images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/resume/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    let uniqueSuffix = originalName;
    
    // Check if file with the same name exists and generate a new name if it does
    let count = 1;
    while (fs.existsSync(path.join("uploads/resume", uniqueSuffix + ext))) {
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

// ========== UPLOAD LOGO ROUTE ==========
router.post("/upload-logo", auth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "No file uploaded");
    }

    const filePath = `/uploads/resume/${req.file.filename}`;
    
    res.json({
      msg: "Logo uploaded successfully",
      filePath: filePath,
    });
  } catch (err) {
    console.error("Error uploading logo:", err);
    sendError(res, 500, "Server error during upload");
  }
});

// ========== GET COMPLETE RESUME ==========
router.get("/", auth, async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      // Create empty resume if not exists
      resume = new Resume({
        user: req.user.id,
        skills: [],
        workExperiences: [],
        awards: [],
        references: [],
        aboutCategories: [],
        services: [],
        isPublished: false,
        settings: {
          template: "modern",
          colorScheme: "purple",
          fontFamily: "inter"
        }
      });
      await resume.save();
    }
    
    return res.json(resume);
  } catch (err) {
    console.error("Error fetching resume:", err);
    return sendError(res);
  }
});

// ========== WORK EXPERIENCE CRUD ==========

// GET work experiences
router.get("/work-experiences", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    return res.json({ workExperiences: resume?.workExperiences || [] });
  } catch (err) {
    console.error("Error fetching work experiences:", err);
    return sendError(res);
  }
});


// POST work experiences - Add new work experience
router.post("/work-experiences", auth, async (req, res) => {
  try {
    const { role, company, location, startDate, endDate, current, logo, desc } = req.body;

    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      resume = new Resume({ user: req.user.id });
    }

    const newExperience = {
      role: role || "",
      company: company || "",
      location: location || "",
      startDate: startDate || new Date().toISOString().slice(0, 7),
      endDate: endDate || "",
      current: current || false,
      logo: logo || "",
      desc: desc || ""
    };

    resume.workExperiences.push(newExperience);
    await resume.save();

    // Get the newly created experience with MongoDB _id
    const savedExperience = resume.workExperiences[resume.workExperiences.length - 1];
    
    return res.json({ 
      msg: "Work experience added successfully", 
      experience: savedExperience  // Return the saved experience with _id
    });
  } catch (err) {
    console.error("Error adding work experience:", err);
    return sendError(res);
  }
});

// PUT work experiences - Update specific work experience
router.put("/work-experiences/:expId", auth, async (req, res) => {
  try {
    const { expId } = req.params;
    const updateData = req.body;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const experience = resume.workExperiences.id(expId);
    if (!experience) return sendError(res, 404, "Work experience not found");

    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        experience[key] = updateData[key];
      }
    });

    await resume.save();

    return res.json({ 
      msg: "Work experience updated successfully", 
      experience 
    });
  } catch (err) {
    console.error("Error updating work experience:", err);
    return sendError(res);
  }
});

// DELETE work experiences - Remove work experience
router.delete("/work-experiences/:expId", auth, async (req, res) => {
  try {
    const { expId } = req.params;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const experience = resume.workExperiences.id(expId);
    if (!experience) return sendError(res, 404, "Work experience not found");

    // Delete associated logo file if exists
    if (experience.logo && experience.logo.startsWith('/uploads/resume/')) {
      const logoPath = path.join(__dirname, '..', experience.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    resume.workExperiences.pull({ _id: expId });
    await resume.save();

    return res.json({ msg: "Work experience deleted successfully" });
  } catch (err) {
    console.error("Error deleting work experience:", err);
    return sendError(res);
  }
});

// ========== SKILLS CRUD ==========
router.get("/skills", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    return res.json({ skills: resume?.skills || [] });
  } catch (err) {
    console.error("Error fetching skills:", err);
    return sendError(res);
  }
});

router.post("/skills", auth, async (req, res) => {
  try {
    const { category, items } = req.body;
    
    if (!category) {
      return sendError(res, 400, "Category name is required");
    }

    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      resume = new Resume({ user: req.user.id });
    }

    const newCategory = {
      category,
      items: items || []
    };

    resume.skills.push(newCategory);
    await resume.save();

    // Get the newly created category with MongoDB _id
    const savedCategory = resume.skills[resume.skills.length - 1];
    
    return res.json({ 
      msg: "Skill category added successfully", 
      category: savedCategory  // Return the saved category with _id
    });
  } catch (err) {
    console.error("Error adding skill category:", err);
    return sendError(res);
  }
});

// PUT skills - Update specific skill category
router.put("/skills/:categoryId", auth, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { category, items } = req.body;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const skillCategory = resume.skills.id(categoryId);
    if (!skillCategory) return sendError(res, 404, "Skill category not found");

    // Update only provided fields
    if (category !== undefined) skillCategory.category = category;
    if (items !== undefined) skillCategory.items = items;

    await resume.save();

    // Return the updated category
    const updatedCategory = resume.skills.id(categoryId);
    
    return res.json({ 
      msg: "Skill category updated successfully", 
      category: updatedCategory 
    });
  } catch (err) {
    console.error("Error updating skill category:", err);
    return sendError(res);
  }
});
router.delete("/skills/:categoryId", auth, async (req, res) => {
  try {
    const { categoryId } = req.params;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    resume.skills.pull({ _id: categoryId });
    await resume.save();

    return res.json({ msg: "Skill category deleted successfully" });
  } catch (err) {
    console.error("Error deleting skill category:", err);
    return sendError(res);
  }
});

// ========== AWARDS CRUD ==========
router.get("/awards", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    return res.json({ awards: resume?.awards || [] });
  } catch (err) {
    console.error("Error fetching awards:", err);
    return sendError(res);
  }
});

// POST awards - Add new award
router.post("/awards", auth, async (req, res) => {
  try {
    const { title, year, association, location, logo, desc } = req.body;
    
    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      resume = new Resume({ user: req.user.id });
    }

    const newAward = {
      title: title || "",
      year: year || "",
      association: association || "",
      location: location || "",
      logo: logo || "",
      desc: desc || ""
    };

    resume.awards.push(newAward);
    await resume.save();

    // Get the newly created award with MongoDB _id
    const savedAward = resume.awards[resume.awards.length - 1];
    
    return res.json({ 
      msg: "Award added successfully", 
      award: savedAward  // Return the saved award with _id
    });
  } catch (err) {
    console.error("Error adding award:", err);
    return sendError(res);
  }
});

// PUT awards - Update specific award
router.put("/awards/:awardId", auth, async (req, res) => {
  try {
    const { awardId } = req.params;
    const updateData = req.body;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const award = resume.awards.id(awardId);
    if (!award) return sendError(res, 404, "Award not found");

    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        award[key] = updateData[key];
      }
    });

    await resume.save();

    // Return the updated award
    const updatedAward = resume.awards.id(awardId);
    
    return res.json({ 
      msg: "Award updated successfully", 
      award: updatedAward 
    });
  } catch (err) {
    console.error("Error updating award:", err);
    return sendError(res);
  }
});

router.delete("/awards/:awardId", auth, async (req, res) => {
  try {
    const { awardId } = req.params;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const award = resume.awards.id(awardId);
    if (!award) return sendError(res, 404, "Award not found");

    // Delete associated logo file if exists
    if (award.logo && award.logo.startsWith('/uploads/resume/')) {
      const logoPath = path.join(__dirname, '..', award.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    resume.awards.pull({ _id: awardId });
    await resume.save();

    return res.json({ msg: "Award deleted successfully" });
  } catch (err) {
    console.error("Error deleting award:", err);
    return sendError(res);
  }
});

// ========== REFERENCES CRUD ==========
router.get("/references", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    return res.json({ references: resume?.references || [] });
  } catch (err) {
    console.error("Error fetching references:", err);
    return sendError(res);
  }
});

// POST references - Add new reference
router.post("/references", auth, async (req, res) => {
  try {
    const { name, email, designation, phone, workplace, image, desc } = req.body;
    
    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      resume = new Resume({ user: req.user.id });
    }

    const newReference = {
      name: name || "",
      email: email || "",
      designation: designation || "",
      phone: phone || "",
      workplace: workplace || "",
      image: image || "",
      desc: desc || ""
    };

    resume.references.push(newReference);
    await resume.save();

    // Get the newly created reference with MongoDB _id
    const savedReference = resume.references[resume.references.length - 1];
    
    return res.json({ 
      msg: "Reference added successfully", 
      reference: savedReference  // Return the saved reference with _id
    });
  } catch (err) {
    console.error("Error adding reference:", err);
    return sendError(res);
  }
});

// PUT references - Update specific reference
router.put("/references/:refId", auth, async (req, res) => {
  try {
    const { refId } = req.params;
    const updateData = req.body;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const reference = resume.references.id(refId);
    if (!reference) return sendError(res, 404, "Reference not found");

    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        reference[key] = updateData[key];
      }
    });

    await resume.save();

    // Return the updated reference
    const updatedReference = resume.references.id(refId);
    
    return res.json({ 
      msg: "Reference updated successfully", 
      reference: updatedReference 
    });
  } catch (err) {
    console.error("Error updating reference:", err);
    return sendError(res);
  }
});
router.delete("/references/:refId", auth, async (req, res) => {
  try {
    const { refId } = req.params;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const reference = resume.references.id(refId);
    if (!reference) return sendError(res, 404, "Reference not found");

    // Delete associated image file if exists
    if (reference.image && reference.image.startsWith('/uploads/resume/')) {
      const imagePath = path.join(__dirname, '..', reference.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    resume.references.pull({ _id: refId });
    await resume.save();

    return res.json({ msg: "Reference deleted successfully" });
  } catch (err) {
    console.error("Error deleting reference:", err);
    return sendError(res);
  }
});

// ========== ABOUT CATEGORIES CRUD ==========
router.get("/about-categories", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    return res.json({ aboutCategories: resume?.aboutCategories || [] });
  } catch (err) {
    console.error("Error fetching about categories:", err);
    return sendError(res);
  }
});

router.post("/about-categories", auth, async (req, res) => {
  try {
    const { title, icon, items } = req.body;
    
    if (!title) {
      return sendError(res, 400, "Category title is required");
    }

    let resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      resume = new Resume({ user: req.user.id });
    }

    const newCategory = {
      title,
      icon: icon || "FiBook",
      items: items || []
    };

    resume.aboutCategories.push(newCategory);
    await resume.save();

    // Get the newly created category with MongoDB _id
    const savedCategory = resume.aboutCategories[resume.aboutCategories.length - 1];
    
    return res.json({ 
      msg: "About category added successfully", 
      category: savedCategory  // Return the saved category with _id
    });
  } catch (err) {
    console.error("Error adding about category:", err);
    return sendError(res);
  }
});

router.put("/about-categories/:catId", auth, async (req, res) => {
  try {
    const { catId } = req.params;
    const updateData = req.body;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    const category = resume.aboutCategories.id(catId);
    if (!category) return sendError(res, 404, "Category not found");

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        category[key] = updateData[key];
      }
    });

    await resume.save();

    // Return the updated category
    const updatedCategory = resume.aboutCategories.id(catId);
    
    return res.json({ 
      msg: "About category updated successfully", 
      category: updatedCategory 
    });
  } catch (err) {
    console.error("Error updating about category:", err);
    return sendError(res);
  }
});

router.delete("/about-categories/:catId", auth, async (req, res) => {
  try {
    const { catId } = req.params;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    resume.aboutCategories.pull({ _id: catId });
    await resume.save();

    return res.json({ msg: "About category deleted successfully" });
  } catch (err) {
    console.error("Error deleting about category:", err);
    return sendError(res);
  }
});



// ========== PUBLISH RESUME ==========
router.put("/publish", auth, async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    if (typeof isPublished !== 'boolean') {
      return sendError(res, 400, "isPublished must be a boolean");
    }

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return sendError(res, 404, "Resume not found");

    resume.isPublished = isPublished;
    resume.lastUpdated = new Date();
    await resume.save();

    return res.json({ 
      msg: `Resume ${isPublished ? 'published' : 'unpublished'} successfully`, 
      isPublished 
    });
  } catch (err) {
    console.error("Error updating publish status:", err);
    return sendError(res);
  }
});

// ========== PUBLIC RESUME ==========
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const resume = await Resume.findOne({ 
      user: userId, 
      isPublished: true 
    }).populate("user", "name email profile");
    
    if (!resume) {
      return sendError(res, 404, "Resume not found or not published");
    }
    
    return res.json(resume);
  } catch (err) {
    console.error("Error fetching public resume:", err);
    return sendError(res);
  }
});

module.exports = router;