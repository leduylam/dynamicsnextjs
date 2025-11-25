import BannerCard from "@components/common/banner-card";
import Carousel from "@components/ui/carousel/carousel";
import { SwiperSlide } from "swiper/react";
import { ROUTES } from "@utils/routes";
import { useCollectionQuery } from "@framework/collecttion/get-all-collection";
import { useEffect, useState } from "react";

const breakpoints = {
  "1025": {
    slidesPerView: 3,
    spaceBetween: 28,
  },
  "480": {
    slidesPerView: 2,
    spaceBetween: 20,
  },
  "0": {
    slidesPerView: 1,
    spaceBetween: 12,
  },
};

interface BannerProps {
  className?: string;
}

const BannerCarouselBlock: React.FC<BannerProps> = ({
  className = "mb-12 md:mb-12 lg:mb-14 pb-0.5 xl:pb-1.5",
}) => {
  const [collections, setCollections] = useState<any[]>([]);
  const { data } = useCollectionQuery({
    limit: 10,
  });
  useEffect(() => {
    if (data && data?.item) {
      const dataItem = data?.item;
      const updatedCollections = dataItem.map((collection: any) => ({
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
        image: {
          mobile: {
            url: `${
              process.env.NEXT_PUBLIC_SITE_URL ?? "https://api.dynamicsportsvn.com"
            }/${collection.album.mobile.toString()}`,
            width: 768,
            height: Math.round(768 * (800 / 1800)),
          },
          desktop: {
            url: `${
              process.env.NEXT_PUBLIC_SITE_URL ?? "https://api.dynamicsportsvn.com"
            }/${collection.album.desktop.toString()}`,
            width: 1800,
            height: 800,
          },
        },
      }));
      setCollections(updatedCollections);
    }
  }, [data]);
  return (
    <div className={className}>
      <Carousel breakpoints={breakpoints} autoplay={{ delay: 5000 }}>
        {collections?.map((collection: any) => (
          <SwiperSlide key={`promotion-banner-key-${collection?.id}`}>
            <BannerCard
              banner={collection}
              href={`${ROUTES.COLLECTIONS}/${collection.slug}`}
              effectActive={true}
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarouselBlock;
