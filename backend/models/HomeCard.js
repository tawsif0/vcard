const mongoose = require("mongoose");

const homeCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
        "glass",
        "neon",
        "cyberpunk",
        "luxury",
        "minimal",
      ],
      default: "influencer",
    },
    profileData: {
      fullName: String,
      designation: String,
      city: String,
      profilePicture: String, // URL or file path
      socialMedias: [
        {
          platform: String,
          url: String,
        },
      ],
    },
    showImage: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// homeCardSchema.index({ userId: 1 });

module.exports = mongoose.model("HomeCard", homeCardSchema);
