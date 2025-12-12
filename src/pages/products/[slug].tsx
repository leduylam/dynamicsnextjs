import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { dehydrate, QueryClient } from "@tanstack/react-query";
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

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
  req,
}) => {
  const { slug } = params as { slug: string };
  
  const accessToken = req.cookies['client_access_token'] || null;
  
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
    queryClient.prefetchQuery({
      queryKey: [API_ENDPOINTS.PRODUCT, { slug }],
      queryFn: () => fetchProduct({
        queryKey: [API_ENDPOINTS.PRODUCT, { slug }],
        token: accessToken,
      } as any),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, { text: slug }],
      queryFn: ({ pageParam = 1 }) =>
        fetchRelatedProducts({
          pageParam,
          queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, { text: slug }],
          token: accessToken,
        }),
      initialPageParam: 1,
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  return {
    props: {
      ...translations,
      slug,
      dehydratedState: dehydrate(queryClient),
    },
  };
};
