import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";

// Package sub-schema (for basic, standard, premium tiers)
const packageSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryDays: {
    type: Number,
    required: true,
    min: 1,
  },
  revisions: {
    type: Number,
    default: 1,
    min: 0,
  },
  features: [{
    type: String,
    trim: true,
  }],
}, { _id: false });

// GIG SCHEMA
const gigSchema = mongoose.Schema(
  {
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: ['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'video', 'other'],
      index: true,
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      publicId: String, // Optional: Cloudinary public_id
      key: String, // For AWS S3 deletion
    }],
    packages: {
      basic: {
        type: packageSchema,
        required: true,
      },
      standard: packageSchema,
      premium: packageSchema,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    orders: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
gigSchema.plugin(toJSON);

// Text index for search functionality
gigSchema.index({ title: 'text', description: 'text' });

// Compound index for category and active status
gigSchema.index({ category: 1, isActive: 1 });

// Virtual for minimum price (from basic package)
gigSchema.virtual('startingPrice').get(function() {
  return this.packages?.basic?.price || 0;
});

// Method to increment views
gigSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Method to increment orders
gigSchema.methods.incrementOrders = async function() {
  this.orders += 1;
  return this.save();
};

export default mongoose.models.Gig || mongoose.model("Gig", gigSchema);
