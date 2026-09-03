import Cookies from "js-cookie";

/**
 * Access token sống TRONG BỘ NHỚ, không nằm ở cookie/localStorage (2026-09-03).
 *
 * Vì sao: cookie `client_access_token` cũ **JS đọc được**, nên mọi đoạn script
 * chạy trên trang — kể cả script chèn qua XSS hay một thư viện bên thứ ba — đều
 * lấy được token và dùng nó gọi API thay mặt khách. Bearer token không có cách
 * nào ràng buộc vào thiết bị, nên lộ là dùng được ngay ở máy khác cho tới khi
 * JWT hết 60 phút.
 *
 * Biến module là đủ và đúng: SPA chỉ có một axios instance, và mất token khi
 * reload KHÔNG phải mất phiên — phiên do **refresh cookie httpOnly 30 ngày** của
 * BE giữ, `bootstrapSession()` lấy lại access token mới lúc khởi động.
 *
 * ⚠ Hệ quả bắt buộc, đừng lách: **SSR không đọc được token nữa**. Đó là chủ
 * đích, không phải thiếu sót — giá chỉ dành cho người đã đăng nhập nên nó không
 * được có mặt trong HTML render sẵn. Trang SSR render như khách vãng lai, phần
 * phụ thuộc danh tính do client fetch sau khi mount.
 */
let accessToken: string | null = null;

/**
 * Cờ "có phiên đăng nhập" — **không phải bí mật**, chỉ mang giá trị "1".
 *
 * Cần vì refresh cookie là httpOnly: JS không đọc được nó, nên không có cách nào
 * khác để biết "có đáng gọi refresh không" mà không bắn một request refresh cho
 * MỌI khách vãng lai. Mất cờ ⇒ cùng lắm đăng nhập lại. Lộ cờ ⇒ không ai làm
 * được gì với nó.
 */
const SESSION_HINT_KEY = "vgd_session";

/** Cookie CŨ, chỉ còn để DỌN cho máy đang giữ chúng từ bản trước. */
const LEGACY_ACCESS_COOKIE_KEY = "client_access_token";
const LEGACY_REFRESH_COOKIE_KEY = "client_refresh_token";

const isBrowser = () => typeof window !== "undefined";

export const getToken = (): string | null => (isBrowser() ? accessToken : null);

/**
 * Câu hỏi ĐÚNG để quyết định có gọi refresh hay không.
 *
 * KHÔNG phải "còn access token không" (reload là mất, mà phiên vẫn sống), và
 * KHÔNG phải `getRefreshToken()` như bản cũ: hàm đó đọc cookie
 * `client_refresh_token` — cookie **chưa bao giờ được ghi** ở bản hiện tại (BE
 * bỏ `refresh_token` khỏi body login, writer duy nhất hết caller) ⇒ mọi lần
 * refresh rơi thẳng vào nhánh "không có refresh token", `clearAuthSession()` rồi
 * đá về `/signin`. Đó là lý do khách bị đăng xuất khi JWT hết 60 phút.
 */
export const hasSessionHint = (): boolean =>
  isBrowser() && Cookies.get(SESSION_HINT_KEY) === "1";

const hintOptions = (remember?: boolean): Cookies.CookieAttributes => ({
  // Không remember ⇒ cookie phiên (mất khi đóng trình duyệt). Có remember thì
  // trần 30 ngày = đúng tuổi thọ refresh cookie của BE; dài hơn chỉ đẻ ra một
  // lần refresh chắc chắn 401.
  ...(remember ? { expires: 30 } : {}),
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

export const setAccessToken = (token: string, remember?: boolean) => {
  accessToken = token;

  if (!isBrowser()) return;

  Cookies.set(SESSION_HINT_KEY, "1", hintOptions(remember));
  // Dọn cookie của bản cũ ngay lần đăng nhập đầu sau khi lên bản này — nếu
  // không, token cũ còn nằm đó tới ngày hết hạn và vẫn đọc được bằng JS.
  Cookies.remove(LEGACY_ACCESS_COOKIE_KEY, { path: "/" });
  Cookies.remove(LEGACY_ACCESS_COOKIE_KEY);
  Cookies.remove(LEGACY_REFRESH_COOKIE_KEY, { path: "/" });
  Cookies.remove(LEGACY_REFRESH_COOKIE_KEY);
};

/**
 * Xoá phiên phía client. Đổi tên từ `clearAuthCookies` 2026-09-03: token nay ở
 * bộ nhớ, một cái tên chỉ nói tới cookie sẽ khiến người đọc sau tưởng gọi nó là
 * đủ để quên token — đúng kiểu tên-nói-dối đã gây ra bug refresh ở repo này.
 */
export const clearAuthSession = () => {
  accessToken = null;

  if (!isBrowser()) return;

  Cookies.remove(SESSION_HINT_KEY, { path: "/" });
  Cookies.remove(LEGACY_ACCESS_COOKIE_KEY, { path: "/" });
  Cookies.remove(LEGACY_ACCESS_COOKIE_KEY);
  Cookies.remove(LEGACY_REFRESH_COOKIE_KEY, { path: "/" });
  Cookies.remove(LEGACY_REFRESH_COOKIE_KEY);
};
