import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { State } from "@contexts/cart/cart.reducer";
import { getToken } from "@framework/utils/get-token";

/** Ưu tiên promotion_price, không có thì product_price, cuối cùng price */
export const getEffectiveCartPrice = (
  item: Record<string, unknown>,
): number => {
  const raw = item.promotion_price ?? item.product_price ?? item.price;
  return raw != null && raw !== "" ? Number(raw) || 0 : 0;
};

/** Chuẩn hóa ảnh từ API (string | { thumbnail, original, url }) */
function normalizeCartImageUrl(raw: unknown): string {
  if (raw == null || raw === "") return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object" && raw !== null) {
    const o = raw as {
      thumbnail?: string;
      original?: string;
      url?: string;
      image?: string;
    };
    const s = o.thumbnail || o.original || o.url || o.image || "";
    return typeof s === "string" ? s.trim() : "";
  }
  return "";
}

/**
 * Item shape mà các component cart/checkout của client-dsc đang đọc.
 * Adapt từ admin-vgd CartItem để giữ nguyên UI (id, name, slug, image, sku,
 * price, quantity, attributes, product_price, promotion_price...).
 */
export interface AdaptedCartItem {
  /** id = cart_item.id (server). Cần để PATCH/DELETE qua /cart/items/{id}. */
  id: number;
  product_id: number;
  variant_id?: number | null;
  name: string;
  slug: string;
  sku?: string;
  image: string;
  price: number;
  product_price?: number;
  promotion_price?: number | null;
  quantity: number;
  attributes: Record<string, unknown>;
  unit?: string | null;
  itemTotal?: number;
  [key: string]: unknown;
}

/** admin-vgd CartItem (envelope data.items[]) */
interface ApiCartItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  product_sku?: string;
  variant_name?: string;
  variant_sku?: string;
  price: number;
  original_price?: number;
  base_price?: number;
  final_price?: number;
  quantity: number;
  subtotal: number;
  total: number;
  options?: Record<string, unknown>;
  unit?: string | null;
  product?: { id: number; name: string; slug: string; image?: unknown };
  variant?: { id: number; name?: string; sku?: string; image?: unknown };
}

interface ApiCart {
  id: number;
  uuid: string;
  items: ApiCartItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  total_items: number;
  total_unique_items: number;
}

interface CartResponse {
  success: boolean;
  data?: ApiCart;
  message?: string;
}

function adaptApiItem(apiItem: ApiCartItem): AdaptedCartItem {
  const fromOptions = normalizeCartImageUrl(
    (apiItem.options as { image?: unknown; main_image?: unknown } | undefined)
      ?.image ??
      (apiItem.options as { image?: unknown; main_image?: unknown } | undefined)
        ?.main_image,
  );
  const vImg = normalizeCartImageUrl(apiItem.variant?.image);
  const pImg = normalizeCartImageUrl(apiItem.product?.image);
  const image = fromOptions || vImg || pImg || "";

  const effectivePrice = apiItem.final_price ?? apiItem.price;

  return {
    id: apiItem.id,
    product_id: apiItem.product_id,
    variant_id: apiItem.variant_id,
    name: apiItem.product_name,
    slug: apiItem.product?.slug || "",
    sku: apiItem.variant_sku || apiItem.variant?.sku || apiItem.product_sku,
    image,
    price: effectivePrice,
    product_price: apiItem.base_price ?? apiItem.price,
    promotion_price: apiItem.final_price ?? null,
    quantity: apiItem.quantity,
    attributes:
      apiItem.options && typeof apiItem.options === "object"
        ? (apiItem.options as Record<string, unknown>)
        : {},
    unit: apiItem.unit ?? undefined,
  };
}

export const fetchCarts = async (): Promise<ApiCart | null> => {
  const { data } = await http.get<CartResponse>(API_ENDPOINTS.CARTS);
  if (data?.success && data?.data) {
    return data.data;
  }
  return null;
};

export const useCartQuery = (options = {}) => {
  return useQuery<State, Error>({
    queryKey: [API_ENDPOINTS.CARTS],
    queryFn: async () => {
      const apiCart = await fetchCarts();
      const items: AdaptedCartItem[] = (apiCart?.items ?? []).map(adaptApiItem);
      const totalItems =
        apiCart?.total_items ??
        items.reduce((sum, it) => sum + (it.quantity || 0), 0);
      const totalUniqueItems = apiCart?.total_unique_items ?? items.length;
      const total =
        apiCart?.total ??
        items.reduce(
          (sum, it) => sum + getEffectiveCartPrice(it) * (it.quantity || 0),
          0,
        );
      return {
        items: items.map((it) => ({
          ...it,
          itemTotal: it.price * (it.quantity || 0),
        })),
        isEmpty: items.length === 0,
        totalItems,
        totalUniqueItems,
        total,
      };
    },
    // Cart per-user — chỉ fetch khi đã đăng nhập (admin-vgd cart auth-only).
    // Guest không có server cart → tránh gọi /api/v1/cart (401) khi chưa auth.
    enabled: typeof window !== "undefined" && !!getToken(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
};
