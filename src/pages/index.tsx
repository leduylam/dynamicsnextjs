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
import { joinMedia } from "@framework/utils/adapt";
import { useMemo } from "react";
import dynamic from "next/dynamic";

const BrandBlock = dynamic(() => import("@containers/brand-block"), {
  ssr: true,
  loading: () => <div className="h-32 animate-pulse bg-gray-200 rounded" />,
});

const NewArrivalsProductFeed = dynamic(
  () => import("@components/product/feeds/new-arrivals-product-feed"),
  {
    ssr: true,
    loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
  },
);

const BANNER_RATIO = 800 / 1800;

function Home() {
  const { data } = useQuery({
    queryKey: [API_ENDPOINTS.SECOND_BANNER],
    queryFn: getSecondBanner,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const banner = useMemo(() => {
    if (!data?.item?.length) return [];

    return data.item.map((banner: any) => ({
      id: banner.id,
      title: banner.title,
      slug: banner.url,
      image: {
        mobile: {
          url: joinMedia(banner?.album?.mobile),
          width: 768,
          height: Math.round(768 * BANNER_RATIO),
        },
        desktop: {
          url: joinMedia(banner?.album?.desktop),
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
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  });

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

  return {
    props: {
      ...translations,
      dehydratedState: dehydrate(queryClient),
    },
  };
};
