import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import ProductSingleDetails from "@components/product/product-single-details";
import RelatedProducts from "@containers/related-products";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import BrandBlock from "@containers/brand-block";

export default function ProductPage() {
	return (
		<>
			<Divider className="mb-0" />
			<Container>
				<div className="pt-8">
					<Breadcrumb />
				</div>
				<ProductSingleDetails />
				<RelatedProducts sectionHeading="Related Products" />
				{/* <Subscription /> */}
				<BrandBlock sectionHeading="Brands" />
			</Container>
		</>
	);
}

ProductPage.Layout = Layout;
