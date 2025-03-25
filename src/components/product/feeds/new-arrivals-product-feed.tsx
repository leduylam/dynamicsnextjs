import ProductsBlock from '@containers/products-block';
import { useEffect, useState } from 'react';

interface Props {
  data: any[],
  error: any,
  hideProductDescription?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  demoVariant?: 'ancient';
  disableBorderRadius?: boolean;
  className?: string;
}

export default function NewArrivalsProductFeed({
  data,
  error,
  hideProductDescription = false,
  showCategory = false,
  showRating = false,
  demoVariant,
  disableBorderRadius = false,
  className = 'mb-9 md:mb-10 xl:mb-12',
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <p>Loading...</p>; // Tránh UI bị thay đổi sau Hydration
  }
  return (
    <ProductsBlock
      className={className}
      hideProductDescription={hideProductDescription}
      showCategory={showCategory}
      showRating={showRating}
      sectionHeading="text-new-arrivals"
      products={data?.length > 0 ? data : []}
      loading={false}
      error={error?.message}
      uniqueKey="new-arrivals"
      demoVariant={demoVariant}
      disableBorderRadius={disableBorderRadius}
    />
  );
}
