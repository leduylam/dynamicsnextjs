import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import StickyBox from "react-sticky-box";
import { ProductGrid } from "@components/product/product-grid";
import ActiveLink from "@components/ui/active-link";
import { BreadcrumbItems } from "@components/common/breadcrumb";
import { ROUTES } from "@utils/routes";
import CollectionTopBar from "@components/collection/collection-top-bar";

export default function Collections() {

  return (
    <div className="border-t-2 border-borderBottom">
      <Container>
        <div className={`flex pt-8 pb-16 lg:pb-20`}>
          <div className="flex-shrink-0 hidden ltr:pr-24 rtl:pl-24 lg:block w-96">
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
                    Collection
                  </ActiveLink>
                </BreadcrumbItems>
              </div>
            </StickyBox>
          </div>

          <div className="w-full ltr:lg:-ml-9 rtl:lg:-mr-9">
            <CollectionTopBar />
            <ProductGrid />
          </div>
        </div>
      </Container>
    </div>
  );
}

Collections.Layout = Layout;

