import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { ShopFilters } from "@components/shop/filters";
import StickyBox from "react-sticky-box";
import { ProductGrid } from "@components/product/product-grid";
import SearchTopBar from "@components/shop/top-bar";
import ActiveLink from "@components/ui/active-link";
import { BreadcrumbItems } from "@components/common/breadcrumb";
import { ROUTES } from "@utils/routes";
import { useSearchParams } from "next/navigation";

export default function Shop() {
  const searchParams = useSearchParams()
  const params: { [anyProp: string]: string } = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  });
  return (
    <>
      {/* <ShopDiscount /> */}
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
                    href={ROUTES.SEARCH}
                    activeClassName="font-semibold text-heading"
                    className="capitalize"
                  >
                    Search
                  </ActiveLink>
                </BreadcrumbItems>
              </div>
              <ShopFilters />
            </StickyBox>
          </div>
          <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
            <SearchTopBar />
            <ProductGrid
              params={params}
            />
          </div>
        </div>
        {/* <Subscription /> */}
      </Container>
    </>
  );
}

Shop.Layout = Layout;
