import BannerCard from "@components/common/banner-card";
import Carousel from "@components/ui/carousel/carousel";
import { useWindowSize } from "@utils/use-window-size";
import { SwiperSlide } from "swiper/react";
import { useSsrCompatible } from "@utils/use-ssr-compatible";
import React, { useMemo } from "react";
import { ROUTES } from "@utils/routes";
import { useBannersQuery } from "@framework/banner/get-banner";

interface Props {
  hideProductDescription?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  demoVariant?: "ancient";
  disableBorderRadius?: boolean;
  className?: string;
}

const breakpoints = {
  "1500": {
    slidesPerView: 2,
  },
  "0": {
    slidesPerView: 1,
  },
};

const HeroBlock: React.FC<Props> = React.memo(() => {
  const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });
  const { data } = useBannersQuery({
    limit: 8,
  });
  
  const banners = useMemo(() => {
    if (!data?.item) return [];
    
    const ratio = 800 / 1800;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    return data.item.map((banner: any) => ({
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
    }));
  }, [data]);

  const minSlides = Math.max(
    ...Object.values(breakpoints).map((bp) => bp.slidesPerView),
    1
  );
  return (
    <div className="heroBannerOne relative max-w-[1920px] mb-5 md:mb-12 lg:mb-14 2xl:mb-16 mx-auto overflow-hidden px-4 md:px-8 2xl:px-0">
      <Carousel
        loop={banners.length > minSlides}
        breakpoints={breakpoints}
        centeredSlides={width < 1500 ? false : true}
        autoplay={{
          delay: 5000,
        }}
        className="mx-0"
        buttonGroupClassName="hidden"
        pagination={{
          clickable: true,
        }}
      >
        {banners?.map((banner: any) => (
          <SwiperSlide
            className="carouselItem px-0 2xl:px-3.5"
            key={`banner--key-${banner?.id}`}
          >
            <BannerCard
              banner={banner}
              href={{
                pathname: ROUTES.SEARCH,
                query: { brand: banner.slug },
              }}
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
});

HeroBlock.displayName = 'HeroBlock';

export default HeroBlock;
