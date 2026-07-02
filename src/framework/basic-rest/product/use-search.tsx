import { QueryOptionsType } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptProductList } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchSearchedProducts = async (options: QueryOptionsType) => {
  if (options.text === "") {
    return null;
  }
  // BE (ProductController@list) đọc param `search`, KHÔNG đọc `text`.
  // Map `text` → `search` nếu không BE bỏ qua → trả TẤT CẢ product.
  const { text, ...rest } = options as Record<string, string>;
  const queryParams = new URLSearchParams({
    ...rest,
    card: "1", // grid card mode (bỏ variant nặng)
    in_stock_only: "1", // chỉ gợi ý sản phẩm còn hàng
    limit: "6", // dropdown chỉ cần vài gợi ý
    ...(text ? { search: text } : {}),
  }).toString();
  const { data } = await http.get(`${API_ENDPOINTS.SEARCH}?${queryParams}`);
  // BE trả { success, data: { data, paginatorInfo } }; component đọc
  // `data.products` → adapt để có mảng `products` đã chuẩn hoá.
  return adaptProductList(data);
};
export const useSearchQuery = (options: QueryOptionsType) => {
  const text = options.text || "";
  return useQuery({
    queryKey: [API_ENDPOINTS.SEARCH, options],
    queryFn: () => fetchSearchedProducts(options),
    enabled: text.length > 0,
    staleTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
  });
};
