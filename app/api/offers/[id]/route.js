import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import CustomOffer from "@/models/CustomOffer";
import { getAuthenticatedUser } from "@/libs/auth";

/**
 * GET /api/offers/[id]
 * Get single custom offer details
 */
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    const offer = await CustomOffer.findById(params.id)
      .populate('freelancerId', 'name email image')
      .populate('clientId', 'name email image')
      .lean();

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Verify user is participant (client or freelancer)
    const isClient = offer.clientId._id.toString() === user._id.toString();
    const isFreelancer = offer.freelancerId._id.toString() === user._id.toString();

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Not authorized to view this offer' },
        { status: 403 }
      );
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Error fetching offer:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    );
  }
}
