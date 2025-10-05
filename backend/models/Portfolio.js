const mongoose = require("mongoose");

const portfolioCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const portfolioProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  projectType: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  client: {
    type: String,
    default: ""
  },
  duration: {
    type: String,
    default: ""
  },
  budget: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  technologies: [{
    type: String,
    default: ""
  }],
  status: {
    type: String,
    enum: ["planning", "in-progress", "completed", "on-hold"],
    default: "planning"
  }
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  categories: [portfolioCategorySchema],
  projects: [portfolioProjectSchema],
  
  isPublished: {
    type: Boolean,
    default: false
  },
  settings: {
    template: {
      type: String,
      default: "modern"
    },
    colorScheme: {
      type: String,
      default: "purple"
    },
    layout: {
      type: String,
      default: "grid"
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update lastUpdated timestamp before saving
portfolioSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Portfolio", portfolioSchema);