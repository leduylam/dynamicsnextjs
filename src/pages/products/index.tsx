import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import ShopDiscount from "@components/shop/discount";
import { ShopFilters } from "@components/shop/filters";
import StickyBox from "react-sticky-box";
import { ProductGrid } from "@components/product/product-grid";
import SearchTopBar from "@components/shop/top-bar";
import ActiveLink from "@components/ui/active-link";
import { BreadcrumbItems } from "@components/common/breadcrumb";
import { ROUTES } from "@utils/routes";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Products() {
  return (
    <>
      <ShopDiscount />
      <Container>
        <div className={`flex pt-8 pb-16 lg:pb-20`}>
          <div className="flex-shrink-0 ltr:pr-24 rtl:pl-24 hidden lg:block w-96">
            <StickyBox offsetTop={50} offsetBottom={20}>
              <div className="pb-7">
                <BreadcrumbItems separator="/">
                  <ActiveLink
                    href={"/"}
                    activeClassName="font-semibold text-heading"
                  >
                    Home
                  </ActiveLink>
                  <ActiveLink
                    href={ROUTES.PRODUCT}
                    activeClassName="font-semibold text-heading"
                    className="capitalize"
                  >
                    Products
                  </ActiveLink>
                </BreadcrumbItems>
              </div>
              <ShopFilters />
            </StickyBox>
          </div>

          <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
            <SearchTopBar />
            <ProductGrid />
          </div>
        </div>
      </Container>
    </>
  );
}

Products.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      },
    };
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
      },
    };
  }
};

