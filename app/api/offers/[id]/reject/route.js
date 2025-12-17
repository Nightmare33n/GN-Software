import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import CustomOffer from "@/models/CustomOffer";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(5).max(500).optional(),
});

/**
 * POST /api/offers/[id]/reject
 * Reject a custom offer (client only)
 */
export async function POST(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const offer = await CustomOffer.findById(params.id);

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Verify user is the client
    if (offer.clientId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Only the client can reject this offer' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = rejectSchema.parse(body);

    // Reject offer
    await offer.reject(validated.reason || 'No reason provided');

    // Create system message
    const message = await Message.create({
      conversationId: offer.conversationId,
      senderId: user._id,
      content: `Custom offer rejected${validated.reason ? `: ${validated.reason}` : ''}`,
      messageType: 'system',
    });

    await message.populate('senderId', 'name image');

    // Update conversation
    const conversation = await Conversation.findById(offer.conversationId);
    conversation.lastMessage = {
      content: `Custom offer rejected`,
      senderId: user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    // Emit socket events
    if (global.io) {
      global.io.to(`conversation:${offer.conversationId}`).emit('new_message', message);

      conversation.participants.forEach(participantId => {
        global.io.to(participantId.toString()).emit('conversation_updated', {
          conversationId: offer.conversationId,
          lastMessage: conversation.lastMessage,
        });

        global.io.to(participantId.toString()).emit('offer_rejected', {
          offerId: offer._id,
        });
      });
    }

    return NextResponse.json({
      message: 'Offer rejected',
      offer,
    });
  } catch (error) {
    console.error('Error rejecting offer:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message.includes('not pending')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reject offer' },
      { status: 500 }
    );
  }
}
