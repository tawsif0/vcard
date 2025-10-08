const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: ""
  },
  subject: {
    type: String,
    default: ""
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "replied"],
    default: "pending"
  },
  read: {
    type: Boolean,
    default: false
  },
  repliedAt: {
    type: Date
  },
  replyMessage: {
    type: String,
    default: ""
  }
}, { 
  timestamps: true 
});

// Index for better query performance
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });

module.exports = mongoose.model("Contact", contactSchema);