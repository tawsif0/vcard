const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    //required: true,
  },
  included: {
    type: Boolean,
    default: true,
  },
});

const pricingPlanSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    //required: true,
  },
  price: {
    type: Number,
    //required: true,
  },
  period: {
    type: String,
    //required: true,
  },
  features: [featureSchema],
});

const serviceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    //required: true,
  },
  image: {
    // Changed from 'icon' to 'image'
    type: String,
    //required: true,
  },
  desc: {
    type: String,
    //required: true,
  },
});

const brandSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  src: {
    type: String,
    //required: true,
  },
  alt: {
    type: String,
    //required: true,
  },
});

const testimonialSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    //required: true,
  },
  name: {
    type: String,
    //required: true,
  },
  position: {
    // CHANGED: Added position field
    type: String,
    //required: true,
  },
  company: {
    // CHANGED: Added company field
    type: String,
    //required: true,
  },
  avatar: {
    type: String,
    //required: true,
  },
});

const personalInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  languages: {
    type: String,
    default: "",
  },
  nationality: {
    type: String,
    default: "",
  },
  freelance: {
    type: String,
    default: "Available",
  },
  description: {
    type: String,
    default: "",
  },
});

const aboutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personal: {
      type: personalInfoSchema,
      default: () => ({}),
    },
    brands: {
      type: [brandSchema],
      default: [],
    },
    pricing: {
      type: [pricingPlanSchema],
      default: [],
    },
    services: {
      type: [serviceSchema],
      default: [],
    },
    testimonials: {
      type: [testimonialSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("About", aboutSchema);
