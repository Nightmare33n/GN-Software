import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Gig from "@/models/Gig";
import User from "@/models/User";
import { requireAdmin } from "@/libs/auth";

const defaults = [
  {
    _id: "static-web-dev",
    title: "Web Development",
    description:
      "Aplicaciones web modernas con React, Next.js y Node.js listas para escalar.",
    category: "Web",
    price: 80,
    deliveryTime: "10 days",
    rating: 5,
    reviewCount: 12,
    coverImage: "/HeroImg.jpg",
  },
  {
    _id: "static-android",
    title: "Android Mobile Apps",
    description:
      "Apps Android con experiencia nativa y performance optimizada.",
    category: "Mobile",
    price: 50,
    deliveryTime: "7 days",
    rating: 4.9,
    reviewCount: 9,
    coverImage: "/AndroidAppDevGig.png",
  },
  {
    _id: "static-mods",
    title: "Minecraft Mods & Plugins",
    description:
      "Mods y plugins personalizados para comunidades y servidores.",
    category: "Gaming",
    price: 5,
    deliveryTime: "5 days",
    rating: 5,
    reviewCount: 18,
    coverImage: "/GigGabriel.png",
  },
  {
    _id: "static-datapacks",
    title: "Minecraft Mods & Datapacks",
    description: "Datapacks a medida para tus mundos y servidores.",
    category: "Gaming",
    price: 5,
    deliveryTime: "4 days",
    rating: 4.8,
    reviewCount: 11,
    coverImage: "/GigNightmare.jpg",
  },
  {
    _id: "static-api",
    title: "API Development",
    description:
      "APIs REST/GraphQL seguras y performantes listas para producción.",
    category: "Backend",
    price: 0,
    deliveryTime: "6 days",
    rating: 4.9,
    reviewCount: 14,
    coverImage: "/HeroImg.jpg",
  },
  {
    _id: "static-consulting",
    title: "Technical Consulting",
    description:
      "Consultoría técnica para decisiones estratégicas y arquitectura.",
    category: "Advisory",
    price: 0,
    deliveryTime: "2 days",
    rating: 5,
    reviewCount: 7,
    coverImage: "/HeroImg.jpg",
  },
];

const categoryMap = {
  Web: "web-development",
  Mobile: "mobile-development",
  Gaming: "other",
  Backend: "web-development",
  Advisory: "other",
};

function toGigPayload(item, freelancerId) {
  const category = categoryMap[item.category] || "other";
  const price = Math.max(5, item.price || 0); // Schema requires min 5

  return {
    title: item.title,
    description: item.description,
    category,
    images: [{ url: item.coverImage }],
    packages: {
      basic: {
        name: "Basic",
        description: item.description,
        price,
        deliveryDays: parseInt(item.deliveryTime) || 5,
        revisions: 1,
        features: [item.category],
      },
    },
    isActive: true,
    rating: item.rating || 0,
    reviewCount: item.reviewCount || 0,
    orders: 0,
    views: 0,
    freelancerId,
  };
}

async function ensureAdminFreelancer(adminId) {
  const admin = await User.findById(adminId);
  if (!admin) return null;

  if (admin.role === "client") {
    admin.role = "admin";
    await admin.save();
  }

  return admin;
}

export async function POST() {
  try {
    const admin = await requireAdmin();
    await connectMongo();

    const freelancer = await ensureAdminFreelancer(admin._id);
    if (!freelancer) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const results = [];

    for (const item of defaults) {
      const payload = toGigPayload(item, freelancer._id);
      const saved = await Gig.findOneAndUpdate(
        { title: item.title },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(saved);
    }

    return NextResponse.json({ message: "Default gigs seeded", count: results.length });
  } catch (error) {
    console.error("Error seeding default gigs:", error);
    return NextResponse.json({ error: "Failed to seed default gigs" }, { status: 500 });
  }
}
