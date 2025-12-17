"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LearnMoreButton from "@/components/LearnMoreButton";

const services = [
  {
    title: "Web Development",
    description:
      "Custom web applications built with modern frameworks like React, Next.js, and Node.js",
    hasImage: true,
    imageUrl: "/webgig.jpg",
    backgroundPosition: "90% center",
    scale: 1,
  },
  {
    title: "Android Mobile Apps",
    description:
      "Android mobile solutions that deliver native-like experiences",
    hasImage: true,
    imageUrl: "/AndroidAppDevGig.png",
  },
  {
    title: "Desktop Apps",
    description:
      "Cross-platform desktop applications built with modern stacks for speed and reliability",
    hasImage: false,
    fullWidth: true,
  },
  {
    title: "Minecraft Mods & Plugins",
    description:
      "Custom Minecraft modifications and server plugins tailored to your community's unique needs",
    hasImage: true,
    imageUrl: "/GigGabriel.png",
  },
  {
    title: "Minecraft Mods & Datapacks",
    description:
      "Custom datapacks and modding setups tailored for your worlds and servers",
    hasImage: true,
    imageUrl: "/GigNightmare.jpg",
  },
  {
    title: "Minecraft Textures & 3D Models",
    description:
      "Design of optimized Minecraft textures and 3D models, ready to plug into your worlds and servers",
    hasImage: true,
    imageUrl: "/GigTexture3DModel.png",
  },
  {
    title: "Minecraft Websites & Consulting",
    description:
      "Landing pages and portals for Minecraft communities with end-to-end technical consulting",
    hasImage: true,
    imageUrl: "/GigMinecraftWebsiteCover.jpg",
  },
];

const AgencyServices = () => {
  const hoverSoundRef = useRef(null);
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    const audio = new Audio("/sounds/interface-soft-click-131438.mp3");
    audio.volume = 0.35;
    hoverSoundRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  const playHoverSound = () => {
    const audio = hoverSoundRef.current;
    if (!audio) return;

    const now = performance.now();
    if (now - lastPlayedRef.current < 200) return; // 0.2s cooldown
    lastPlayedRef.current = now;

    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  return (
    <>
      {/* AgencyServices START */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold mb-4">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Comprehensive software solutions tailored to your business needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-2xl border border-neutral/20 transition-all duration-500 group cursor-pointer h-[400px] ${service.fullWidth ? 'md:col-span-2' : ''}`}
              onMouseEnter={playHoverSound}
              onFocus={playHoverSound}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Background Image or Placeholder */}
              {service.hasImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 [transform:scale(var(--base-scale,1))] group-hover:[transform:scale(calc(var(--base-scale,1)*1.1))] group-hover:rotate-2"
                  style={{
                    backgroundImage: `url(${service.imageUrl})`,
                    backgroundPosition: service.backgroundPosition || "center",
                    "--base-scale": service.scale || 1,
                  }}
                >
                  {/* Overlay with opacity effect */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-transparent transition-all duration-500"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gn-dark via-gn-black to-gn-dark transition-all duration-700 group-hover:scale-105">
                  {/* Decorative placeholder elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gn-cyan/5 to-gn-emerald/5"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-gn-cyan/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-gn-emerald/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              )}

              {/* Content panel with glassy hover reveal */}
              <div className="relative z-10 h-full">
                <div className="absolute inset-x-0 bottom-0">
                  <div className="w-full rounded-t-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-500 translate-y-[120%] group-hover:translate-y-0">
                    <div className="p-6 md:p-7">
                      <h3
                        className="text-3xl font-bold mb-3 transition-colors duration-300"
                        style={{
                          color: "#ffffff",
                          textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                        }}
                      >
                        {service.title}
                      </h3>

                      <p
                        className="leading-relaxed text-base transition-colors duration-300"
                        style={{
                          color: "#ffffff",
                          textShadow: "0 1.5px 10px rgba(0,0,0,0.5)",
                        }}
                      >
                        {service.description}
                      </p>

                      <div className="mt-6 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        <LearnMoreButton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* AgencyServices END */}
    </>
  );
};

export default AgencyServices;
