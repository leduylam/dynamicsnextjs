import { QueryOptionsType } from "@framework/types";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useQuery } from "@tanstack/react-query";

export const fetchCollection = async () => {
  const { data } = await http.get(API_ENDPOINTS.COLLECTION);
  return data;
};
export const findCollecitonBySlug = async ({ slug }: { slug: string }) => {
  const { data } = await http.get(`${API_ENDPOINTS.COLLECTION}/${slug}`);
  return data;
};

export const useCollectionQuery = (option: QueryOptionsType) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.COLLECTION, option],
    queryFn: () => fetchCollection(),
  });
};
