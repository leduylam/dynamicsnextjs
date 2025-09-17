import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useQuery } from "@tanstack/react-query";

export const fetchCompanies = async () => {
  const { data } = await http.get(`${API_ENDPOINTS.COMPANIES}`);
  return data;
};
export const useCompanyQuery = () => {
  return useQuery<any, Error>({
    queryKey: [API_ENDPOINTS.COMPANIES],
    queryFn: () => fetchCompanies(),
  });
};
