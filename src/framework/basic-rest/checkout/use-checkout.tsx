import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export interface CheckoutInputType {
  address_id?: number | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  save: boolean;
  note: string;
  orderItem: []
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
    onError: (data) => {
      console.log(data, "Checkout error response");
    },
  });
};
