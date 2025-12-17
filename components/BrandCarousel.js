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
  const theme = {
    text: "var(--text)",
    muted: "var(--muted)",
    card: "var(--card)",
    border: "var(--border)",
    bg: "var(--bg)",
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-wrap items-center gap-3" style={{ color: theme.muted }}>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.card,
              color: theme.text,
            }}
          >
            Tech we support
          </span>
          <p className="text-sm sm:text-base" style={{ color: theme.muted }}>
            Frameworks and runtimes we build and optimize for.
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl backdrop-blur"
          style={{
            border: `1px solid ${theme.border}`,
            background: theme.card,
          }}
        >
          {/* edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-28"
            style={{ background: `linear-gradient(to right, ${theme.bg}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-28"
            style={{ background: `linear-gradient(to left, ${theme.bg}, transparent)` }}
          />

          <div className="marquee">
            <div className="marquee-track">
              {[...logos, ...logos].map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex shrink-0 items-center gap-3 px-8 py-5"
                >
                  <div
                    className="relative h-14 w-14 overflow-hidden rounded-full"
                    style={{
                      border: `1px solid ${theme.border}`,
                      background: theme.bg,
                      boxShadow: `0 0 0 1px ${theme.border}`,
                    }}
                  >
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
                    <span
                      className="text-sm font-semibold leading-tight"
                      style={{ color: theme.text }}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs" style={{ color: theme.muted }}>
                      Performance-ready builds
                    </span>
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
