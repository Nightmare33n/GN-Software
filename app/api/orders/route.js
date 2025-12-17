import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import { getAuthenticatedUser } from "@/libs/auth";

/**
 * GET /api/orders
 * List orders for the current user
 */
export async function GET(req) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'client'; // 'client' or 'freelancer'
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query = {};

    if (role === 'freelancer') {
      query.freelancerId = user._id;
    } else {
      query.clientId = user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Execute query
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('clientId', 'name email image')
        .populate('freelancerId', 'name email image')
        .populate('gigId', 'title images')
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
