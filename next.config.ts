import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "svalbard.ca",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
