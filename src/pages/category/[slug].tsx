import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import { ProductGrid } from "@components/product/product-grid";
import CategoryBanner from "@containers/category-banner";
import { ShopFilters } from "@components/shop/filters";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

export default function Category() {
	return (
		<div className="border-t-2 border-borderBottom">
			<Container>
				<CategoryBanner />
				<div className="pb-16 lg:pb-20">
					<ShopFilters />
					<ProductGrid className="3xl:grid-cols-6" />
				</div>
			</Container>
		</div>
	);
}

Category.Layout = Layout;
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