import nextPWA from "next-pwa";
import runtimeCache from "next-pwa/cache";
const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  runtimeCaching: runtimeCache,
});

export default withPWA({
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    console.log("Webpack config:", config);
    return config;
  },
});
