import HeroSlider from '@containers/hero-slider';
import Container from '@components/ui/container';
import Layout from '@components/layout/layout';
import BannerBlockAncient from '@containers/banner-block-ancient';
import BrandBlock from '@containers/brand-block';
import { ancientHeroBanner } from '@framework/static/banner';
import NewArrivalsProductFeed from '@components/product/feeds/new-arrivals-product-feed';
import TestimonialCarousel from '@containers/testimonial-carousel';
import Instagram from '@components/common/instagram';
import CategoryBlock from '@containers/category-block';
import HireDesignerAncient from '@containers/buy-designer-ancient';

export default function Ancient() {
  const sectionCommonStyle = 'mb-7 md:mb-10 lg:mb-12 xl:mb-14 2xl:mb-[75px]';

  return (
    <>
      <HeroSlider
        data={ancientHeroBanner}
        variantRounded="default"
        variant="fullWidth"
        className={sectionCommonStyle}
        buttonGroupClassName="hidden"
      />

      <Container>
        <CategoryBlock
          type="rounded"
          sectionHeading="Browse Categories"
          roundedItemCount={5}
          roundedSpaceBetween={8}
          imgSize="large"
          demoVariant="ancient"
          disableBorderRadius={true}
          className={`${sectionCommonStyle} lg:pb-1 xl:pb-0`}
        />

        <NewArrivalsProductFeed
          demoVariant="ancient"
          hideProductDescription={true}
          showCategory={true}
          showRating={true}
          disableBorderRadius={true}
          className={sectionCommonStyle}
        />

        <BannerBlockAncient
          disableBorderRadius={true}
          largeFirst={true}
          dataVariant="two"
          demoVariant="ancient"
          className={sectionCommonStyle}
        />



        <BannerBlockAncient
          // className={`${sectionCommonStyle} lg:pb-1 xl:pb-0`}
          disableBorderRadius={true}
          demoVariant="ancient"
          spaceBetween={10}
          className={sectionCommonStyle}
        />

        <BrandBlock
          disableBorderRadius={true}
          sectionHeading="text-top-brands"
          showName={false}
          demoVariant="ancient"
          className={'mb-[14px] md:mb-6 lg:mb-7 xl:mb-8 2xl:mb-[45px]'}
        />

      </Container>

      <HireDesignerAncient />

      <Container>
        
        <TestimonialCarousel
          sectionHeading="text-testimonial"
          type="list"
          className="relative mb-12 md:mb-14 xl:mb-16"
          disableBoarderRadius={true}
          reduceCardSpacing={true}
          demoVariant="ancient"
        />

        <Instagram
          disableContainerBorderRadius={true}
          className={`mb-11 lg:mb-12 xl:mb-14 2xl:mb-[75px] md:gap-[7px]`}
        />

      </Container>
    </>
  );
}

Ancient.Layout = Layout;


