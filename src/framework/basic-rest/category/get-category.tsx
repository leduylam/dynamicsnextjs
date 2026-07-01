import { QueryOptionsType, Category } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { unwrap, adaptCategory } from "@framework/utils/adapt";
import { useQuery } from "@tanstack/react-query";

export const fetchCategory = async () => {
  const { data } = await http.get(API_ENDPOINTS.CATEGORIES, {
    params: { include_all: true },
  });
  return { category: { data: unwrap<any[]>(data).map(adaptCategory) } };
};

// Category theo slug — dùng lấy thông tin thật (name/parent…) cho page
// categories/[...slug], thay vì suy tên từ chuỗi slug. Mirror client-vgd
// (CATEGORY_BY_SLUG). Trả null khi không tìm thấy để caller fallback an toàn.
export const fetchCategoryBySlug = async (
  slug: string,
  locale?: string,
): Promise<Category | null> => {
  if (!slug) return null;
  try {
    const { data } = await http.get(API_ENDPOINTS.CATEGORY_BY_SLUG(slug), {
      params: locale ? { locale } : undefined,
    });
    const raw = unwrap<any>(data);
    return raw ? adaptCategory(raw) : null;
  } catch {
    return null;
  }
};
export const useCategoriesQuery = (options: QueryOptionsType) => {
  return useQuery<{ category: { data: Category[] } }, Error>({
    queryKey: [API_ENDPOINTS.CATEGORIES, options],
    queryFn: fetchCategory,
    staleTime: 1000 * 60 * 10,
  });
};
