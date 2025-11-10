import nextPWA from "next-pwa";
import runtimeCache from "next-pwa/cache";
import { i18n } from "./next-i18next.config";
const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  runtimeCaching: runtimeCache,
});
const nextConfig = {
  i18n,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dynamicsport.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.dynamicsportsvn.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
