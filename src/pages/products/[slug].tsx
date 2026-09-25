import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import ProductSingleDetails from "@components/product/product-single-details";
import RelatedProducts from "@containers/related-products";
import { fetchProduct } from "@framework/product/get-product";
import { fetchRelatedProducts } from "@framework/product/get-related-product";

const BrandBlock = dynamic(() => import("@containers/brand-block"), {
  ssr: true,
  loading: () => <div className="h-32 animate-pulse bg-gray-200 rounded" />,
});

export default function ProductPage({ slug }: { slug: string }) {
  return (
    <>
      <Divider className="mb-0" />
      <Container>
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <ProductSingleDetails slug={slug} />
        <div className="mt-20" />
        <RelatedProducts sectionHeading="Related Products" slug={slug} />
        <BrandBlock sectionHeading="text-brands" />
      </Container>
    </>
  );
}

ProductPage.Layout = Layout;

// `req` cố ý KHÔNG nhận nữa: SSR không còn đọc gì từ request của khách.
export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const { slug } = params as { slug: string };
  
  // SSR chạy KHÔNG danh tính, có chủ đích (2026-09-03). Access token nay nằm
  // trong bộ nhớ trình duyệt nên `req.cookies` không còn nó — và đó là kết cục
  // mong muốn, không phải mất mát: **giá chỉ dành cho người đã đăng nhập** (BE
  // `canViewAnyPrice`), nên nó không được có mặt trong HTML render sẵn, thứ đi
  // qua CDN/cache và không gắn với ai. Prefetch dưới đây vì vậy luôn là bản
  // KHÁCH VÃNG LAI: đủ nội dung cho SEO và lần paint đầu, `retail_price` là
  // `null`. Người đã đăng nhập nhận giá bằng lần fetch phía client sau khi
  // phiên khôi phục — khoá `authed` trong `useProductQuery` lo việc đó.
  // ⛔ Đừng "sửa" bằng cách đọc lại token từ cookie ở đây.

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  });

  const [translations] = await Promise.all([
    serverSideTranslations(locale!, ["common", "forms", "footer"]),
    // `null` ở cuối khoá = "bản của khách vãng lai" (`usePriceAudienceKey` trả
    // `null` khi chưa có phiên), phải khớp đúng khoá mà
    // `useProductQuery`/`useRelatedProductsQuery` dùng — sai một mảnh là client
    // không dùng được prefetch, hydrate ra spinner thay vì nội dung render sẵn.
    queryClient.prefetchQuery({
      queryKey: [API_ENDPOINTS.PRODUCT, { slug }, null],
      // Dùng context thật của react-query, chỉ ghi đè queryKey (fetchProduct đọc
      // `[endpoint, {slug}]`, không có mảnh audience) + token null (bản khách).
      queryFn: (context) =>
        fetchProduct({
          ...context,
          queryKey: [API_ENDPOINTS.PRODUCT, { slug }],
          token: null,
        }),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, { text: slug }, null],
      queryFn: ({ pageParam = 1 }) =>
        fetchRelatedProducts({
          pageParam,
          queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, { text: slug }],
          token: null,
        }),
      initialPageParam: 1,
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  // H29: slug không tồn tại phải là 404 THẬT (trước đây trả 200 + trang rỗng ⇒
  // soft-404, Google index rác). `prefetchQuery` nuốt lỗi nên đọc lại state của
  // đúng khoá vừa prefetch. CHỈ 404 từ BE mới thành notFound — 5xx/mạng giữ hành
  // vi cũ (render trang, client tự fetch lại) để BE chập chờn không biến cả
  // catalog thành 404 trong mắt crawler.
  const productError = queryClient.getQueryState([
    API_ENDPOINTS.PRODUCT,
    { slug },
    null,
  ])?.error;
  if (isAxiosError(productError) && productError.response?.status === 404) {
    return { notFound: true };
  }

  return {
    props: {
      ...translations,
      slug,
      dehydratedState: dehydrate(queryClient),
    },
  };
};
