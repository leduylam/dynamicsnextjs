import { i18n } from "./next-i18next.config";

// M45 (đợt 19): đã bỏ plugin PWA. Next 16 build bằng Turbopack nên plugin webpack
// của nó KHÔNG chạy — không sinh sw.js, cấu hình runtimeCaching là chữ chết.
// `sw.js` cũ trên VPS đã xoá. Trình duyệt từng đăng ký SW sẽ không cập nhật được
// nữa (404); spec KHÔNG bảo đảm tự unregister khi 404 — muốn gỡ chắc chắn thì phục
// vụ một `sw.js` kill-switch gọi `self.registration.unregister()`.
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
  // Kill-switch `public/sw.js` phải được trình duyệt lấy bản mới ngay, không bị
  // cache HTTP giữ lại (trình duyệt vốn giới hạn ≤24h, nhưng đừng để CDN/proxy giữ).
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
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
export default nextConfig;
