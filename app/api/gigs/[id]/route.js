import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Gig from "@/models/Gig";
import { requireFreelancer } from "@/libs/auth";
import { z } from "zod";

// Validation schema for updating gigs
const gigUpdateSchema = z.object({
  title: z.string().min(10).max(100).optional(),
  description: z.string().min(50).max(2000).optional(),
  category: z.enum(['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'video', 'other']).optional(),
  images: z.array(z.object({
    url: z.string(),
    key: z.string().optional(),
  })).min(1).max(10).optional(),
  packages: z.object({
    basic: z.object({
      name: z.string().optional(),
      description: z.string().min(20).optional(),
      price: z.number().min(5).optional(),
      deliveryDays: z.number().min(1).max(90).optional(),
      revisions: z.number().min(0).max(10).optional(),
      features: z.array(z.string()).optional(),
    }).optional(),
    standard: z.object({
      name: z.string().optional(),
      description: z.string().min(20).optional(),
      price: z.number().min(5).optional(),
      deliveryDays: z.number().min(1).max(90).optional(),
      revisions: z.number().min(0).max(10).optional(),
      features: z.array(z.string()).optional(),
    }).optional(),
    premium: z.object({
      name: z.string().optional(),
      description: z.string().min(20).optional(),
      price: z.number().min(5).optional(),
      deliveryDays: z.number().min(1).max(90).optional(),
      revisions: z.number().min(0).max(10).optional(),
      features: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/gigs/[id]
 * Get single gig by ID (increments view count)
 */
export async function GET(req, { params }) {
  try {
    await connectMongo();

    const gig = await Gig.findById(params.id)
      .populate('freelancerId', 'name image bio skills rating reviewCount');

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    // Increment views (async, don't await)
    gig.incrementViews().catch(console.error);

    return NextResponse.json({ gig });
  } catch (error) {
    console.error('Error fetching gig:', error);

    return NextResponse.json(
      { error: 'Failed to fetch gig' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gigs/[id]
 * Update gig (owner only)
 */
export async function PATCH(req, { params }) {
  try {
    await connectMongo();
    const user = await requireFreelancer();

    const gig = await Gig.findById(params.id);

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    // Check ownership unless admin
    if (user.role !== 'admin' && gig.freelancerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You can only edit your own gigs' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validated = gigUpdateSchema.parse(body);

    // Update fields
    Object.keys(validated).forEach((key) => {
      if (key === 'packages' && validated.packages) {
        // Merge package updates
        Object.keys(validated.packages).forEach((packageType) => {
          if (validated.packages[packageType]) {
            gig.packages[packageType] = {
              ...gig.packages[packageType],
              ...validated.packages[packageType],
            };
          }
        });
      } else {
        gig[key] = validated[key];
      }
    });

    await gig.save();
    await gig.populate('freelancerId', 'name image rating reviewCount');

    return NextResponse.json({
      message: 'Gig updated successfully',
      gig,
    });
  } catch (error) {
    console.error('Error updating gig:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Freelancer or admin access required') {
      return NextResponse.json(
        { error: 'Only freelancers can update gigs' },
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
      { error: 'Failed to update gig' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gigs/[id]
 * Delete gig (owner only)
 */
export async function DELETE(req, { params }) {
  try {
    await connectMongo();
    const user = await requireFreelancer();

    const gig = await Gig.findById(params.id);

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    // Check ownership unless admin
    if (user.role !== 'admin' && gig.freelancerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You can only delete your own gigs' },
        { status: 403 }
      );
    }

    // Soft delete by marking as inactive instead of hard delete
    gig.isActive = false;
    await gig.save();

    return NextResponse.json({
      message: 'Gig deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gig:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Freelancer or admin access required') {
      return NextResponse.json(
        { error: 'Only freelancers can delete gigs' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete gig' },
      { status: 500 }
    );
  }
}
