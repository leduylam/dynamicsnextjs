import nextPWA from "next-pwa";
import runtimeCache from "next-pwa/cache";
import { i18n } from "./next-i18next.config";
/**
 * M45: origin API (admin-vgd) KHÔNG được qua cache của service worker.
 * Bộ mặc định của next-pwa bắt mọi request cross-origin bằng `NetworkFirst`
 * cache 1h ⇒ response API (kể cả bản có Bearer: giá, đơn, tài khoản) nằm lại
 * trong Cache Storage của trình duyệt và được trả ra khi mạng chậm >10s.
 * Rule đứng ĐẦU mảng vì Workbox lấy route khớp đầu tiên; asset tĩnh (ảnh S3,
 * font, js/css) vẫn đi các rule mặc định phía sau.
 * `urlPattern` phải là RegExp (hàm bị serialize vào sw.js, mất closure).
 * ⚠ Máy khách đã cài SW cũ vẫn giữ cache `cross-origin` tới khi SW mới
 * activate (lần tải trang kế tiếp) và entry hết hạn (≤1h).
 */
// `URL.origin` bỏ port mặc định (`http://localhost:80` → `http://localhost`) —
// khớp đúng URL mà trình duyệt thực sự gửi đi.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "").origin;
  } catch {
    return "";
  }
})();
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const apiNetworkOnly = apiOrigin
  ? [
      {
        urlPattern: new RegExp(`^${escapeRegExp(apiOrigin)}/`, "i"),
        handler: "NetworkOnly",
      },
    ]
  : [];

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  runtimeCaching: [...apiNetworkOnly, ...runtimeCache],
});
const nextConfig = {
  i18n,
  typescript: {
    ignoreBuildErrors: true,
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
  // Link trong mail đơn cũ trỏ `/order/{id}` (404) — trang chi tiết thật là
  // `/my-account/orders/[id]`. `/order` (không id) là trang riêng, không đụng.
  async redirects() {
    return [
      {
        source: "/order/:id",
        destination: "/my-account/orders/:id",
        permanent: true,
      },
    ];
  },
};
export default withPWA(nextConfig);
