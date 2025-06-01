const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  otp: {
    code: String,
    expiresAt: Date,
  },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // auto-delete after 15 min (900 seconds)
});

module.exports = mongoose.model(
  "PendingUser",
  pendingUserSchema,
  "pending_users"
);
