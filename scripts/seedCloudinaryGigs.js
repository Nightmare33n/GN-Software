/*
 * One-time script: upload local gig images to Cloudinary and upsert gigs in MongoDB.
 * Usage: node scripts/seedCloudinaryGigs.js
 * Env needed: MONGODB_URI, CLOUDINARY_* (and optional SEED_FREELANCER_EMAIL)
 */

import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "@/libs/cloudinary";
import Gig from "@/models/Gig";
import User from "@/models/User";

// Load env if not already loaded
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const localImages = {
  "/HeroImg.jpg": path.join(process.cwd(), "public", "HeroImg.jpg"),
  "/AndroidAppDevGig.png": path.join(process.cwd(), "public", "AndroidAppDevGig.png"),
  "/GigGabriel.png": path.join(process.cwd(), "public", "GigGabriel.png"),
  "/GigNightmare.jpg": path.join(process.cwd(), "public", "GigNightmare.jpg"),
};

const defaults = [
  {
    title: "Web Development",
    description: "Aplicaciones web modernas con React, Next.js y Node.js listas para escalar.",
    category: "web-development",
    price: 80,
    deliveryDays: 10,
    rating: 5,
    reviewCount: 12,
    image: "/HeroImg.jpg",
  },
  {
    title: "Android Mobile Apps",
    description: "Apps Android con experiencia nativa y performance optimizada.",
    category: "mobile-development",
    price: 50,
    deliveryDays: 7,
    rating: 4.9,
    reviewCount: 9,
    image: "/AndroidAppDevGig.png",
  },
  {
    title: "Minecraft Mods & Plugins",
    description: "Mods y plugins personalizados para comunidades y servidores.",
    category: "other",
    price: 5,
    deliveryDays: 5,
    rating: 5,
    reviewCount: 18,
    image: "/GigGabriel.png",
  },
  {
    title: "Minecraft Mods & Datapacks",
    description: "Datapacks a medida para tus mundos y servidores.",
    category: "other",
    price: 5,
    deliveryDays: 4,
    rating: 4.8,
    reviewCount: 11,
    image: "/GigNightmare.jpg",
  },
  {
    title: "API Development",
    description: "APIs REST/GraphQL seguras y performantes listas para producción.",
    category: "web-development",
    price: 5,
    deliveryDays: 6,
    rating: 4.9,
    reviewCount: 14,
    image: "/HeroImg.jpg",
  },
  {
    title: "Technical Consulting",
    description: "Consultoría técnica para decisiones estratégicas y arquitectura.",
    category: "other",
    price: 5,
    deliveryDays: 2,
    rating: 5,
    reviewCount: 7,
    image: "/HeroImg.jpg",
  },
];

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

async function ensureFreelancer() {
  const fallbackEmail = process.env.SEED_FREELANCER_EMAIL || process.env.NEXTAUTH_EMAIL || "seed@gnsoftware.dev";
  let user = await User.findOne({ email: fallbackEmail });
  if (!user) {
    user = await User.create({
      name: "Seed Freelancer",
      email: fallbackEmail,
      role: "freelancer",
      image: "/GNLogo.png",
      profileComplete: true,
    });
  } else if (user.role === "client") {
    user.role = "freelancer";
    await user.save();
  }
  return user;
}

async function uploadOnce(localPath, publicIdBase) {
  const publicId = `gigs/${publicIdBase}`;
  const res = await cloudinary.uploader.upload(localPath, {
    folder: "gigs",
    public_id: publicId,
    overwrite: false,
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });
  return { url: res.secure_url, publicId: res.public_id };
}

async function run() {
  await connectMongo();
  const freelancer = await ensureFreelancer();

  for (const gig of defaults) {
    const localPath = localImages[gig.image];
    if (!localPath) {
      console.warn(`No local image for ${gig.image}, skipping upload`);
      continue;
    }

    console.log(`Uploading ${gig.title} from ${gig.image}...`);
    const uploaded = await uploadOnce(localPath, gig.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

    await Gig.findOneAndUpdate(
      { title: gig.title },
      {
        title: gig.title,
        description: gig.description,
        category: gig.category,
        images: [uploaded],
        packages: {
          basic: {
            name: "Basic",
            description: gig.description,
            price: gig.price < 5 ? 5 : gig.price,
            deliveryDays: gig.deliveryDays,
            revisions: 1,
            features: [gig.category],
          },
        },
        rating: gig.rating,
        reviewCount: gig.reviewCount,
        isActive: true,
        freelancerId: freelancer._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Upserted gig: ${gig.title}`);
  }

  console.log("✅ Done. You can now refresh /gigs.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
