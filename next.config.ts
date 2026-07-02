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
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dynamicsport.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        // Bucket vgd-golf (logo/ảnh site VGD, vd FootJoy) — cần whitelist kẻo
        // next/image vỡ với "hostname not configured".
        protocol: "https",
        hostname: "vgd-golf.s3.ap-southeast-1.amazonaws.com",
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
  turbopack: {},
};
export default withPWA(nextConfig);
