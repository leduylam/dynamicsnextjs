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
          <div className="w-full">
            <CollectionTopBar />
            {/* <ProductGrid /> */}
          </div>
        </div>
      </Container>
    </div>
  );
}

Collections.Layout = Layout;

