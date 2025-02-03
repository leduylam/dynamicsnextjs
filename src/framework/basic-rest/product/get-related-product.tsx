import { QueryOptionsType, Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchRelatedProducts = async (_slug: string) => {
	const { data } = await http.get(`${API_ENDPOINTS.RELATED_PRODUCTS}/${_slug}`);
	return data;
};
export const useRelatedProductsQuery = (slug: string, options: QueryOptionsType) => {
	return useQuery<Product[], Error>({
		queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, slug, options],
		queryFn: () => fetchRelatedProducts(slug)
	});
};
