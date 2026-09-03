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
    // Next 16 chặn image optimizer trỏ tới IP nội bộ (`dangerouslyAllowLocalIP`
    // mặc định false — chống SSRF vào mạng nội bộ). Trên DEV, backend là
    // `http://localhost:80`, nên ảnh thay thế mà API trả về cho sản phẩm thiếu
    // ảnh (`http://localhost/images/no-image.png` — 55 lần trong 1 trang list
    // dsc) bị optimizer trả **400 `"url" parameter is not allowed`** ⇒ sản phẩm
    // thiếu ảnh không có cả ảnh thay thế. Host whitelist KHÔNG phải nguyên nhân:
    // `localhost` đã có trong `remotePatterns` dưới đây.
    // Chỉ mở trên dev; production giữ `false`.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
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
