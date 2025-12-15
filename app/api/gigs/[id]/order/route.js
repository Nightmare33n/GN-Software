import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Gig from "@/models/Gig";
import Order from "@/models/Order";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthenticatedUser } from "@/libs/auth";
import { z } from "zod";

// Validation schema
const orderSchema = z.object({
  packageType: z.enum(['basic', 'standard', 'premium']),
});

/**
 * POST /api/gigs/[id]/order
 * Create an order from a gig package (no payment processing for now)
 */
export async function POST(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const gig = await Gig.findById(params.id).populate('freelancerId', 'name email');

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (!gig.isActive) {
      return NextResponse.json(
        { error: 'This gig is no longer available' },
        { status: 400 }
      );
    }

    // Can't order from own gig
    if (gig.freelancerId._id.toString() === user._id.toString()) {
      return NextResponse.json(
        { error: 'You cannot order from your own gig' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = orderSchema.parse(body);

    // Get package details
    const selectedPackage = gig.packages[validated.packageType];

    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Selected package not available' },
        { status: 400 }
      );
    }

    // Create or get conversation
    const conversation = await Conversation.findOrCreate(
      user._id,
      gig.freelancerId._id
    );

    // Create order (no payment processing for MVP)
    const order = await Order.create({
      clientId: user._id,
      freelancerId: gig.freelancerId._id,
      gigId: gig._id,
      orderType: 'gig',
      packageType: validated.packageType,
      title: gig.title,
      description: selectedPackage.description || gig.description,
      price: selectedPackage.price,
      deliveryDays: selectedPackage.deliveryDays,
      revisions: selectedPackage.revisions || 1,
      status: 'pending',
      conversationId: conversation._id,
    });

    // Increment gig orders count
    await gig.incrementOrders();

    // Create system message in conversation
    await Message.create({
      conversationId: conversation._id,
      senderId: user._id,
      content: `New order created: ${gig.title} (${validated.packageType} package) - $${selectedPackage.price}`,
      messageType: 'system',
    });

    // Update conversation's last message
    conversation.lastMessage = {
      content: `New order created: ${gig.title}`,
      senderId: user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    // Populate details
    await order.populate([
      { path: 'clientId', select: 'name email image' },
      { path: 'freelancerId', select: 'name email image' },
      { path: 'gigId', select: 'title images' },
    ]);

    return NextResponse.json({
      message: 'Order created successfully',
      order,
      conversationId: conversation._id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);

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
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
