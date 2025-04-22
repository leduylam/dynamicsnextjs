import { QueryOptionsType, Product } from "@framework/types";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useInfiniteQuery } from "@tanstack/react-query";
type PaginatedProduct = {
	data: Product[];
	paginatorInfo: any;
};
const fetchProducts = async ({ queryKey, pageParam = 0 }: any) => {
	const [_key, options] = queryKey;
	const { data } = await http.get(API_ENDPOINTS.PRODUCTS, {
		params: {
			...options, // Gửi options làm params
			page: pageParam, // Gửi thông tin trang hiện tại
		},
	});
	const nextPageLink = data.links.find((link: any) => link.label === "Next &raquo;");
	const nextPage = nextPageLink && nextPageLink.url ?
		new URL(nextPageLink.url).searchParams.get('page') : null;
	const hasNextPage = Boolean(nextPage);
	return {
		data: data.products,
		paginatorInfo: {
			nextPageUrl: nextPage,
			hasNextPage,
		},
	};
};

const useProductsQuery = (options: QueryOptionsType) => {
	return useInfiniteQuery<PaginatedProduct, Error>({
		queryKey: [API_ENDPOINTS.PRODUCTS, options],
		queryFn: fetchProducts,
		initialPageParam: 0,
		getNextPageParam: ({ paginatorInfo }) => {
			return paginatorInfo.nextPageUrl ? Number(paginatorInfo.nextPageUrl) : undefined;
		},
		staleTime: 1000 * 60 * 10,
	});
};

export { useProductsQuery, fetchProducts };