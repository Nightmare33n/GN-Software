import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";

// CUSTOM OFFER SCHEMA
const customOfferSchema = mongoose.Schema(
  {
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
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
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
customOfferSchema.plugin(toJSON);

// Auto-expire after 3 days
customOfferSchema.pre('save', function(next) {
  if (!this.expiresAt && this.isNew) {
    this.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Compound indexes
customOfferSchema.index({ freelancerId: 1, status: 1 });
customOfferSchema.index({ clientId: 1, status: 1 });
customOfferSchema.index({ conversationId: 1, status: 1 });

// Virtual to check if expired
customOfferSchema.virtual('isExpired').get(function() {
  return this.status === 'pending' && new Date() > this.expiresAt;
});

// Method to accept offer
customOfferSchema.methods.accept = async function() {
  if (this.status !== 'pending') {
    throw new Error('Offer is not pending');
  }

  if (this.isExpired) {
    throw new Error('Offer has expired');
  }

  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Method to reject offer
customOfferSchema.methods.reject = async function(reason) {
  if (this.status !== 'pending') {
    throw new Error('Offer is not pending');
  }

  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to mark as converted (after order created)
customOfferSchema.methods.markAsConverted = async function() {
  this.status = 'converted';
  return this.save();
};

export default mongoose.models.CustomOffer || mongoose.model("CustomOffer", customOfferSchema);
