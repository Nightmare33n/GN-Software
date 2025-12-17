import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";

// MESSAGE SCHEMA
const messageSchema = mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'offer', 'system'],
      default: 'text',
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    customOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomOffer',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
messageSchema.plugin(toJSON);

// Compound index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

// Method to mark as read
messageSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

// Static method to mark all unread messages in a conversation as read
messageSchema.statics.markConversationAsRead = async function(conversationId, userId) {
  const result = await this.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      }
    }
  );

  return result.modifiedCount;
};

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
