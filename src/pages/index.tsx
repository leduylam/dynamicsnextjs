import BannerCard from "@components/common/banner-card";
import Container from "@components/ui/container";
import Divider from "@components/ui/divider";
import HeroBlock from "@containers/hero-block";
import BrandBlock from "@containers/brand-block";
import Layout from "@components/layout/layout";
import BestSellerProductFeed from "@components/product/feeds/best-seller-product-feed";
import NewArrivalsProductFeed from "@components/product/feeds/new-arrivals-product-feed";
import { useEffect, useState } from "react";
import { fetchBanners, getSecondBanner } from "@framework/banner/get-banner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { fetchCollection } from "@framework/collecttion/get-all-collection";
import { fetchBrands } from "@framework/brand/get-all-brands";
import { fetchNewArrivalAncientProducts } from "@framework/product/get-all-new-arrival-products";
import { fetchBestSellerProducts } from "@framework/product/get-all-best-seller-products";
import BannerCarouselBlock from "@containers/banner-carousel-block";
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
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    // Gọi API lấy danh sách collections
    const [collections, brands, banners, oneBanner, newArrivalsProduct, bestsellerProducts] = await Promise.all([
      fetchCollection().catch(() => []),
      fetchBrands().catch(() => []),
      fetchBanners().catch(() => []),
      getSecondBanner().catch(() => { }),
      fetchNewArrivalAncientProducts().catch(() => []),
      fetchBestSellerProducts().catch(() => []),
    ]);
    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        collections: collections ?? [], // Thay undefined bằng null nếu cần
        brands: brands ?? [],
        banners: banners ?? [],
        oneBanner: oneBanner ?? null, // Đảm bảo oneBanner không bao giờ là undefined
        newArrivalsProduct: newArrivalsProduct ?? [],
        bestsellerProducts: bestsellerProducts ?? [],
      },
    };
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        collections: [],
        brands: [],
        banners: [],
        oneBanner: {},
        newArrivalsProduct: [],
        bestsellerProducts: [],
        error: "Không thể tải dữ liệu từ API",
      },
    };
  }
};

export default function Home({
  collections,
  brands,
  banners,
  oneBanner,
  newArrivalsProduct,
  bestsellerProducts,
  error }: any) {

  // const { openModal, setModalView } = useUI();
  const [isLoading, setIsLoading] = useState(!oneBanner)
  const [mainBanner, setMainBanner] = useState<Banner | null>(null)
  const [collectionBanners, setCollectionBanners] = useState<Banner[]>([]);
  useEffect(() => {
    setIsLoading(false)
  }, [])
  useEffect(() => {
    if (collections.length > 0) {
      const formattedCollections = collections.map((collection: any) => {
        const images = `${process.env.NEXT_PUBLIC_SITE_URL}/${collection.representative_image_url}`
        return {
          id: collection.id,
          title: collection.title || "No title",
          slug: `${collection.slug}` || "#",
          image: {
            mobile: {
              url: images || "", width: 450,
              height: 150,
            },
            desktop: {
              url: images || "", width: 580,
              height: 360,
            },
          },
        };
      });
      setCollectionBanners(formattedCollections);
    }
  }, [collections]);
  useEffect(() => {
    if (!isLoading) {
      if (oneBanner && oneBanner.item) {
        const dataItem = JSON.parse(oneBanner?.item)
        if (dataItem.length > 0) {
          const firstBanner = dataItem[0]
          const images = JSON.parse(firstBanner.album).map(
            (img: any) => `${process.env.NEXT_PUBLIC_SITE_URL}/${img}`
          );
          setMainBanner({
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
                height: 360,
              },
            },
          });
        }
      }
    }
  }, [oneBanner, isLoading])
  return (
    <>
      <HeroBlock data={banners as any} />
      <Container>
        <BannerCarouselBlock data={collectionBanners} />
        <BrandBlock sectionHeading="text-brands" data={brands} error={error} />
        <Divider />
        <NewArrivalsProductFeed data={newArrivalsProduct} error={error} />
        {mainBanner && (
          <BannerCard
            key={`banner--key${mainBanner.id}`}
            banner={mainBanner}
            href=''
            className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
            classNameInner="h-28 sm:h-auto"
          />
        )}
        <BestSellerProductFeed data={bestsellerProducts} error={error} />
        <Divider />
      </Container>
    </>
  );
}

Home.Layout = Layout;
