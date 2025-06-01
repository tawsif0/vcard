// models/PasswordReset.js
const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true }, // 4-digit code
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
