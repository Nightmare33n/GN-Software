import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Gig from "@/models/Gig";
import User from "@/models/User";

const gigsToSeed = [
  {
    title: "Full-Stack Web App with Next.js",
    description:
      "Aplicación web moderna con Next.js, APIs seguras y despliegue listo para escalar en la nube.",
    category: "web-development",
    images: [{ url: "/HeroImg.jpg" }],
    packages: {
      basic: {
        name: "MVP Build",
        description: "Landing + auth + CMS ligero con despliegue en Vercel listo para demo.",
        price: 1200,
        deliveryDays: 10,
        revisions: 2,
        features: ["UI responsiva", "Integración CMS", "Deploy incluido"],
      },
    },
    rating: 5,
    reviewCount: 18,
    orders: 32,
    views: 210,
  },
  {
    title: "Android App Nativa con Play Store",
    description:
      "Desarrollo de app Android optimizada, integración con APIs y publicación en Google Play.",
    category: "mobile-development",
    images: [{ url: "/AndroidAppDevGig.png" }],
    packages: {
      basic: {
        name: "App Base",
        description: "Pantallas principales, login y consumo de API con arquitectura limpia.",
        price: 900,
        deliveryDays: 9,
        revisions: 2,
        features: ["Diseño Material", "Auth + API", "Publicación Play"],
      },
    },
    rating: 4.9,
    reviewCount: 12,
    orders: 21,
    views: 180,
  },
  {
    title: "Branding y UI Kit para Producto Digital",
    description:
      "Identidad visual, UI kit y componentes listos para desarrollo en Figma con handoff claro.",
    category: "design",
    images: [{ url: "/HeroImg.jpg" }],
    packages: {
      basic: {
        name: "UI Starter",
        description: "Paleta, tipografía y 10 pantallas clave con auto-layout y variantes.",
        price: 680,
        deliveryDays: 7,
        revisions: 3,
        features: ["Brand board", "10 pantallas", "Design tokens"],
      },
    },
    rating: 4.8,
    reviewCount: 9,
    orders: 15,
    views: 140,
  },
  {
    title: "SEO Content y Tech Writing",
    description:
      "Artículos técnicos optimizados para SEO con research, ejemplos de código y tono claro.",
    category: "writing",
    images: [{ url: "/HeroImg.jpg" }],
    packages: {
      basic: {
        name: "Post Técnico",
        description: "Artículo de 1200 palabras con keywords, imágenes y revisión de estilo.",
        price: 320,
        deliveryDays: 4,
        revisions: 2,
        features: ["Keyword research", "Capturas/diagrams", "Meta tags"],
      },
    },
    rating: 5,
    reviewCount: 7,
    orders: 11,
    views: 95,
  },
  {
    title: "Growth & Performance Marketing",
    description:
      "Campañas multicanal con tracking, landing optimizadas y reportes accionables.",
    category: "marketing",
    images: [{ url: "/HeroImg.jpg" }],
    packages: {
      basic: {
        name: "Launch Sprint",
        description: "Set up de campañas, píxeles y 2 landings A/B con dashboards en Looker.",
        price: 750,
        deliveryDays: 8,
        revisions: 2,
        features: ["Píxeles & tags", "Copy A/B", "Dashboard semanal"],
      },
    },
    rating: 4.9,
    reviewCount: 10,
    orders: 14,
    views: 130,
  },
  {
    title: "Video Demo y Motion Graphics",
    description:
      "Video demo de producto con motion graphics, guion y assets optimizados para redes.",
    category: "video",
    images: [{ url: "/HeroImg.jpg" }],
    packages: {
      basic: {
        name: "Demo 60s",
        description: "Guion, edición y animaciones ligeras con entrega en 1080p listo para ads.",
        price: 600,
        deliveryDays: 6,
        revisions: 2,
        features: ["Guion + storyboard", "Animaciones ligeras", "Subtítulos"],
      },
    },
    rating: 4.7,
    reviewCount: 6,
    orders: 9,
    views: 90,
  },
  {
    title: "Minecraft Mods y Plugins a Medida",
    description:
      "Desarrollo de mods/plugins optimizados para servidores con documentación y soporte.",
    category: "other",
    images: [{ url: "/GigGabriel.png" }],
    packages: {
      basic: {
        name: "Plugin Base",
        description: "Feature principal, comandos y permisos configurables con entrega lista.",
        price: 450,
        deliveryDays: 5,
        revisions: 2,
        features: ["Optimización", "Compatibilidad", "Docs básicas"],
      },
    },
    rating: 5,
    reviewCount: 11,
    orders: 19,
    views: 160,
  },
  {
    title: "Consultoría Técnica y Arquitectura",
    description:
      "Sesiones 1:1 para arquitectura, escalabilidad, costos cloud y roadmap técnico.",
    category: "other",
    images: [{ url: "/HeroImg.jpg" }],
    packages: {
      basic: {
        name: "Session Pack",
        description: "Dos sesiones de 60 minutos con entregables y plan de acción concreto.",
        price: 300,
        deliveryDays: 2,
        revisions: 1,
        features: ["Auditoría stack", "Plan de acción", "Q&A follow-up"],
      },
    },
    rating: 5,
    reviewCount: 8,
    orders: 13,
    views: 85,
  },
];

async function ensureFreelancer() {
  const fallbackEmail = process.env.SEED_FREELANCER_EMAIL || "seed@gnsoftware.dev";
  const existing = await User.findOne({ email: fallbackEmail });

  if (existing) {
    if (existing.role === "client") {
      existing.role = "freelancer";
      await existing.save();
    }
    return existing;
  }

  return User.create({
    name: "GN Seed Freelancer",
    email: fallbackEmail,
    role: "freelancer",
    image: "/GNLogo.png",
    bio: "Default freelancer used to seed showcase gigs.",
    skills: ["Next.js", "Node.js", "Design", "Android"],
    profileComplete: true,
    rating: 5,
    reviewCount: 25,
  });
}

export async function POST(req) {
  try {
    const token = process.env.SEED_TOKEN;
    const provided = new URL(req.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing SEED_TOKEN" }, { status: 500 });
    }

    if (!provided || provided !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const freelancer = await ensureFreelancer();

    const results = [];
    for (const gig of gigsToSeed) {
      const saved = await Gig.findOneAndUpdate(
        { title: gig.title },
        { ...gig, freelancerId: freelancer._id, isActive: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(saved);
    }

    return NextResponse.json({ message: "Seeded gigs", count: results.length });
  } catch (error) {
    console.error("Error seeding gigs:", error);
    return NextResponse.json({ error: "Failed to seed gigs" }, { status: 500 });
  }
}
