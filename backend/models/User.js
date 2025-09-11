const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date,
  },

  profile: {
    userType: {
      type: String,
      enum: ["student", "businessman", "serviceHolder", "contentCreator"],
      default: "student",
    },
    fullName: String,
    jobTitle: String,
    department: String,
    company: String,
    phone: String,
    email: String,
    website: String,
    linkedin: String,
    facebook: String,
    bio: String,
    avatar: String,
    avatarOption: {
      type: String,
      enum: ["none", "robot", "cat", "custom"],
      default: "none",
    },
    avatarCustomUrl: String,
    profilePicture: String,
    gender: String,
    whatsapp: String,
    homeAddress: String,
    showHomeAddress: { type: Boolean, default: false },
    officeAddress: String,
    showOfficeAddress: { type: Boolean, default: false },
    officialPhone: String,
    companyWebsite: String,
    socialMedias: [
      {
        platform: String,
        url: String,
      },
    ],

    // Student specific fields
    institutionName: String,
    aimInLife: String,
    hobby: String,

    // Businessman specific fields
    businessName: String,
    businessType: String,
    position: String,

    // Service holder specific fields
    officialPosition: String,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
