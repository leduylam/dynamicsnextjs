import BannerCard from "@components/common/banner-card";
import Container from "@components/ui/container";
import Divider from "@components/ui/divider";
import HeroBlock from "@containers/hero-block";
import BrandBlock from "@containers/brand-block";
import Layout from "@components/layout/layout";
import BestSellerProductFeed from "@components/product/feeds/best-seller-product-feed";
import NewArrivalsProductFeed from "@components/product/feeds/new-arrivals-product-feed";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ROUTES } from "@utils/routes";
import { getSecondBanner } from "@framework/banner/get-banner";
interface Banner {
  id: string;
  title: string;
  slug: string;
  image: {
    mobile: {
      url: string;
      width: number;
      height: number;
    };
    desktop: {
      url: string;
      width: number;
      height: number;
    };
  };
}
export default function Home() {
  // const { openModal, setModalView } = useUI();
  const [banner, setBanner] = useState<Banner | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['banner'], queryFn: getSecondBanner })
  useEffect(() => {
    if (!isLoading) {
      if (data && data.item) {
        const dataItem = JSON.parse(data?.item)
        if (dataItem.length > 0) {
          const firstBanner = dataItem[0]
          const images = JSON.parse(firstBanner.album).map(
            (img: any) => `${process.env.NEXT_PUBLIC_SITE_URL}/${img}`
          );
          setBanner({
            id: firstBanner.id,
            title: firstBanner.title,
            slug: firstBanner.url,
            image: {
              mobile: {
                url: images[0], // URL hình ảnh đầu tiên
                width: 480,
                height: 275,
              },
              desktop: {
                url: images[0], // URL hình ảnh đầu tiên
                width: 1800,
                height: 800,
              },
            },
          });
        }
      }
    }
  }, [data, isLoading])
  // useEffect(() => {
  //   setModalView("NEWSLETTER_VIEW");
  //   setTimeout(() => {
  //     openModal();
  //   }, 2000);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  return (
    <>
      <HeroBlock />
      <Container>
        {/* <FlashSaleBlock /> */}
        {/* <BannerCarouselBlock bannerData={promotionBanners} /> */}
        <BrandBlock sectionHeading="Brands" />
        {/* <CategoryBlock sectionHeading="text-shop-by-category" /> */}
        <Divider />
        <BestSellerProductFeed />
        {banner && (
          <BannerCard
            key={`banner--key${banner.id}`}
            banner={banner}
            href={`${ROUTES.COLLECTIONS}/${banner.slug}`}
            className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
            classNameInner="h-28 sm:h-auto"
          />
        )}

        <NewArrivalsProductFeed />
        <Divider />

        {/* <CollectionBlock data={collection} /> */}
        {/* <FeatureBlock /> */}
        {/* <DownloadApps className="bg-linen" /> */}
        {/* <Support /> */}
        {/* <Subscription className="px-5 bg-linen sm:px-8 md:px-16 2xl:px-24" /> */}
      </Container>
    </>
  );
}

Home.Layout = Layout;

