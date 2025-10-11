const mongoose = require("mongoose");

const homeCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    template: {
      type: String,
      required: true,
      enum: [
        "influencer",
        "hero",
        "executive",
        "minimalist",
        "creative",
        "neon",
        "cyberpunk",
        "luxury",
        "minimal"
      ],
      default: "influencer"
    },
    templateData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    profileData: {
      fullName: String,
      designation: String,
      city: String,
      profilePicture: String, // URL or file path
      socialMedias: [
        {
          platform: String,
          url: String
        }
      ]
    },
    showImage: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("HomeCard", homeCardSchema);
