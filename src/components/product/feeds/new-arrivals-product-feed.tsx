import React from "react";
import ProductsBlock from "@containers/products-block";
import { useNewArrivalProductsQuery } from "@framework/product/get-all-new-arrival-products";

interface Props {
  hideProductDescription?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  demoVariant?: "ancient";
  disableBorderRadius?: boolean;
  className?: string;
}

const NewArrivalsProductFeed = React.memo<Props>(function NewArrivalsProductFeed({
  hideProductDescription = false,
  showCategory = false,
  showRating = false,
  demoVariant,
  disableBorderRadius = false,
  className = "mb-9 md:mb-10 xl:mb-12",
}) {
  const { data, isLoading, error } = useNewArrivalProductsQuery({
    limit: 10,
    demoVariant,
  } as any);
  const allProducts = data?.products ?? [];
  return (
    <ProductsBlock
      className={className}
      hideProductDescription={hideProductDescription}
      showCategory={showCategory}
      showRating={showRating}
      sectionHeading="text-new-arrivals"
      categorySlug="/search?sort_by=newest"
      products={allProducts}
      loading={isLoading}
      error={error?.message}
      uniqueKey="new-arrivals"
      demoVariant={demoVariant}
      disableBorderRadius={disableBorderRadius}
    />
  );
});

export default NewArrivalsProductFeed;
