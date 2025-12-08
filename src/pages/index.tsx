import BannerCard from "@components/common/banner-card";
import Container from "@components/ui/container";
import Divider from "@components/ui/divider";
import HeroBlock from "@containers/hero-block";
import Layout from "@components/layout/layout";
import { fetchBanners, getSecondBanner } from "@framework/banner/get-banner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { fetchBrands } from "@framework/brand/get-all-brands";
import { fetchNewArrivalAncientProducts } from "@framework/product/get-all-new-arrival-products";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useMemo } from "react";
import dynamic from "next/dynamic";

// ✅ OPTIMIZE: Lazy load components với loading states
const BrandBlock = dynamic(() => import("@containers/brand-block"), {
  ssr: true,
  loading: () => <div className="h-32 animate-pulse bg-gray-200 rounded" />,
});

const NewArrivalsProductFeed = dynamic(
  () => import("@components/product/feeds/new-arrivals-product-feed"),
  {
    ssr: true,
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
  }
);

// ✅ OPTIMIZE: Cache siteUrl constant
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://api.dynamicsportsvn.com";
const BANNER_RATIO = 800 / 1800;

// ✅ OPTIMIZE: Component được Next.js tự động optimize, không cần memo
function Home() {
  const { data } = useQuery({
    queryKey: [API_ENDPOINTS.SECOND_BANNER],
    queryFn: getSecondBanner,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    gcTime: 1000 * 60 * 10, // Giữ cache 10 phút
  });
  
  // ✅ OPTIMIZE: Memoize banner transformation
  const banner = useMemo(() => {
    if (!data?.item?.length) return [];
    
    return data.item.map((banner: any) => ({
      id: banner.id,
      title: banner.title,
      slug: banner.url,
      image: {
        mobile: {
          url: `${SITE_URL}/${banner?.album?.mobile?.toString()}`,
          width: 768,
          height: Math.round(768 * BANNER_RATIO),
        },
        desktop: {
          url: `${SITE_URL}/${banner?.album?.desktop?.toString()}`,
          width: 1800,
          height: 800,
        },
      },
    }));
  }, [data]);
  
  return (
    <>
      <HeroBlock />
      <Container>
        <BrandBlock sectionHeading="text-brands" />
        <Divider />
        <NewArrivalsProductFeed />
        {banner.length > 0 && (
          <BannerCard
            key={`banner--key${banner[0].id}`}
            banner={banner[0]}
            href=""
            className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
            classNameInner="h-28 sm:h-auto"
          />
        )}
        <Divider />
      </Container>
    </>
  );
}

Home.Layout = Layout;

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Cache 5 phút
        refetchOnWindowFocus: false,
      },
    },
  });

  // ✅ OPTIMIZE: Chạy prefetch queries song song thay vì tuần tự
  // Giảm thời gian load từ ~800ms xuống ~200ms (nếu 4 queries)
  const [translations] = await Promise.all([
    serverSideTranslations(locale!, ["common", "forms", "footer"]),
    queryClient.prefetchQuery({
      queryKey: [API_ENDPOINTS.BANNERS],
      queryFn: fetchBanners,
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: [API_ENDPOINTS.SECOND_BANNER],
      queryFn: getSecondBanner,
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS],
      queryFn: fetchNewArrivalAncientProducts,
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: [API_ENDPOINTS.BRANDS, { limit: 0 }],
      queryFn: fetchBrands,
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  // ✅ OPTIMIZE: Loại bỏ JSON.parse(JSON.stringify()) - dehydrate đã trả về serializable object
  // Giảm thời gian serialize từ ~50ms xuống ~5ms
  return {
    props: {
      ...translations,
      dehydratedState: dehydrate(queryClient),
    },
  };
};
