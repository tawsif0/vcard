const mongoose = require("mongoose");

const qrSettingsSchema = new mongoose.Schema({
  dotColor: {
    type: String,
    default: "#06b6d4",
  },
  bgColor: {
    type: String,
    default: "transparent",
  },
  pattern: {
    type: String,
    default: "square",
  },
});

const profileShareSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profileData: {
      fullName: {
        type: String,
        default: "",
      },
      designation: {
        type: String,
        default: "",
      },
      profilePicture: {
        type: String,
        default: "",
      },
      logo: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      socialMedias: {
        type: [String],
        default: [],
      },
      profileUrl: {
        type: String,
        default: "",
      },
    },
    qrSettings: {
      type: qrSettingsSchema,
      default: () => ({}),
    },
    displaySettings: {
      showAvatarInQR: {
        type: Boolean,
        default: true,
      },
      showLogoInQR: {
        type: Boolean,
        default: false,
      },
    },
    qrCodeImage: {
      type: String, // Store QR code as base64 or file path
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProfileShare", profileShareSchema);
