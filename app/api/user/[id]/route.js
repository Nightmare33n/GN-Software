import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

/**
 * GET /api/user/[id]
 * Get public user profile by ID
 */
export async function GET(req, { params }) {
  try {
    await connectMongo();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return only public information
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        image: user.image,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        rating: user.rating,
        reviewCount: user.reviewCount,
        onlineStatus: user.onlineStatus,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
