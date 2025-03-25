import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import ProductSingleDetails from "@components/product/product-single-details";
import RelatedProducts from "@containers/related-products";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import BrandBlock from "@containers/brand-block";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

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
				<BrandBlock sectionHeading="text-brands" />
			</Container>
		</>
	);
}

ProductPage.Layout = Layout;
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
