import mongoose from "mongoose";
import toJSON from "./plugins/toJSON.js";

// CONVERSATION SCHEMA
const conversationSchema = mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
conversationSchema.plugin(toJSON);

// Ensure only 2 participants and initialize unread counts
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }

  // Initialize unread count for each participant if not exists
  this.participants.forEach(participantId => {
    const id = participantId.toString();
    if (!this.unreadCount.has(id)) {
      this.unreadCount.set(id, 0);
    }
  });

  next();
});

// Indexes for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

// Method to get other participant ID
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(
    (id) => id.toString() !== userId.toString()
  );
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = function(userId) {
  const id = userId.toString();
  const current = this.unreadCount.get(id) || 0;
  this.unreadCount.set(id, current + 1);
  return this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnread = function(userId) {
  const id = userId.toString();
  this.unreadCount.set(id, 0);
  return this.save();
};

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreate = async function(user1Id, user2Id) {
  // Try to find existing conversation
  let conversation = await this.findOne({
    participants: { $all: [user1Id, user2Id] }
  }).populate('participants', 'name image onlineStatus lastSeen');

  // Create new if doesn't exist
  if (!conversation) {
    conversation = await this.create({
      participants: [user1Id, user2Id],
    });
    await conversation.populate('participants', 'name image onlineStatus lastSeen');
  }

  return conversation;
};

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
