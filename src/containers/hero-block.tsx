import BannerCard from '@components/common/banner-card';
import Carousel from '@components/ui/carousel/carousel';
import { useWindowSize } from '@utils/use-window-size';
import { SwiperSlide } from 'swiper/react';
import { useSsrCompatible } from '@utils/use-ssr-compatible';
import { useBannersQuery } from '@framework/banner/get-banner';
import { useEffect, useState } from 'react';
interface BannerProps {
  id: number | string,
  title: string,
  slug: string,
  image: any
}
interface Props {
  hideProductDescription?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  demoVariant?: 'ancient';
  disableBorderRadius?: boolean;
  className?: string;
}
const breakpoints = {
  '1500': {
    slidesPerView: 2,
  },
  '0': {
    slidesPerView: 1,
  },
};

const HeroBlock: React.FC = ({ demoVariant }: Props) => {
  const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });
  const { data, isLoading } = useBannersQuery({
    limit: 10,
    demoVariant,
  })
  const [banners, setBanners] = useState<BannerProps[]>([])
  useEffect(() => {
    if (!isLoading) {
      if (data && data?.item) {
        const dataItem = JSON.parse(data?.item)
        const updateBanner = dataItem.map((banner: any) => {
          const images = JSON.parse(banner.album).map((img: any) => `${process.env.NEXT_PUBLIC_SITE_URL}/${img}`)
          return {
            id: banner.id,
            title: banner.title,
            slug: banner.url,
            image: {
              mobile: {
                url: images.toString(),
                width: 480,
                height: 275,
              },
              desktop: {
                url: images.toString(),
                width: 1800,
                height: 800,
              },
            },
          }
        })
        setBanners(updateBanner)
      }
    }
  }, [data, isLoading])
  return (
    <div className="heroBannerOne relative max-w-[1920px] mb-5 md:mb-12 lg:mb-14 2xl:mb-16 mx-auto overflow-hidden px-4 md:px-8 2xl:px-0">
      <Carousel
        loop={true}
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
              href={`search?brand=${banner.slug}`}
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroBlock;
