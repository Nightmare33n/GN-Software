"use client";

import React from "react";
import Image from "next/image";

const logos = [
  {
    name: "Fabric",
    imageSrc: "/fabric-logo.webp",
  },
  {
    name: "Forge",
    imageSrc: "/forgelogo.svg",
  },
  {
    name: "NeoForge",
    render: () => (
      <div className="flex h-full w-full items-center justify-center text-xs font-semibold tracking-wide">
        NF
      </div>
    ),
  },
  {
    name: "Java",
    imageSrc: "/javalogo.jpg",
  },
  {
    name: "C++",
    imageSrc: "/cpplogo.jpg",
  },
  {
    name: "Go",
    imageSrc: "/golanglogo.webp",
  },
];

const BrandCarousel = () => {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-wrap items-center gap-3 text-white/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Tech we support
          </span>
          <p className="text-sm sm:text-base text-white/70">
            Frameworks and runtimes we build and optimize for.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-gn-dark to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-gn-dark to-transparent" />

          <div className="marquee">
            <div className="marquee-track">
              {[...logos, ...logos].map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center gap-3 px-8 py-5 text-white shrink-0"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                    {item.imageSrc ? (
                      <Image
                        src={item.imageSrc}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    ) : (
                      item.render?.()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight">{item.name}</span>
                    <span className="text-xs text-white/50">Performance-ready builds</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee {
          overflow: hidden;
        }

        .marquee-track {
          display: flex;
          align-items: center;
          min-width: max-content;
          animation: marquee 18s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation-duration: 0.001ms;
            animation-iteration-count: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default BrandCarousel;
