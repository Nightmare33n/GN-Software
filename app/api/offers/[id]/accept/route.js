import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import CustomOffer from "@/models/CustomOffer";
import Order from "@/models/Order";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";

/**
 * POST /api/offers/[id]/accept
 * Accept a custom offer (client only)
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
        { error: 'Only the client can accept this offer' },
        { status: 403 }
      );
    }

    // Accept offer
    await offer.accept();

    // Create order from offer
    const order = await Order.create({
      clientId: offer.clientId,
      freelancerId: offer.freelancerId,
      customOfferId: offer._id,
      orderType: 'custom',
      title: offer.title,
      description: offer.description,
      price: offer.price,
      deliveryDays: offer.deliveryDays,
      revisions: offer.revisions,
      status: 'pending',
      conversationId: offer.conversationId,
    });

    // Mark offer as converted
    await offer.markAsConverted();

    // Create system message
    const message = await Message.create({
      conversationId: offer.conversationId,
      senderId: user._id,
      content: `Custom offer accepted! Order #${order.orderNumber} created for $${offer.price}`,
      messageType: 'system',
    });

    await message.populate('senderId', 'name image');

    // Update conversation
    const conversation = await Conversation.findById(offer.conversationId);
    conversation.lastMessage = {
      content: `Custom offer accepted`,
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

        global.io.to(participantId.toString()).emit('offer_accepted', {
          offerId: offer._id,
          orderId: order._id,
        });
      });
    }

    await order.populate([
      { path: 'clientId', select: 'name email image' },
      { path: 'freelancerId', select: 'name email image' },
    ]);

    return NextResponse.json({
      message: 'Offer accepted and order created',
      offer,
      order,
    });
  } catch (error) {
    console.error('Error accepting offer:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message.includes('not pending') || error.message.includes('expired')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    );
  }
}
