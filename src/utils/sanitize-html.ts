import DOMPurify from "isomorphic-dompurify";

/**
 * Làm sạch HTML từ nguồn KHÔNG tin cậy (mô tả/nội dung sản phẩm trả về từ API)
 * trước khi render qua `dangerouslySetInnerHTML`.
 *
 * Giữ lại các thẻ định dạng thông thường (p, b, ul, a, img...) nhưng loại bỏ
 * `<script>`, các event handler (`onerror`, `onclick`...) và `javascript:` URL
 * → chặn Stored XSS. Dùng `isomorphic-dompurify` nên chạy được cả SSR lẫn client.
 *
 * Mức chặn giữ NGANG `vgd-next/src/lib/sanitize.ts` (việc #401 — mỗi repo một file, không package chung):
 * ngoài XSS còn bỏ thứ phá trang dù không chạy script — `<style>` đè CSS toàn trang, form/input giả
 * (phishing), iframe/object/embed, `style` inline tuỳ ý (`position:fixed` phủ màn hình, font đè font site).
 * `style` chỉ giữ vài thuộc tính trình bày chữ theo allowlist. Đổi mức chặn ở một repo thì đối chiếu hai
 * repo kia.
 */

/** Thẻ gỡ hẳn (kể cả khi profile html cho phép). */
const FORBID_TAGS = [
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "iframe",
  "object",
  "embed",
];

const COLOR =
  /^(#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?\(\s*\d{1,3}%?\s*(,\s*\d{1,3}%?\s*){2}(,\s*(0|1|0?\.\d+)\s*)?\)|[a-z]{3,20})$/;
const TEXT_DECORATION = /^(none|underline|overline|line-through)(\s+(underline|overline|line-through))*$/;

/** Thuộc tính `style` được giữ → kiểm giá trị. Ngoài danh sách ⇒ bỏ. */
const STYLE_ALLOWLIST: Record<string, (value: string) => boolean> = {
  "text-align": (v) => /^(left|right|center|justify|start|end)$/.test(v),
  "font-weight": (v) => /^(normal|bold|bolder|lighter|[1-9]00)$/.test(v),
  "font-style": (v) => /^(normal|italic|oblique)$/.test(v),
  "text-decoration": (v) => TEXT_DECORATION.test(v),
  "text-decoration-line": (v) => TEXT_DECORATION.test(v),
  color: (v) => COLOR.test(v) && !/^(expression|url|var|inherit)/.test(v),
};

/** `style` inline → chỉ còn khai báo trong allowlist; rỗng ⇒ `""`. */
function filterStyle(style: string): string {
  return style
    .split(";")
    .flatMap((declaration) => {
      const index = declaration.indexOf(":");
      if (index < 0) return [];
      const property = declaration.slice(0, index).trim().toLowerCase();
      const value = declaration.slice(index + 1).trim().toLowerCase().replace(/\s*!important$/, "");
      const allow = STYLE_ALLOWLIST[property];
      return allow && allow(value) ? [`${property}: ${value}`] : [];
    })
    .join("; ");
}

/**
 * Hook chạy SAU khi DOMPurify lọc thuộc tính của mỗi node — gắn một lần cho instance dùng chung
 * (module chỉ nạp một lần mỗi runtime; repo không còn chỗ nào khác dùng DOMPurify).
 */
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  // Duck-typing thay `instanceof Element`: server (jsdom) không có global `Element`.
  const element = node as Element;
  if (typeof element.getAttribute !== "function") return;

  const style = element.getAttribute("style");
  if (style === null) return;
  const kept = filterStyle(style);
  if (kept) element.setAttribute("style", kept);
  else element.removeAttribute("style");
});

export function sanitizeHtml(dirty?: string | null): string {
  if (!dirty) return "";
  // USE_PROFILES html-only: bỏ SVG/MathML. `target` bị DOMPurify gỡ mặc định ⇒ link trong mô tả không mở
  // tab mới, nên không có tab-nabbing cần `rel="noopener"`.
  return DOMPurify.sanitize(String(dirty), { USE_PROFILES: { html: true }, FORBID_TAGS });
}

export default sanitizeHtml;
