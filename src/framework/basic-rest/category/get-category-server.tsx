
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export const getCategory = async () => {
    const response = await http.get(API_ENDPOINTS.CATEGORIES_SERVER);
    return response.data;
};
// export const useCategoriesQueryOnServer = () => {
//     return useQuery<any>({
//         queryKey: [API_ENDPOINTS.CATEGORIES_SERVER],
//         queryFn: fetchCategory
//     });
// };

