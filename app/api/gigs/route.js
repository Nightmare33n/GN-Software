import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Gig from "@/models/Gig";
import { getAuthenticatedUser, requireFreelancer } from "@/libs/auth";
import { z } from "zod";

// Validation schema for creating/updating gigs
const gigSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),
  category: z.enum(['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'video', 'other']),
  images: z.array(z.object({
    url: z.string(),
    key: z.string().optional(),
  })).min(1).max(10),
  packages: z.object({
    basic: z.object({
      name: z.string().optional(),
      description: z.string().min(20),
      price: z.number().min(5),
      deliveryDays: z.number().min(1).max(90),
      revisions: z.number().min(0).max(10).optional(),
      features: z.array(z.string()).optional(),
    }),
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
  }),
});

/**
 * GET /api/gigs
 * List all active gigs with filters
 */
export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build query
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { orders: -1, views: -1 };
        break;
      case 'price-low':
        sortOption = { 'packages.basic.price': 1 };
        break;
      case 'price-high':
        sortOption = { 'packages.basic.price': -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [gigs, total] = await Promise.all([
      Gig.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('freelancerId', 'name image rating reviewCount'),
      Gig.countDocuments(query),
    ]);

    return NextResponse.json({
      gigs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching gigs:', error);

    return NextResponse.json(
      { error: 'Failed to fetch gigs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gigs
 * Create a new gig (freelancers/admins only)
 */
export async function POST(req) {
  try {
    await connectMongo();
    const user = await requireFreelancer();

    const body = await req.json();

    // Validate input
    const validated = gigSchema.parse(body);

    // Set default package names if not provided
    if (!validated.packages.basic.name) {
      validated.packages.basic.name = 'Basic';
    }
    if (validated.packages.standard && !validated.packages.standard.name) {
      validated.packages.standard.name = 'Standard';
    }
    if (validated.packages.premium && !validated.packages.premium.name) {
      validated.packages.premium.name = 'Premium';
    }

    // Create gig
    const gig = await Gig.create({
      ...validated,
      freelancerId: user._id,
    });

    // Populate freelancer info
    await gig.populate('freelancerId', 'name image rating reviewCount');

    return NextResponse.json({
      message: 'Gig created successfully',
      gig,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating gig:', error);

    if (error.message === 'Unauthorized - Please sign in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Freelancer or admin access required') {
      return NextResponse.json(
        { error: 'Only freelancers can create gigs' },
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
      { error: 'Failed to create gig' },
      { status: 500 }
    );
  }
}
