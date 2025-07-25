import SectionHeader from "@components/common/section-header";
import ProductCard from "@components/product/product-card";
import ProductFeedLoader from "@components/ui/loaders/product-feed-loader";
import { useRelatedProductsQuery } from "@framework/product/get-related-product";
import { useRouter } from "next/router";

interface ProductsProps {
  sectionHeading: string;
  className?: string;
}

const RelatedProducts: React.FC<ProductsProps> = ({
  sectionHeading,
  className = "mb-9 lg:mb-10 xl:mb-14",
}) => {
  const {
    query: { slug },
  } = useRouter();
  const { data, isLoading } = useRelatedProductsQuery({
    text: slug as string,
    limit: 5,
  });
  return (
    <div className={className}>
      <SectionHeader sectionHeading={sectionHeading} />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8">
        {isLoading ? (
          <ProductFeedLoader limit={5} uniqueKey="related-product" />
        ) : (
          data?.products?.map((product: any) => (
            <ProductCard
              key={`product--key${product.id}`}
              product={product}
              imgWidth={340}
              imgHeight={340}
              variant="grid"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
