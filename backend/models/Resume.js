const mongoose = require("mongoose");

const workExperienceSchema = new mongoose.Schema({
  role: {
    type: String,
    default: ""
  },
  company: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  startDate: {
    type: String,
    default: ""
  },
  endDate: {
    type: String,
    default: ""
  },
  current: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const skillItemSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  level: {
    type: Number,
    default: 0
  }
}, { _id: false }); // Remove _id for subdocuments to avoid complexity

const skillCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    default: ""
  },
  items: [skillItemSchema]
}, { timestamps: true });

const awardSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  year: {
    type: String,
    default: ""
  },
  association: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const referenceSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  designation: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  workplace: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const aboutCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: "FiBook"
  },
  items: [{
    type: String,
    default: ""
  }]
}, { timestamps: true });


const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    default: ""
  },
  university: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  startDate: {
    type: String,
    default: ""
  },
  endDate: {
    type: String,
    default: ""
  },
  current: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  }
}, { timestamps: true });


const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  skills: [skillCategorySchema],
  workExperiences: [workExperienceSchema],
  education: [educationSchema],
  awards: [awardSchema],
  references: [referenceSchema],
  aboutCategories: [aboutCategorySchema],
  
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
    fontFamily: {
      type: String,
      default: "inter"
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update lastUpdated timestamp before saving
resumeSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Resume", resumeSchema);