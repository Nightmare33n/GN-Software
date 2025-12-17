import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";

// ORDER SCHEMA
const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
    },
    customOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomOffer',
    },
    orderType: {
      type: String,
      enum: ['gig', 'custom'],
      required: true,
    },
    packageType: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
      enum: ['pending', 'in_progress', 'delivered', 'revision', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    deliveryFiles: [{
      url: String,
      name: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    revisionRequests: [{
      message: String,
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    deliveredAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
orderSchema.plugin(toJSON);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

// Compound indexes for efficient queries
orderSchema.index({ clientId: 1, status: 1 });
orderSchema.index({ freelancerId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for expected delivery date
orderSchema.virtual('expectedDeliveryDate').get(function() {
  if (!this.createdAt) return null;
  const deliveryDate = new Date(this.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + this.deliveryDays);
  return deliveryDate;
});

// Method to mark as delivered
orderSchema.methods.markAsDelivered = async function(files) {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  if (files && files.length > 0) {
    this.deliveryFiles = files;
  }
  return this.save();
};

// Method to request revision
orderSchema.methods.requestRevision = async function(message) {
  this.status = 'revision';
  this.revisionRequests.push({
    message,
    requestedAt: new Date(),
  });
  return this.save();
};

// Method to mark as completed
orderSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
