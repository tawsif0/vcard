const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  otp: {
    code: String,
    expiresAt: Date,
  },
  createdAt: { type: Date, default: Date.now }, // Default to current date and time
});

// Create a TTL index on createdAt to automatically remove documents after 15 minutes (900 seconds)
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model(
  "PendingUser",
  pendingUserSchema,
  "pending_users"
);
