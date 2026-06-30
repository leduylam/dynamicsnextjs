import { Item } from "@contexts/cart/cart.utils";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface AddToCartInput {
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  options?: Record<string, unknown>;
  unit?: string | null;
}

interface CartResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

/** Chuẩn hóa ảnh (string | object) cho options.image gửi lên server. */
function normalizeImage(raw: unknown): string {
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

/** Map item legacy (buildCartItemWithPrice) → payload admin-vgd /cart/items. */
function toAddPayload(item: any, quantity: number): AddToCartInput {
  const productId =
    typeof item.product_id === "number"
      ? item.product_id
      : parseInt(String(item.product_id ?? item.id).split(".")[0], 10);

  const variantIdRaw = item.variant_id;
  const variant_id =
    variantIdRaw == null
      ? null
      : typeof variantIdRaw === "number"
        ? variantIdRaw
        : parseInt(String(variantIdRaw), 10) || null;

  const attrs =
    item.attributes &&
    typeof item.attributes === "object" &&
    !Array.isArray(item.attributes)
      ? (item.attributes as Record<string, unknown>)
      : {};
  const options: Record<string, unknown> = { ...attrs };
  const img = normalizeImage(item.image);
  if (img) options.image = img;

  // KHÔNG gửi `price` từ client: giá do server (admin-vgd) tự resolve theo
  // product_id/variant_id + pricing tier của user/site. Gửi giá client → có thể
  // bị giả mạo (mua giá sỉ). Cart hiển thị cũng đọc giá từ response server.
  return {
    product_id: productId,
    variant_id,
    quantity,
    options,
    unit: item.unit ?? undefined,
  };
}

async function addToCart(item: any, quantity: number) {
  const { data } = await http.post<CartResponse>(
    API_ENDPOINTS.CART_ADD_ITEM,
    toAddPayload(item, quantity),
  );
  return data;
}

export const useCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ item, quantity }: { item: Item; quantity: number }) =>
      addToCart(item, quantity),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CARTS] });
    },
    onSuccess: (data) => {
      toast(data?.message || "Added to cart", {
        progressClassName: "fancy-progress-bar",
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    onError: (error) => {
      console.log(error, "Add to cart error response");
    },
  });
};
