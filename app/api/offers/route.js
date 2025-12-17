import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import CustomOffer from "@/models/CustomOffer";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthenticatedUser, requireFreelancer } from "@/libs/auth";
import { z } from "zod";

// Validation schema
const offerSchema = z.object({
  clientId: z.string(),
  conversationId: z.string(),
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(2000),
  price: z.number().min(5),
  deliveryDays: z.number().min(1).max(90),
  revisions: z.number().min(0).max(10).optional(),
});

/**
 * POST /api/offers
 * Create a custom offer (freelancers only)
 */
export async function POST(req) {
  try {
    await connectMongo();
    const user = await requireFreelancer();

    const body = await req.json();
    const validated = offerSchema.parse(body);

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(validated.conversationId);
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

    // Create custom offer
    const offer = await CustomOffer.create({
      freelancerId: user._id,
      clientId: validated.clientId,
      conversationId: validated.conversationId,
      title: validated.title,
      description: validated.description,
      price: validated.price,
      deliveryDays: validated.deliveryDays,
      revisions: validated.revisions || 1,
    });

    // Create message in conversation with offer
    const message = await Message.create({
      conversationId: validated.conversationId,
      senderId: user._id,
      content: `Custom offer: ${validated.title} - $${validated.price}`,
      messageType: 'offer',
      customOfferId: offer._id,
    });

    await message.populate('senderId', 'name image');

    // Update conversation
    conversation.lastMessage = {
      content: `Custom offer: ${validated.title}`,
      senderId: user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`conversation:${validated.conversationId}`).emit('new_message', message);

      conversation.participants.forEach(participantId => {
        global.io.to(participantId.toString()).emit('conversation_updated', {
          conversationId: validated.conversationId,
          lastMessage: conversation.lastMessage,
        });
      });
    }

    await offer.populate([
      { path: 'freelancerId', select: 'name image' },
      { path: 'clientId', select: 'name image' },
    ]);

    return NextResponse.json({
      message: 'Custom offer created successfully',
      offer,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom offer:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Freelancer or admin access required') {
      return NextResponse.json(
        { error: 'Only freelancers can create custom offers' },
        { status: 403 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create custom offer' },
      { status: 500 }
    );
  }
}
