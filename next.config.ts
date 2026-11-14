import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/mistri/bookings/:id',
        destination: '/bookings/:id',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

