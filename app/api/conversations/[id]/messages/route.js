import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";

/**
 * GET /api/conversations/[id]/messages
 * Get messages for a conversation (paginated)
 */
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(req.url);
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Verify user is participant in this conversation
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
        { error: 'Not authorized to view this conversation' },
        { status: 403 }
      );
    }

    // Build query
    const query = { conversationId: params.id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'name image')
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    return NextResponse.json({
      messages,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
