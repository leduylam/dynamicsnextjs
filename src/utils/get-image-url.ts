/**
 * Resolve image path (relative or absolute) → URL hiển thị được.
 *
 * Khác client-vgd: client-dsc KHÔNG có rewrite `/_vgd-media/storage/`. Ảnh từ
 * admin-vgd (colorways / variants) có thể là path tương đối `/storage/...` hoặc
 * URL tuyệt đối. Prefix path tương đối bằng backend (NEXT_PUBLIC_REST_API_ENDPOINT,
 * trỏ admin-vgd phục vụ `/storage`). Giữ nguyên URL tuyệt đối.
 */

const PLACEHOLDER = "/assets/placeholder/products/product-grid.svg";

export const getImageUrl = (path?: string | null): string => {
  if (!path) return PLACEHOLDER;

  const trimmed = String(path).trim();
  if (!trimmed) return PLACEHOLDER;

  const backendUrl =
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";
  const cleanBackendUrl = backendUrl.replace(/\/+$/, "");

  // URL tuyệt đối: giữ nguyên.
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Asset nội bộ Next (không phải storage): giữ nguyên.
  if (trimmed.startsWith("/") && !trimmed.startsWith("/storage")) {
    return trimmed;
  }

  if (!cleanBackendUrl) {
    return trimmed;
  }

  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${cleanBackendUrl}/${cleanPath}`;
};
