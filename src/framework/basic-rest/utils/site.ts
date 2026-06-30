/**
 * Site (tenant) scoping cho storefront — single source.
 *
 * **Host = nguồn canonical**: backend (`PublicSiteResolver` → `SiteDomainResolver`)
 * resolve site từ request Host qua bảng `site_domains` (1 Site → N Domain). Tức
 * deploy storefront ở đúng domain (vd vgd.vn) thì BE tự biết site, KHÔNG cần FE
 * gửi gì.
 *
 * `NEXT_PUBLIC_SITE_SLUG` + header `X-Site-Id` chỉ là **override cho dev/explicit**
 * (vd localhost không map domain nào, hoặc muốn ép site khác Host). Thứ tự BE:
 *   header `X-Site-Id` → `?site={slug}` → `Host` (site_domains) → null (global).
 *
 * Để trống + Host không khớp → backend fallback global — an toàn cho local/dev.
 */
export const SITE_HEADER = "X-Site-Id";

export function getSiteSlug(): string {
  return (process.env.NEXT_PUBLIC_SITE_SLUG ?? "").trim();
}

/**
 * Header object gắn site vào request — dùng cho SSR raw-fetch.
 * Rỗng nếu chưa cấu hình slug (path axios tự inject qua request interceptor).
 */
export function siteHeaders(): Record<string, string> {
  const slug = getSiteSlug();
  return slug ? { [SITE_HEADER]: slug } : {};
}
