import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { ShopFilters } from "@components/shop/filters";
import StickyBox from "react-sticky-box";
import { ProductGrid } from "@components/product/product-grid";
import SearchTopBar from "@components/shop/top-bar";
import ActiveLink from "@components/ui/active-link";
import { BreadcrumbItems } from "@components/common/breadcrumb";
import { ROUTES } from "@utils/routes";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { fetchProducts } from "@framework/product/get-all-products";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { QueryClient } from "@tanstack/react-query";

export default function Shop() {
  return (
    <Container>
      <div className={`flex pt-8 pb-16 lg:pb-20`}>
        <div className="flex-shrink-0 ltr:pr-24 rtl:pl-24 hidden lg:block w-96">
          <StickyBox offsetTop={50} offsetBottom={20}>
            <div className="pb-7">
              <BreadcrumbItems separator="/">
                <ActiveLink
                  href={"/"}
                  activeClassName="font-semibold text-heading"
                >
                  Home
                </ActiveLink>
                <ActiveLink
                  href={ROUTES.SEARCH}
                  activeClassName="font-semibold text-heading"
                  className="capitalize"
                >
                  Search
                </ActiveLink>
              </BreadcrumbItems>
            </div>
            <ShopFilters />
          </StickyBox>
        </div>
        <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
          <SearchTopBar />
          <ProductGrid className="3xl:grid-cols-6" />
        </div>
      </div>
    </Container>
  );
}

Shop.Layout = Layout;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const query = params?.query || {};
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.PRODUCTS, { ...query, limit: 12 }],
    queryFn: () => fetchProducts({} as any),
  });
  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
    },
  };
};
// try {
//   const params: { [key: string]: string } = {};
//   Object.keys(query).forEach((key) => {
//     params[key] = Array.isArray(query[key])
//       ? query[key][0]
//       : query[key] || "";
//   });
//   // const page1Result = await fetchProducts({
//   //   queryKey: ['search', { ...params, limit: 12 }],
//   //   pageParam: 1,
//   // });
//   const products = page1Result?.data ?? [];
//   const paginatorInfo = page1Result?.paginatorInfo ?? {};
//   return {
//     props: {
//       initialProducts: products,
//       initialPage: 1,
//       hasNextPage: paginatorInfo.hasNextPage || false,
//       params,
//       ...(await serverSideTranslations(locale!, [
//         "common",
//         "forms",
//         "footer",
//       ])),
//     },
//   };
// } catch (error) {
//   return {
//     props: {
//       initialProducts: [],
//       initialPage: 1,
//       hasNextPage: false,
//       params: {},
//       error: {
//         message: (error as Error)?.message || "Unknown error",
//       },
//       ...(await serverSideTranslations(locale!, [
//         "common",
//         "forms",
//         "footer",
//       ])),
//     },
//   };
// }
// };
