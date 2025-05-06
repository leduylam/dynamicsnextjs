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
import { useRouter } from "next/router";
import { fetchProducts } from "@framework/product/get-all-products";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useEffect, useState } from "react";
import { Product } from "@framework/types";

interface ShopProps {
  initialProducts: Product[];
  initialPage: number;
  hasNextPage: boolean;
  params: { [key: string]: string };
  error: any;
}

export default function Shop({
  initialProducts,
  initialPage,
  hasNextPage: initialHasNextPage,
  params,
  error: initialError,
}: ShopProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [, setError] = useState(initialError);
  const [preloadProducts, setPreloadProducts] = useState<Product[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    setProducts([]);
    setPage(1);
    setHasNextPage(false);
    setIsLoading(true);
    setPreloadProducts([]);
    window.scrollTo(0, 0);
  }, [router.asPath]);

  useEffect(() => {
    if (!hasMounted || !isLoading) return;
    let isMounted = true;
    const fetchInitialProducts = async () => {
      try {
        const result = await fetchProducts({
          queryKey: ["/products", { ...params, limit: 4 }],
          pageParam: 1,
        });
        if (isMounted) {
          setProducts(result?.data ?? []);
          setHasNextPage(result?.paginatorInfo?.hasNextPage ?? false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setIsLoading(false);
      }
    };
    fetchInitialProducts();
    return () => {
      isMounted = false;
    };
  }, [isLoading, params, hasMounted]);

  const preloadNextPage = async () => {
    if (!hasNextPage || isPreloading || preloadProducts.length > 0) return;
    try {
      setLoadingMore(true);
      setIsPreloading(true);
      const result = await fetchProducts({
        queryKey: ["/products", { ...params, limit: 4 }],
        pageParam: page + 1,
      });
      const preProducts = result?.data ?? [];
      const paginatorInfo = result?.paginatorInfo ?? {};
      setPreloadProducts(preProducts);
      setHasNextPage(paginatorInfo.hasNextPage || false);
    } catch (err) {
      console.error("Preload error:", err);
      setError(err);
    } finally {
      setIsPreloading(false);
      setLoadingMore(false);
    }
  };

  const fetchNextPage = () => {
    if (preloadProducts.length === 0) return;
    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const uniquePreload = preloadProducts.filter((p) => !existingIds.has(p.id));
      return [...prev, ...uniquePreload];
    });
    setPreloadProducts([]);
    setPage((prev) => prev + 1);
  };

  if (!hasMounted) return null;
  return (
    <Container>
      <div className={`flex pt-8 pb-16 lg:pb-20`}>
        <div className="flex-shrink-0 ltr:pr-24 rtl:pl-24 hidden lg:block w-96">
          <StickyBox offsetTop={50} offsetBottom={20}>
            <div className="pb-7">
              <BreadcrumbItems separator="/">
                <ActiveLink href={"/"} activeClassName="font-semibold text-heading">Home</ActiveLink>
                <ActiveLink href={ROUTES.SEARCH} activeClassName="font-semibold text-heading" className="capitalize">Search</ActiveLink>
              </BreadcrumbItems>
            </div>
            <ShopFilters />
          </StickyBox>
        </div>
        <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
          <SearchTopBar />
          <ProductGrid
            data={products}
            page={page}
            setPage={setPage}
            setProducts={setProducts}
            preloadProducts={preloadProducts}
            setPreloadProducts={setPreloadProducts}
            preloadNextPage={preloadNextPage}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            loadingMore={loadingMore}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Container>
  );
}

Shop.Layout = Layout;

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  try {
    const params: { [key: string]: string } = {};
    Object.keys(query).forEach((key) => {
      params[key] = Array.isArray(query[key]) ? query[key][0] : (query[key] || "");
    });
    const page1Result = await fetchProducts({
      queryKey: [API_ENDPOINTS.PRODUCTS, { ...params, limit: 4 }],
      pageParam: 1,
    });

    const products = page1Result?.data ?? [];
    const paginatorInfo = page1Result?.paginatorInfo ?? {};
    return {
      props: {
        initialProducts: products,
        initialPage: 1,
        hasNextPage: paginatorInfo.hasNextPage || false,
        params,
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      },
    };
  } catch (error) {
    return {
      props: {
        initialProducts: [],
        initialPage: 1,
        hasNextPage: false,
        params: {},
        error: {
          message: (error as Error)?.message || "Unknown error",
        },
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      },
    };
  }
};
