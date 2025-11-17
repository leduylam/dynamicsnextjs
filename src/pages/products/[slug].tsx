import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { fetchProduct } from "@framework/product/get-product";
import { fetchRelatedProducts } from "@framework/product/get-related-product";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import ProductSingleDetails from "@components/product/product-single-details";
import RelatedProducts from "@containers/related-products";
const BrandBlock = dynamic(() => import("@containers/brand-block"), {
  ssr: false,
});
export default function ProductPage({ slug }: any) {
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
        {/* <Subscription /> */}
        <BrandBlock sectionHeading="text-brands" />
      </Container>
    </>
  );
}

ProductPage.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const { slug } = params as { slug: string };
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.PRODUCT, { slug }],
    queryFn: fetchProduct,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, { text: slug }],
      queryFn: ({ pageParam = 1 }) =>
        fetchRelatedProducts({
          pageParam,
          queryKey: [API_ENDPOINTS.RELATED_PRODUCTS, { text: slug }],
        }),
      initialPageParam: 1,
    }),
  ]);

  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      slug,
      dehydratedState: dehydrate(queryClient),
    },
  };
};
