import type { NextApiRequest, NextApiResponse } from "next";
import { getBaseURL } from "@/framework/basic-rest/utils/http";
import { getSiteSlug, SITE_HEADER } from "@/framework/basic-rest/utils/site";

/**
 * Proxy same-origin cho `/api/auth/jwt/*` → admin-vgd.
 *
 * 🔴 **Lý do tồn tại: refresh cookie phải là FIRST-PARTY.**
 *
 * Phiên storefront sống hoàn toàn nhờ `vgd_refresh_token` (httpOnly, do BE đặt).
 * Khi trình duyệt gọi thẳng `admin.vgd.vn`, cookie đó là **cookie bên thứ ba**
 * (`dynamicsportsvn.com` khác registrable domain với `admin.vgd.vn`) nên nó đi
 * kèm `SameSite=None`. Đo trên prod 2026-09-04:
 *
 * - trình duyệt CHO cookie bên thứ ba (Chromium mặc định hôm nay) ⇒ refresh 200;
 * - trình duyệt CHẶN (Safari/ITP mặc định, Chrome đang siết) ⇒ cookie **không
 *   được đính vào request**, refresh **401** ⇒ khách rơi về trạng thái khách
 *   vãng lai mỗi lần tải trang (và `refreshAccessToken` đá thẳng về `/signin`).
 *
 * Cho request đi qua chính origin của storefront thì cookie thành first-party,
 * không còn phụ thuộc chính sách bên thứ ba của trình duyệt. Đây là lý do
 * **không** quay lại `localStorage`: chỗ đó XSS đọc được, cookie httpOnly thì
 * không.
 *
 * ⚠ Refresh **xoay vòng token** (BE xoá token cũ, cấp token mới mỗi lần refresh).
 * Nghĩa là `Set-Cookie` của response refresh **bắt buộc** phải tới được trình
 * duyệt — nuốt nó đi là khách mất phiên cứng, không phải chỉ lỗi một request.
 *
 * Ranh giới: proxy này KHÔNG tự authorize gì cả. Laravel vẫn là security
 * boundary (`auth:api` cho me/profile/logout/change-password, rate limit
 * `api-auth` + `api-auth-refresh`).
 *
 * Bản sinh đôi ở `wildside-vgd/src/app/api/auth/jwt/[...path]/route.ts` — repo
 * đó là App Router nên viết bằng Route Handler; luật xử lý giống hệt.
 */

/**
 * Allow-list — proxy chỉ mở đúng những endpoint auth đang dùng
 * (`API_ENDPOINTS` trong `utils/api-endpoints.ts`). Không nhận path tuỳ ý:
 * upstream lấy từ env, path ghép từ danh sách này, nên không có đường nào biến
 * nó thành open proxy / SSRF.
 */
const ALLOWED_PATHS = new Set([
  "login",
  "register",
  "refresh",
  "logout",
  "me",
  "profile",
  "change-password",
  "forget-password",
  "reset-password",
]);

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH"]);

/** Header duy nhất được chuyển tiếp từ client lên (ngoài các header tự dựng). */
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept"];

/**
 * Header của response được giữ lại. Rate limit của BE theo IP vẫn còn hiệu lực
 * qua proxy (đo bằng bucket riêng cho từng `X-Forwarded-For`), nên khi BE trả
 * 429 thì client phải nhận được cả `Retry-After` — nuốt mất là client chỉ thấy
 * một con số 429 trần trụi không biết chờ bao lâu.
 */
const FORWARDED_RESPONSE_HEADERS = [
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
];

/** Chỉ chấp nhận thứ có hình dạng IP — chặn header injection và giá trị rác. */
const IP_SHAPE = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * IP thật của khách, để BE giữ nguyên rate limit theo IP.
 *
 * Không có bước này thì mọi khách của storefront dùng chung **một** bucket
 * (`api-auth-refresh` = 60/phút/IP) ⇒ đông khách là 429 hàng loạt.
 *
 * 🔴 **Phải lấy đầu PHẢI, không phải đầu trái** (sửa 2026-09-04). nginx của
 * Hostinger set `X-Forwarded-For $proxy_add_x_forwarded_for`, tức nó **nối
 * `$remote_addr` vào CUỐI** chuỗi client gửi lên. Lấy phần tử trái nhất là lấy
 * đúng phần **do trình duyệt tự khai** ⇒ khách nào cũng tự chọn được bucket rate
 * limit của mình. Đầu phải mới là IP nginx tự ghi.
 *
 * Ưu tiên `X-Real-IP`: `proxy_set_header` **ghi đè** giá trị client gửi lên nên
 * nó không giả được, và nó không phụ thuộc chuỗi XFF dài ngắn ra sao.
 */
function clientIp(req: NextApiRequest): string | null {
  const rawRealIp = req.headers["x-real-ip"];
  const realIp = (Array.isArray(rawRealIp) ? rawRealIp[0] : rawRealIp)?.trim();
  if (realIp && IP_SHAPE.test(realIp)) return realIp;

  const rawXff = req.headers["x-forwarded-for"];
  const xff = Array.isArray(rawXff) ? rawXff.join(",") : rawXff;
  if (xff) {
    const hops = xff.split(",").map((hop) => hop.trim()).filter(Boolean);
    const nearest = hops[hops.length - 1];
    if (nearest && IP_SHAPE.test(nearest)) return nearest;
  }
  return null;
}

/**
 * Viết lại `Set-Cookie` của admin-vgd cho hợp origin storefront:
 * - bỏ `Domain=` — cookie thành host-only của chính storefront;
 * - `SameSite=None` → `Lax` — request nay là same-site, và `Lax` chặn luôn
 *   POST cross-site nên không mở cửa CSRF khi cookie hết là bên thứ ba;
 * - bỏ `Secure` khi chạy http (dev), vì trình duyệt từ chối cookie `Secure`
 *   trên http và phiên sẽ hỏng im lặng ở local.
 * Giữ nguyên phần còn lại (`HttpOnly`, `Path`, `Max-Age`, `Expires`).
 */
function rewriteSetCookie(cookie: string, isSecureRequest: boolean): string {
  const parts = cookie.split(";");
  const rebuilt: string[] = [];
  let sawSameSite = false;

  parts.forEach((part, index) => {
    const trimmed = part.trim();
    if (index === 0) {
      rebuilt.push(trimmed); // name=value
      return;
    }
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("domain=")) return;
    if (lower === "secure" && !isSecureRequest) return;
    if (lower.startsWith("samesite=")) {
      sawSameSite = true;
      rebuilt.push("SameSite=Lax");
      return;
    }
    rebuilt.push(trimmed);
  });

  if (!sawSameSite) rebuilt.push("SameSite=Lax");
  return rebuilt.join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const segment = Array.isArray(req.query.path) ? req.query.path.join("/") : "";
  if (!ALLOWED_PATHS.has(segment) || !ALLOWED_METHODS.has(req.method ?? "")) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const headers = new Headers();
  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = req.headers[name];
    const single = Array.isArray(value) ? value[0] : value;
    if (single) headers.set(name, single);
  });

  // Site scope do SERVER quyết, không nhận từ client: storefront này chỉ phục vụ
  // đúng một site, để client tự khai `X-Site-Id` là cho nó tự chọn tenant.
  const slug = getSiteSlug();
  if (slug) headers.set(SITE_HEADER, slug);

  // Cookie: chỉ chuyển tiếp cookie của chính request này (đã là first-party).
  if (req.headers.cookie) headers.set("cookie", req.headers.cookie);

  const ip = clientIp(req);
  if (ip) headers.set("x-forwarded-for", ip);

  const hasBody = req.method !== "GET";
  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBaseURL()}/api/auth/jwt/${segment}`, {
      method: req.method,
      headers,
      // `bodyParser` mặc định của Pages Router đã parse JSON — serialize lại.
      // Mọi endpoint trong allow-list đều nhận JSON.
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    // Không lộ chi tiết nội bộ (host, lỗi DNS/timeout) ra response.
    res.status(502).json({ message: "Upstream unavailable" });
    return;
  }

  const isSecureRequest =
    (Array.isArray(req.headers["x-forwarded-proto"])
      ? req.headers["x-forwarded-proto"][0]
      : req.headers["x-forwarded-proto"]) === "https";

  const setCookies = upstream.headers
    .getSetCookie()
    .map((cookie) => rewriteSetCookie(cookie, isSecureRequest));
  if (setCookies.length > 0) res.setHeader("Set-Cookie", setCookies);

  FORWARDED_RESPONSE_HEADERS.forEach((name) => {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  });

  res.setHeader(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/json",
  );
  res.setHeader("Cache-Control", "no-store");
  res.status(upstream.status).send(await upstream.text());
}
