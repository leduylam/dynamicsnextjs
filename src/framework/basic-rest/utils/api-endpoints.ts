export const API_ENDPOINTS = {
  // ── AUTH (admin-vgd JWT) ──────────────────────────────────────────────
  REGISTERS: "/api/auth/jwt/register",
  LOGIN: "/api/auth/jwt/login",
  REFRESH_TOKEN: "/api/auth/jwt/refresh",
  ME: "/api/auth/jwt/me",
  CHANGE_PASSWORD: "/api/auth/jwt/change-password",
  LOGOUT: "/api/auth/jwt/logout",
  FORGET_PASSWORD: "/api/auth/jwt/forget-password",
  RESET_PASSWORD: "/api/auth/jwt/reset-password",

  // ── HOME ──────────────────────────────────────────────────────────────
  CATEGORIES_SERVER: "/api/v1/categories",
  CATEGORIES: "/api/v1/categories",
  CATEGORY_BY_SLUG: (slug: string) => `/api/v1/categories/${slug}`,
  BRANDS: "/api/v1/brands",
  BANNERS: "/api/v1/banners",
  SECOND_BANNER: "/api/v1/banners",
  COLLECTION: "/api/v1/collections",

  // ── PRODUCT ───────────────────────────────────────────────────────────
  // PRODUCT / RELATED_PRODUCTS là base path; hook nối thêm /{slug}[/related].
  PRODUCTS: "/api/v1/products/list",
  PRODUCT: "/api/v1/products",
  RELATED_PRODUCTS: "/api/v1/products",
  NEW_ARRIVAL_PRODUCTS: "/api/v1/products/new-arrival",
  NEW_ARRIVAL_PRODUCTS_ANCIENT: "/api/v1/products/new-arrival",
  BEST_SELLER_PRODUCTS: "/api/v1/products/featured",
  BRANDS_FILTERS: "/api/v1/brands",
  SIZES: "/api/v1/products/attributes",
  SEARCH: "/api/v1/products/list",

  // ── CART (admin-vgd server cart — auth-only) ──────────────────────────
  // CARTS giữ vai trò React-Query key + base GET cart (mirror client-vgd CART).
  CARTS: "/api/v1/cart",
  CART_ADD_ITEM: "/api/v1/cart/items",
  CART_UPDATE_ITEM: (itemId: number | string) => `/api/v1/cart/items/${itemId}`,
  CART_REMOVE_ITEM: (itemId: number | string) => `/api/v1/cart/items/${itemId}`,
  CART_CLEAR: "/api/v1/cart",
  // Legacy alias giữ để callers cũ không vỡ; trỏ về server cart base.
  ADD_TO_CART: "/api/v1/cart/items",

  // ── CHECKOUT / ORDER (admin-vgd) ──────────────────────────────────────
  CHECKOUT: "/api/v1/checkout",
  ORDERS: "/api/v1/orders",
  ORDER: "/api/v1/orders",

  // ── ADDRESS (admin-vgd) ───────────────────────────────────────────────
  DELIVERY_ADDRESS: "/api/v1/addresses",
  ADDRESSES: "/api/v1/addresses",
  ADDRESS_DEFAULT: "/api/v1/addresses/default",

  // ── COMPANY (admin-vgd) ───────────────────────────────────────────────
  COMPANIES: "/api/v1/companies",

  // ── RETAILER LOCATOR (admin-vgd) ──────────────────────────────────────
  RETAILER_LOCATOR: "/api/v1/retailer-locator",
  PROVINCES: "/api/v1/retailer-locator/provinces",
};
