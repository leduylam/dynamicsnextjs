import BannerCard from "@components/common/banner-card";
import Container from "@components/ui/container";
import Divider from "@components/ui/divider";
import HeroBlock from "@containers/hero-block";
import Layout from "@components/layout/layout";
import { useEffect, useState } from "react";
import { fetchBanners, getSecondBanner, useBannersQuery } from "@framework/banner/get-banner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { fetchCollection } from "@framework/collecttion/get-all-collection";
import { fetchBrands } from "@framework/brand/get-all-brands";
import { fetchNewArrivalAncientProducts, useNewArrivalProductsQuery } from "@framework/product/get-all-new-arrival-products";
const BannerCarouselBlock = dynamic(() => import("@containers/banner-carousel-block"), {
  ssr: false,
});
const BrandBlock = dynamic(() => import("@containers/brand-block"), {
  ssr: false,
});
const NewArrivalsProductFeed = dynamic(() => import("@components/product/feeds/new-arrivals-product-feed"), {
  ssr: false,
});
import dynamic from "next/dynamic";
import { useLazyRender } from "@utils/useLazyRender";
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
export const getStaticProps = async ({ locale }: { locale: string }) => {
  try {
    // Gọi API lấy danh sách collections
    const [collections, brands, banners, oneBanner, newArrivalsProduct] = await Promise.all([
      fetchCollection().catch(() => []),
      fetchBrands().catch(() => []),
      fetchBanners().catch(() => []),
      getSecondBanner().catch(() => { }),
      fetchNewArrivalAncientProducts().catch(() => []),
    ]);
    // Format collections for banner display
    const formattedCollections = collections.map((collection: any) => {
      const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${collection.representative_image_url}`;
      return {
        id: collection.id,
        title: collection.title || "No title",
        slug: collection.slug || "#",
        image: {
          mobile: { url: imageUrl, width: 450, height: 150 },
          desktop: { url: imageUrl, width: 580, height: 360 },
        },
      };
    });
    // Format main banner
    let formattedBanner = null;
    if (oneBanner?.item) {
      const parsed = oneBanner.item;
      if (parsed.length > 0) {
        const first = parsed[0];
        // const images = JSON.parse(first.album || "[]").map((img: string) => `${process.env.NEXT_PUBLIC_SITE_URL}/${img}`);
        formattedBanner = {
          id: first.id,
          title: first.title,
          slug: first.url,
          image: {
            mobile: { url: `${process.env.NEXT_PUBLIC_SITE_URL}/${first.album.mobile}`, width: 768, height: 275 },
            desktop: { url: `${process.env.NEXT_PUBLIC_SITE_URL}/${first.album.desktop}`, width: 1800, height: 800 },
          },
        };
      }
    }
    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        collections: formattedCollections ?? [], // Thay undefined bằng null nếu cần
        brands: brands ?? [],
        banners: banners ?? [],
        oneBanner: formattedBanner ?? null, // Đảm bảo oneBanner không bao giờ là undefined
        newArrivalsProduct: newArrivalsProduct ?? [],
      },
      revalidate: 60,
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
        error: "Không thể tải dữ liệu từ API",
      },
      revalidate: 60,
    };
  }
};

export default function Home({
  collections,
  brands,
  banners,
  oneBanner,
  newArrivalsProduct,
  error }: any) {
  const { ref: newArrivalRef, visible: showNewArrival } = useLazyRender("50px");
  const { ref: brandRef, visible: showBrand } = useLazyRender("50px");
  const { ref: oneBannerRef, visible: showOneBanner } = useLazyRender("50px");
  return (
    <>
      <HeroBlock data={banners as any} />
      <Container>
        {collections.length > 0 && <BannerCarouselBlock data={collections} />}
        <div ref={brandRef}>
          {showBrand && brands && <BrandBlock sectionHeading="text-brands" data={brands} error={error} />}
        </div>
        <Divider />
        <div ref={newArrivalRef}>
          {showNewArrival && newArrivalsProduct.length > 0 && <NewArrivalsProductFeed data={newArrivalsProduct} error={error} />}
        </div>
        <div ref={oneBannerRef}>
          {showOneBanner && oneBanner && (
            <BannerCard
              key={`banner--key${oneBanner.id}`}
              banner={oneBanner}
              href=''
              className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
              classNameInner="h-28 sm:h-auto"
            />
          )}
        </div>
        {/* <BestSellerProductFeed data={bestsellerProducts} error={error} /> */}
        <Divider />
      </Container>
    </>
  );
}

Home.Layout = Layout;
