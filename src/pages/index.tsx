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
import BrandBlock from "@containers/brand-block";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { Banner } from "@framework/types";
import { useEffect, useState } from "react";
import NewArrivalsProductFeed from "@components/product/feeds/new-arrivals-product-feed";

export default function Home() {
  const [banner, setBanner] = useState<Banner[]>([]);
  const { data } = useQuery({
    queryKey: [API_ENDPOINTS.SECOND_BANNER],
    queryFn: getSecondBanner,
  });
  useEffect(() => {
    if (data && data?.item) {
      const dataItem = data?.item;
      const updateBanner = dataItem.map((banner: any) => {
        const ratio = 800 / 1800;
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? "https://api.dynamicsportsvn.com";
        return {
          id: banner.id,
          title: banner.title,
          slug: banner.url,
          image: {
            mobile: {
              url: `${siteUrl}/${banner?.album?.mobile?.toString()}`,
              width: 768,
              height: Math.round(768 * ratio),
            },
            desktop: {
              url: `${siteUrl}/${banner?.album?.desktop?.toString()}`,
              width: 1800,
              height: 800,
            },
          },
        };
      });
      setBanner(updateBanner);
    }
  }, [data]);
  return (
    <>
      <HeroBlock />
      <Container>
        {/* <BannerCarouselBlock /> */}
        <BrandBlock sectionHeading="text-brands" />
        <Divider />
        <NewArrivalsProductFeed />
        {banner && banner.length > 0 && (
          <BannerCard
            key={`banner--key${banner[0].id}`}
            banner={banner[0]}
            href=""
            className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
            classNameInner="h-28 sm:h-auto"
          />
        )}
        {/* <BestSellerProductFeed data={bestsellerProducts} error={error} /> */}
        <Divider />
      </Container>
    </>
  );
}

Home.Layout = Layout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.BANNERS],
    queryFn: fetchBanners,
  });
  await queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.SECOND_BANNER],
    queryFn: getSecondBanner,
  });
  await queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.NEW_ARRIVAL_PRODUCTS],
    queryFn: fetchNewArrivalAncientProducts,
  });
  await queryClient.prefetchQuery({
    queryKey: [API_ENDPOINTS.BRANDS, { limit: 0 }],
    queryFn: fetchBrands,
  });
  // await queryClient.prefetchQuery({
  //   queryKey: [API_ENDPOINTS.COLLECTION],
  //   queryFn: fetchCollection,
  // });
  return {
    props: {
      ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
