import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { ProductGrid } from "@components/product/product-grid";
import { ShopFilters } from "@components/shop/filters";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { QueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { fetchProducts } from "@framework/product/get-all-products";
import Breadcrumb from "@components/common/breadcrumb";
import StickyBox from "react-sticky-box";

export default function Category({ slug }: { slug: string }) {
  return (
    <div className="border-t-2 border-borderBottom">
      <Container>
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <div className={`flex pt-8 pb-16 lg:pb-20`}>
          <div className="flex-shrink-0 ltr:pr-24 rtl:pl-24 hidden lg:block w-96">
            <StickyBox offsetTop={50} offsetBottom={20}>
              <ShopFilters slug={slug} />
            </StickyBox>
          </div>
          <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
            <ProductGrid className="3xl:grid-cols-6" slug={slug} />
          </div>
        </div>
      </Container>
    </div>
  );
}

Category.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const slug = params?.slug;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.PRODUCTS, { slug, limit: 10, locale }],
    queryFn: fetchProducts,
  });
  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      slug,
    },
  };
};
