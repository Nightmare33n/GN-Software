const services = [
  {
    title: "Web Development",
    description:
      "Custom web applications built with modern frameworks like React, Next.js, and Node.js",
    hasImage: false,
  },
  {
    title: "Mobile Apps",
    description:
      "Cross-platform mobile solutions that deliver native-like experiences",
    hasImage: false,
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
      "User-centered design that prioritizes accessibility and engagement",
    hasImage: false,
  },
  {
    title: "API Development",
    description:
      "RESTful and GraphQL APIs designed for performance and reliability",
    hasImage: false,
  },
  {
    title: "Technical Consulting",
    description:
      "Strategic guidance to help your team make informed technology decisions",
    hasImage: false,
  },
];

const AgencyServices = () => {
  return (
    <>
      {/* AgencyServices START */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-4">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Comprehensive software solutions tailored to your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-neutral/20 transition-all duration-500 group cursor-pointer h-[400px]"
            >
              {/* Background Image or Placeholder */}
              {service.hasImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                  style={{
                    backgroundImage: `url(${service.imageUrl})`,
                  }}
                >
                  {/* Overlay with opacity effect */}
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-500"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gn-dark via-gn-black to-gn-dark transition-all duration-700 group-hover:scale-105">
                  {/* Decorative placeholder elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gn-cyan/5 to-gn-emerald/5"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-gn-cyan/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-gn-emerald/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              )}

              {/* Content - Superpuesto sobre la imagen */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                {/* Title */}
                <h3 className="text-3xl font-bold mb-4 text-white transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-white/80 leading-relaxed text-base group-hover:text-white transition-colors duration-300">
                  {service.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center gap-2 text-gn-cyan opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-semibold">Learn More</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* AgencyServices END */}
    </>
  );
};

export default AgencyServices;
