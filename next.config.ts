import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.223",
    "http://192.168.0.223:3001",
    "192.168.0.189",
  ],
};

export default nextConfig;
