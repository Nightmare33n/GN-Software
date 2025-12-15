import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";

/**
 * POST /api/conversations/[id]/mark-read
 * Mark all messages in a conversation as read
 */
export async function POST(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    // Verify user is participant
    const conversation = await Conversation.findById(params.id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Mark all messages as read
    const count = await Message.markConversationAsRead(params.id, user._id);

    // Reset unread count in conversation
    await conversation.resetUnread(user._id);

    // Emit socket event (if global.io is available)
    if (global.io) {
      conversation.participants.forEach(participantId => {
        const id = participantId.toString();
        if (id !== user._id.toString()) {
          global.io.to(id).emit('messages_read', {
            conversationId: params.id,
            readBy: user._id.toString(),
          });
        }
      });
    }

    return NextResponse.json({
      message: 'Messages marked as read',
      count,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
