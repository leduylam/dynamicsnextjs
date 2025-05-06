import { Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchProduct = async (_slug: string) => {
	const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}/${_slug}`);
	return data;
};
export const fetchAllProductSlugs = async () => {
	try {
		const res = await http.get(`${API_ENDPOINTS.PRODUCTS}/slugs`);
		if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch product slugs");
		const data = res.data;
		return data;
	} catch (error) {
		console.error("Error fetching product slugs:", error);
		return [];
	}
};
export const useProductQuery = (slug: string) => {
	return useQuery<Product, Error>({
		queryKey: [API_ENDPOINTS.PRODUCT, slug],
		queryFn: () => fetchProduct(slug)
	});
};

