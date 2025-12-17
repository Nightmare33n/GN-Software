import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/libs/auth";
import { z } from "zod";

const deliverySchema = z.object({
  deliveryFiles: z.array(z.object({
    url: z.string().url(),
    name: z.string(),
    size: z.number().optional()
  })).min(1, "At least one file is required"),
  deliveryNote: z.string().min(10).max(1000).optional()
});

/**
 * POST /api/orders/[id]/deliver
 * Deliver order with files (freelancer only)
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

    // Verify user is the freelancer
    if (order.freelancerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Only the freelancer can deliver this order' },
        { status: 403 }
      );
    }

    // Verify order is in correct status
    if (order.status !== 'in_progress' && order.status !== 'revision') {
      return NextResponse.json(
        { error: `Cannot deliver order with status: ${order.status}` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = deliverySchema.parse(body);

    // Update order
    order.deliveryFiles = validated.deliveryFiles;
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Create system message in conversation
    const message = await Message.create({
      conversationId: order.conversationId,
      senderId: user._id,
      content: `Order #${order.orderNumber} has been delivered${validated.deliveryNote ? `: ${validated.deliveryNote}` : ''}`,
      messageType: 'system'
    });

    await message.populate('senderId', 'name image');

    // Update conversation
    const conversation = await Conversation.findById(order.conversationId);
    conversation.lastMessage = {
      content: `Order delivered`,
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

        global.io.to(participantId.toString()).emit('order_delivered', {
          orderId: order._id,
          deliveryFiles: order.deliveryFiles
        });
      });
    }

    await order.populate([
      { path: 'clientId', select: 'name email image' },
      { path: 'freelancerId', select: 'name email image' },
      { path: 'gigId', select: 'title images' }
    ]);

    return NextResponse.json({
      message: 'Order delivered successfully',
      order
    });
  } catch (error) {
    console.error('Error delivering order:', error);

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
      { error: 'Failed to deliver order' },
      { status: 500 }
    );
  }
}
