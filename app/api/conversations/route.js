import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";
import { z } from "zod";

// Validation schema
const createConversationSchema = z.object({
  otherUserId: z.string(),
});

/**
 * GET /api/conversations
 * List all conversations for the current user
 */
export async function GET() {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const conversations = await Conversation.find({
      participants: user._id,
    })
      .sort({ 'lastMessage.timestamp': -1 })
      .populate('participants', 'name image onlineStatus lastSeen')
      .lean();

    // Format conversations with unread count for current user
    const formattedConversations = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCount?.get(user._id.toString()) || 0,
    }));

    return NextResponse.json({
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create or get existing conversation with another user
 */
export async function POST(req) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const validated = createConversationSchema.parse(body);

    // Can't create conversation with self
    if (validated.otherUserId === user._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot create conversation with yourself' },
        { status: 400 }
      );
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(
      user._id,
      validated.otherUserId
    );

    return NextResponse.json({
      conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
