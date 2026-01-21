import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { ProductGrid } from "@components/product/product-grid";
import { ShopFilters } from "@components/shop/filters";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { fetchProducts } from "@framework/product/get-all-products";
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
            <ProductGrid
              className="3xl:grid-cols-6"
              queryOptions={{ slug }}
            />
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
}> = async ({
  locale,
  params,
  req,
}) => {
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

    const categoryName =
      typeof slugParam === "string"
        ? slugParam.split("/").pop()?.replace(/-/g, " ")
        : Array.isArray(slugParam) && slugParam.length > 0
          ? slugParam[slugParam.length - 1]?.replace(/-/g, " ")
          : undefined;

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
      queryClient.prefetchInfiniteQuery({
        queryKey: [API_ENDPOINTS.PRODUCTS, { slug: normalizedSlug, limit: 8, locale }],
        queryFn: ({ pageParam = 1, queryKey }) => fetchProducts({
          pageParam,
          queryKey,
          token: accessToken,
        }),
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
      }),
    ]);

    return {
      props: {
        ...translations,
        dehydratedState: dehydrate(queryClient),
        slug: slugValue,
        categoryName: categoryName || undefined,
      },
    };
  };
