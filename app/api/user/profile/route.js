import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { z } from "zod";

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).max(20).optional(),
  role: z.enum(['client', 'freelancer', 'admin']).optional(),
  image: z.string().url().optional(),
});

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET() {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        profileComplete: user.profileComplete,
        rating: user.rating,
        reviewCount: user.reviewCount,
        onlineStatus: user.onlineStatus,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(req) {
  try {
    await connectMongo();
    const user = await getAuthenticatedUser();
    const body = await req.json();

    // Validate input
    const validated = profileUpdateSchema.parse(body);

    // Update user fields
    if (validated.name !== undefined) user.name = validated.name;
    if (validated.bio !== undefined) user.bio = validated.bio;
    if (validated.skills !== undefined) user.skills = validated.skills;
    if (validated.image !== undefined) user.image = validated.image;

    // Allow role change (user can set themselves as freelancer)
    // But don't allow setting to admin (that would be a security issue)
    if (validated.role !== undefined && validated.role !== 'admin') {
      user.role = validated.role;
    }

    // Mark profile as complete if it has minimum info
    if (user.name && user.bio) {
      user.profileComplete = true;
    }

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        profileComplete: user.profileComplete,
        rating: user.rating,
        reviewCount: user.reviewCount,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);

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
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
