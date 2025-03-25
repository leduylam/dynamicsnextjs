import ProductsBlock from "@containers/products-block";
import { useEffect, useState } from "react";

export default function BestSellerProductFeed({ data, error }: any) {
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);
	if (!hydrated) {
		return <p>Loading...</p>; // Tránh UI bị thay đổi sau Hydration
	}
	return (
		<ProductsBlock
			sectionHeading="tab-best-sellers"
			products={data}
			loading={false}
			error={error?.message}
			uniqueKey="best-sellers"
		/>
	);
}
