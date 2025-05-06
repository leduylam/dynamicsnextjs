import Container from "@components/ui/container";
import Layout from "@components/layout/layout";

import Divider from "@components/ui/divider";
import Breadcrumb from "@components/common/breadcrumb";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import { fetchBrands } from "@framework/brand/get-all-brands";
import dynamic from "next/dynamic";
import { fetchAllProductSlugs, fetchProduct } from "@framework/product/get-product";
import { useLazyRender } from "@utils/useLazyRender";
import { fetchRelatedProducts } from "@framework/product/get-related-product";
const RelatedProducts = dynamic(() => import("@containers/related-products"), {
	ssr: false,
});
const BrandBlock = dynamic(() => import("@containers/brand-block"), {
	ssr: false,
});
const ProductSingleDetails = dynamic(() => import("@components/product/product-single-details"), {
	ssr: false,
});
export default function ProductPage({ brands, product, relatedProducts, error }: any) {
	const { ref: relatedRef, visible: showRelated } = useLazyRender("50px");
	const { ref: brandRef, visible: showBrand } = useLazyRender("50px");
	return (
		<>
			<Divider className="mb-0" />
			<Container>
				<div className="pt-8">
					<Breadcrumb />
				</div>
				<ProductSingleDetails data={product} />
				<div className="mt-20" />
				{Array.isArray(relatedProducts) && relatedProducts.length === 0 ? (
					<div>There are no related products</div>
				) : (
					<div ref={relatedRef} >
						{showRelated && (
							<RelatedProducts
								sectionHeading="Related Products"
								data={relatedProducts}
								isLoading={false} />
						)}
					</div>
				)}
				{/* <Subscription /> */}
				<div ref={brandRef}>
					{showBrand && (
						<BrandBlock sectionHeading="text-brands" data={brands} error={error} />
					)}
				</div>
			</Container>
		</>
	);
}

ProductPage.Layout = Layout;
export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
	try {
		const { slug } = params as { slug: string };
		const [brands, product, relatedProducts] = await Promise.all([
			fetchBrands().catch(() => []),
			fetchProduct(slug),
			fetchRelatedProducts(slug)
		]);
		return {
			props: {
				...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
				brands,
				product,
				relatedProducts
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
export const getStaticPaths: GetStaticPaths = async () => {
	try {
		const products = await fetchAllProductSlugs(); // [{ slug: "ao-thun-1" }, { slug: "giay-2" }, ...]
		const paths = products.map((item: { slug: string }): { params: { slug: string } } => ({
			params: { slug: item.slug },
		}));

		return {
			paths,
			fallback: "blocking", // 👈 nếu chưa có slug nào đó thì build ngay lần đầu user truy cập
		};
	} catch (error) {
		return {
			paths: [],
			fallback: "blocking",
		};
	}
};
