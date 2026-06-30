import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@framework/utils/get-token";

export interface Address {
  id: number;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
  [key: string]: unknown;
}

interface AddressResponse {
  success: boolean;
  data?: Address | Address[] | null;
  message?: string;
}

export const fetchDeliveryAddress = async (): Promise<Address[]> => {
  const { data } = await http.get<AddressResponse>(API_ENDPOINTS.ADDRESSES);
  if (data?.success && data?.data) {
    return Array.isArray(data.data) ? data.data : [data.data];
  }
  return [];
};

export const useDeliveryAddressQuery = () => {
  return useQuery<Address[], Error>({
    queryKey: [API_ENDPOINTS.ADDRESSES],
    queryFn: () => fetchDeliveryAddress(),
    // Addresses auth-only (admin-vgd) — chỉ fetch khi đã đăng nhập.
    enabled: typeof window !== "undefined" && !!getToken(),
    retry: false,
  });
};

export const deleteAddress = async (id: number) => {
  return await http.delete(`${API_ENDPOINTS.ADDRESSES}/${id}`);
};
