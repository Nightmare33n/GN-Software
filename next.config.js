const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "images.pexels.com",
      "cdn.simpleicons.org",
      "logos-world.net",
    ],
  },
};

module.exports = nextConfig;
