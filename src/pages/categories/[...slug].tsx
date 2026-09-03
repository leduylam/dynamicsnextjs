import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { ProductGrid } from "@components/product/product-grid";
import { ShopFilters } from "@components/shop/filters";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { fetchProducts } from "@framework/product/get-all-products";
import { fetchCategoryBySlug } from "@framework/category/get-category";
import Breadcrumb from "@components/common/breadcrumb";
import StickyBox from "react-sticky-box";

export default function Category({
  slug,
  categoryName,
}: {
  slug: string;
  categoryName?: string;
}) {
  return (
    <div className="border-t-2 border-borderBottom">
      <Container>
        <div className="pt-8">
          <Breadcrumb currentCategoryName={categoryName} />
        </div>
        <div className={`flex pt-8 pb-16 lg:pb-20`}>
          <div className="flex-shrink-0 ltr:pr-24 rtl:pl-24 hidden lg:block w-96">
            <StickyBox offsetTop={50} offsetBottom={20}>
              <ShopFilters slug={slug} />
            </StickyBox>
          </div>
          <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
            <ProductGrid className="3xl:grid-cols-6" queryOptions={{ slug }} />
          </div>
        </div>
      </Container>
    </div>
  );
}

Category.Layout = Layout;

export const getServerSideProps: GetServerSideProps<{
  slug: string;
  categoryName?: string;
// `req` cố ý KHÔNG nhận nữa: SSR không còn đọc gì từ request của khách. Thêm
// lại nó là bước đầu của việc lén đưa danh tính vào HTML render sẵn.
}> = async ({ locale, params }) => {
  const slugParam = params?.slug;

  const normalizedSlug = Array.isArray(slugParam)
    ? slugParam.join("/")
    : typeof slugParam === "string"
      ? slugParam
      : "";

  const slugValue = Array.isArray(slugParam)
    ? slugParam[0]
    : typeof slugParam === "string"
      ? slugParam
      : "";

  // Fallback tên suy từ chuỗi slug — chỉ dùng khi không lấy được category thật.
  const slugDerivedName =
    typeof slugParam === "string"
      ? slugParam.split("/").pop()?.replace(/-/g, " ")
      : Array.isArray(slugParam) && slugParam.length > 0
        ? slugParam[slugParam.length - 1]?.replace(/-/g, " ")
        : undefined;

  // SSR chạy KHÔNG danh tính, có chủ đích — xem ghi chú dài ở
  // `pages/products/[slug].tsx`. Tóm tắt: giá chỉ dành cho người đã đăng nhập
  // nên nó KHÔNG được nằm trong HTML render sẵn; prefetch dưới đây là bản khách
  // vãng lai (`retail_price: null`), giá do client fetch sau khi có phiên.
  // `useProductsQuery` cũng mang mảnh khoá `authed` — `staleTime: 0` +
  // `refetchOnMount` KHÔNG đủ, vì chúng chỉ bắn lúc mount khi phiên thường chưa
  // khôi phục xong; xem ghi chú trong `get-all-products.tsx`.

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  });

  const [translations, category] = await Promise.all([
    serverSideTranslations(locale!, ["common", "forms", "footer"]),
    // Lấy tên category thật từ backend (mirror client-vgd) thay vì suy từ slug.
    fetchCategoryBySlug(normalizedSlug, locale ?? undefined),
    queryClient.prefetchInfiniteQuery({
      // `null` ở cuối = "bản của khách vãng lai" (`usePriceAudienceKey` trả
      // `null` khi chưa có phiên), phải khớp đúng khoá `useProductsQuery` dùng
      // — sai một mảnh là client không dùng được prefetch, hydrate ra skeleton.
      queryKey: [
        API_ENDPOINTS.PRODUCTS,
        { slug: normalizedSlug, limit: 8, locale },
        null,
      ],
      queryFn: ({ pageParam = 1, queryKey }) =>
        fetchProducts({
          pageParam,
          queryKey,
          token: null,
        }),
      initialPageParam: 1,
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  const categoryName = category?.name || slugDerivedName;

  return {
    props: {
      ...translations,
      dehydratedState: dehydrate(queryClient),
      slug: slugValue,
      categoryName: categoryName || undefined,
    },
  };
};
