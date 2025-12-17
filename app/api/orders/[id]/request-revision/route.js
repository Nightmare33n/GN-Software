import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";
import { z } from "zod";

const revisionSchema = z.object({
  reason: z.string().min(10).max(1000),
});

/**
 * POST /api/orders/[id]/request-revision
 * Request revision (client only)
 */
export async function POST(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user is the client
    if (order.clientId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Only the client can request revisions' },
        { status: 403 }
      );
    }

    // Verify order is delivered
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Can only request revision for delivered orders' },
        { status: 400 }
      );
    }

    // Check if revisions are available
    if (order.revisions <= order.revisionRequests.length) {
      return NextResponse.json(
        { error: 'No revisions remaining' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = revisionSchema.parse(body);

    // Add revision request
    order.revisionRequests.push({
      reason: validated.reason,
      requestedAt: new Date()
    });
    order.status = 'revision';
    await order.save();

    // Create system message in conversation
    const message = await Message.create({
      conversationId: order.conversationId,
      senderId: user._id,
      content: `Revision requested for Order #${order.orderNumber}: ${validated.reason}`,
      messageType: 'system'
    });

    await message.populate('senderId', 'name image');

    // Update conversation
    const conversation = await Conversation.findById(order.conversationId);
    conversation.lastMessage = {
      content: `Revision requested`,
      senderId: user._id,
      timestamp: new Date()
    };
    await conversation.save();

    // Emit socket events
    if (global.io) {
      global.io.to(`conversation:${order.conversationId}`).emit('new_message', message);

      [order.clientId, order.freelancerId].forEach(participantId => {
        global.io.to(participantId.toString()).emit('conversation_updated', {
          conversationId: order.conversationId,
          lastMessage: conversation.lastMessage
        });

        global.io.to(participantId.toString()).emit('revision_requested', {
          orderId: order._id,
          reason: validated.reason
        });
      });
    }

    await order.populate([
      { path: 'clientId', select: 'name email image' },
      { path: 'freelancerId', select: 'name email image' },
      { path: 'gigId', select: 'title images' }
    ]);

    return NextResponse.json({
      message: 'Revision requested successfully',
      order
    });
  } catch (error) {
    console.error('Error requesting revision:', error);

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
      { error: 'Failed to request revision' },
      { status: 500 }
    );
  }
}
