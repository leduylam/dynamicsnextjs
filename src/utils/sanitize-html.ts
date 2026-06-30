import DOMPurify from "isomorphic-dompurify";

/**
 * Làm sạch HTML từ nguồn KHÔNG tin cậy (mô tả/nội dung sản phẩm trả về từ API)
 * trước khi render qua `dangerouslySetInnerHTML`.
 *
 * Giữ lại các thẻ định dạng thông thường (p, b, ul, a, img...) nhưng loại bỏ
 * `<script>`, các event handler (`onerror`, `onclick`...) và `javascript:` URL
 * → chặn Stored XSS. Dùng `isomorphic-dompurify` nên chạy được cả SSR lẫn client.
 */
export function sanitizeHtml(dirty?: string | null): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}

export default sanitizeHtml;
