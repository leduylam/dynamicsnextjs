import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import {
  unwrap,
  buildCategoryTree,
  type FlatCategory,
} from "@framework/utils/adapt";

// Header menu cần cây phân cấp: lấy include_all (kèm node cha) rồi dựng tree.
// `leaf`-only (mặc định) sẽ thiếu node cha nên không build được cây.
export const getCategory = async () => {
  const response = await http.get(API_ENDPOINTS.CATEGORIES_SERVER, {
    params: { include_all: true },
  });
  return {
    categories: buildCategoryTree(unwrap<FlatCategory[]>(response.data)),
  };
};
// export const useCategoriesQueryOnServer = () => {
//     return useQuery<any>({
//         queryKey: [API_ENDPOINTS.CATEGORIES_SERVER],
//         queryFn: fetchCategory
//     });
// };
