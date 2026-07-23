import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

// Contract khớp admin-vgd `CheckoutRequest` (POST /api/v1/checkout). Cart server-side
// (resolve theo user/site) → KHÔNG gửi items/total/address_id. Mirror client-vgd.
export interface CheckoutInputType {
  name: string;
  email: string;
  phone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingStateProvince: string;
  shippingCountry: string; // ISO-2 (vd "VN")
  company?: string | null;
  customerNote?: string;
  saveAddress?: boolean;
}

async function checkout(input: CheckoutInputType) {
  return http.post(API_ENDPOINTS.CHECKOUT, input);
}
export const useCheckoutMutation = () => {
  return useMutation({
    mutationFn: (input: CheckoutInputType) => checkout(input),
    onSuccess: (data) => {
      toast(data.data.message, {
        progressClassName: "fancy-progress-bar",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // router.push(ROUTES.ORDERS)
      // queryClient.invalidateQueries({
      //   queryKey: [API_ENDPOINTS.CARTS]
      // })
    },
    onError: (error) => {
      // Phân biệt lỗi nghiệp vụ (BE trả message thật: hết hàng, giỏ rỗng, 429…)
      // với lỗi mạng/timeout (không có response). Trước đây chỉ console.log →
      // user bấm Place Order thất bại mà không thấy gì.
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response
        ? err.response.data?.message ??
          `Checkout failed (HTTP ${err.response.status}). Please try again.`
        : "Network error — please check your connection. If the problem persists, contact us to confirm whether your order went through before re-ordering.";
      toast.error(message, { autoClose: 5000 });
      console.error("Checkout error response", error);
    },
  });
};
