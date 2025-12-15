"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import BrandCarousel from "@/components/BrandCarousel";

const AgencyHero = () => {
  return (
    <>
      {/* AgencyHero START */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column - Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl lg:text-7xl font-[ui-serif] font-bold leading-tight mb-6">
              Building Tomorrow&apos;s <span className="text-gradient">Digital Solutions</span>
            </h1>

            <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl">
              We craft high-performance web applications that scale with your
              business
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#contact" className="btn-primary-gn">
                Start Your Project
              </Link>
              <Link href="#services" className="btn-secondary-gn">
                View Our Work
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div
            className="flex-1 w-full max-w-lg lg:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
          >
            <div className="relative aspect-square lg:aspect-auto lg:h-[500px] overflow-hidden rounded-2xl">
              <Image
                src="/HeroImg.jpg"
                alt="Team collaborating on technology"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />

              {/* Subtle gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-gn-black/40 via-transparent to-gn-black/60" />
            </div>
          </motion.div>
        </div>
      </section>
      {/* AgencyHero END */}

      <BrandCarousel />
    </>
  );
};

export default AgencyHero;
