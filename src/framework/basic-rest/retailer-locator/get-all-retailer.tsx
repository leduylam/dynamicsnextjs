import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useInfiniteQuery } from "@tanstack/react-query";

// Shape admin-vgd (RetailerLocatorController): { data: Store[], current_page, last_page, total }.
export interface RetailerStore {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  type: string | null;
  lat: number | null;
  lng: number | null;
}

interface RetailerPage {
  data: RetailerStore[];
  current_page: number;
  last_page: number;
  total: number;
}

interface RetailerQueryResult {
  data: RetailerStore[];
  paginatorInfo: { nextPageUrl: number | null; hasNextPage: boolean };
}

export const fetchRetailer = async ({
  queryKey,
  pageParam = 1,
}: {
  queryKey: readonly [string, Record<string, unknown>];
  pageParam?: number;
}): Promise<RetailerQueryResult> => {
  const [, options] = queryKey;
  const { data } = await http.get<RetailerPage>(
    API_ENDPOINTS.RETAILER_LOCATOR,
    {
      params: { ...options, page: pageParam || 1 },
    },
  );
  const hasNextPage = data.current_page < data.last_page;
  return {
    data: data.data,
    paginatorInfo: {
      nextPageUrl: hasNextPage ? data.current_page + 1 : null,
      hasNextPage,
    },
  };
};

export const useRetailerQuery = (options: Record<string, unknown>) => {
  return useInfiniteQuery<RetailerQueryResult, Error>({
    queryKey: [API_ENDPOINTS.RETAILER_LOCATOR, options],
    queryFn: fetchRetailer as never,
    initialPageParam: 1,
    getNextPageParam: ({ paginatorInfo }) =>
      paginatorInfo.nextPageUrl ?? undefined,
  });
};

// { data: [{ name, value }] } — tỉnh/thành có store cho site hiện tại.
export interface ProvinceOption {
  name: string;
  value: string;
}

export const getProvinces = async (): Promise<{ data: ProvinceOption[] }> => {
  // http.get<T> trả AxiosResponse<T> → `data` = body { data: ProvinceOption[] }.
  const { data } = await http.get<{ data: ProvinceOption[] }>(
    API_ENDPOINTS.PROVINCES,
  );
  return data;
};
