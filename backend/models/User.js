const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false }, // To track if email verified
  otp: {
    code: String, // Stores OTP code
    expiresAt: Date, // Expiry datetime of OTP
  },

  profile: {
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
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
