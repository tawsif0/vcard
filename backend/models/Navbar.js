const mongoose = require("mongoose");

const navbarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create a unique index for user to ensure one navbar per user
navbarSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Navbar", navbarSchema);
