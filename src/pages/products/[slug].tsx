import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import ProductSingleDetails from "@components/product/product-single-details";
import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { fetchBrands } from "@framework/brand/get-all-brands";
import dynamic from "next/dynamic";
const RelatedProducts = dynamic(() => import("@containers/related-products"), {
	ssr: false,
});
const BrandBlock = dynamic(() => import("@containers/brand-block"), {
	ssr: false,
});
export default function ProductPage({ brands, error }: any) {
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
				<BrandBlock sectionHeading="text-brands" data={brands} error={error} />
			</Container>
		</>
	);
}

ProductPage.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	try {
		const [brands] = await Promise.all([
			fetchBrands().catch(() => []),
		]);
		return {
			props: {
				...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
				brands
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
