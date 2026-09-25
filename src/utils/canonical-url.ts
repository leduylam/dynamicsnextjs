/**
 * Canonical của storefront DSC — domain công khai duy nhất (dscsport.vn trong
 * `site_domains` không phản hồi). Cố định có chủ đích: canonical phải trỏ về
 * prod kể cả khi build ở máy khác/staging.
 */
export const CANONICAL_ORIGIN = "https://dynamicsportsvn.com";

/**
 * URL canonical của trang đang xem: origin + path (giữ prefix locale khác mặc
 * định), BỎ query + hash — `?page=2`, `?sort=` hay tham số tracking không được
 * sinh ra URL mới trong mắt search engine (H30-1).
 * `asPath` của Next router không chứa prefix locale ⇒ tự thêm lại.
 */
export function buildCanonicalUrl(
  asPath: string,
  locale?: string,
  defaultLocale?: string,
): string {
  const path = (asPath.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  const prefix = locale && defaultLocale && locale !== defaultLocale ? `/${locale}` : "";
  const full = prefix + (path === "/" ? (prefix ? "" : "/") : path);
  return `${CANONICAL_ORIGIN}${full}`;
}
