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
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useMemo } from "react";
import type { ParsedUrlQuery } from "querystring";
import type { QueryOptionsType } from "@framework/types";

const DEFAULT_LIMIT = 8;

const buildSearchQueryOptions = (
  query: ParsedUrlQuery,
  locale?: string | string[]
) : (QueryOptionsType & { locale?: string }) => {
  const normalizedEntries = Object.entries(query ?? {}).reduce<
    Record<string, string | string[] | number>
  >((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    if (Array.isArray(value)) {
      const filtered = value.filter((item) => !!item);
      if (!filtered.length) {
        return acc;
      }
      acc[key] = filtered.length === 1 ? filtered[0] : filtered;
      return acc;
    }

    if (value === "") {
      return acc;
    }

    if (key === "page" || key === "limit") {
      const parsedNumber = Number(value);
      if (!Number.isNaN(parsedNumber)) {
        acc[key] = parsedNumber;
      }
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});

  if (locale && typeof locale === "string") {
    normalizedEntries.locale = locale;
  }

  if (!normalizedEntries.limit) {
    normalizedEntries.limit = DEFAULT_LIMIT;
  }

  return normalizedEntries as QueryOptionsType & { locale?: string };
};
export default function Shop() {
  const { query, locale } = useRouter();
  const searchQueryOptions = useMemo(
    () => buildSearchQueryOptions(query, locale),
    [query, locale]
  );

  const slugParam = useMemo(() => {
    const slugValue = searchQueryOptions.slug as string | string[] | undefined;
    if (Array.isArray(slugValue)) {
      return slugValue[0] ?? "";
    }
    return slugValue ?? "";
  }, [searchQueryOptions.slug]);

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
            <ShopFilters
              slug={slugParam}
            />
          </StickyBox>
        </div>
        <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
          <SearchTopBar />
          <ProductGrid
            className="3xl:grid-cols-6"
            queryOptions={searchQueryOptions}
          />
        </div>
      </div>
    </Container>
  );
}

Shop.Layout = Layout;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
  res,
}) => {
  const queryClient = new QueryClient();
  const searchQuery = buildSearchQueryOptions(query, locale);

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: [API_ENDPOINTS.PRODUCTS, searchQuery],
      queryFn: fetchProducts,
      initialPageParam: 1,
    });
  } catch {
    // Prefetch failures fall back to client-side fetching.
  }

  if (res) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
  }

  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
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
