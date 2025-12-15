import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Role: client (default), freelancer, or admin
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client',
    },
    // Profile information
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    profileComplete: {
      type: Boolean,
      default: false,
    },
    // Rating and reviews
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
    // Online status for chat
    onlineStatus: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// Method to check if user can create gigs
userSchema.methods.canCreateGigs = function() {
  return this.role === 'freelancer' || this.role === 'admin';
};

export default mongoose.models.User || mongoose.model("User", userSchema);
