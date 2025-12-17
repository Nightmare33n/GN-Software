import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/libs/auth";

/**
 * GET /api/orders/[id]
 * Get single order details
 */
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const order = await Order.findById(params.id)
      .populate('clientId', 'name email image')
      .populate('freelancerId', 'name email image')
      .populate('gigId', 'title images')
      .populate('customOfferId')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user is participant (client or freelancer)
    const isClient = order.clientId._id.toString() === user._id.toString();
    const isFreelancer = order.freelancerId._id.toString() === user._id.toString();

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Not authorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status
 */
export async function PATCH(req, { params }) {
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

    // Verify user is participant
    const isClient = order.clientId.toString() === user._id.toString();
    const isFreelancer = order.freelancerId.toString() === user._id.toString();

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Not authorized to update this order' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    // Validate status transitions
    const validTransitions = {
      'pending': ['in_progress', 'cancelled'],
      'in_progress': ['delivered', 'cancelled'],
      'delivered': ['revision', 'completed', 'cancelled'],
      'revision': ['in_progress', 'cancelled'],
      'completed': [], // Cannot change from completed
      'cancelled': [] // Cannot change from cancelled
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    // Only freelancer can start work
    if (status === 'in_progress' && !isFreelancer) {
      return NextResponse.json(
        { error: 'Only freelancer can start working on order' },
        { status: 403 }
      );
    }

    // Only client can complete or cancel after delivery
    if ((status === 'completed' || status === 'cancelled') && order.status === 'delivered' && !isClient) {
      return NextResponse.json(
        { error: 'Only client can complete or cancel delivered order' },
        { status: 403 }
      );
    }

    order.status = status;
    await order.save();

    // Emit socket event
    if (global.io) {
      [order.clientId, order.freelancerId].forEach(participantId => {
        global.io.to(participantId.toString()).emit('order_updated', {
          orderId: order._id,
          status: order.status
        });
      });
    }

    await order.populate([
      { path: 'clientId', select: 'name email image' },
      { path: 'freelancerId', select: 'name email image' },
      { path: 'gigId', select: 'title images' }
    ]);

    return NextResponse.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
