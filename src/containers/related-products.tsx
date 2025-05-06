import SectionHeader from "@components/common/section-header";
import ProductCard from "@components/product/product-card";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";

interface ProductsProps {
	sectionHeading: string;
	className?: string;
	data: any,
	isLoading?: boolean
}

const RelatedProducts: React.FC<ProductsProps> = ({
	sectionHeading,
	className = "mb-9 lg:mb-10 xl:mb-14",
	data,
	isLoading
}) => {
	return (
		<div className={className}>
			<SectionHeader sectionHeading={sectionHeading} />
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
				{isLoading ? (
					<ProductFeedLoader limit={5} uniqueKey="related-product" />
				) : (
					data?.map((product: any, index: number) => (
						<ProductCard
							key={`product--key${product.id}`}
							product={product}
							imgWidth={340}
							imgHeight={340}
							variant="grid"
							index={index}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default RelatedProducts;
