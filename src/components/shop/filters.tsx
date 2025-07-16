import { BrandFilter } from "./brand-filter";
import { FilteredItem } from "./filtered-item";
import { useRouter } from "next/router";
import isEmpty from "lodash/isEmpty";
import { SizeFilter } from "./size-filter";
import { useSizeQuery } from "@framework/product/get-all-size";
import { getVariations } from "@framework/utils/get-variations";
type Props = { slug?: string };
export const ShopFilters: React.FC<Props> = ({ slug }) => {
  const router = useRouter();
  const { pathname, query } = router;
  const { data } = useSizeQuery({ ...(slug ? { slug } : {}), ...query });
  const variations = getVariations(data);
  return (
    <div className="pt-1">
      <div className="block border-b border-gray-300 pb-7 mb-7">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-semibold text-heading text-xl md:text-2xl">
            Filters
          </h2>
          <button
            className="flex-shrink text-xs mt-0.5 transition duration-150 ease-in focus:outline-none hover:text-heading"
            aria-label="Clear All"
            onClick={() => {
              router.push(pathname);
            }}
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap -m-1.5 pt-2">
          {!isEmpty(query) &&
            Object.values(query)
              .join(",")
              .split(",")
              .map((v, idx) => (
                <FilteredItem
                  itemKey={
                    Object.keys(query).find((k) => query[k]?.includes(v))!
                  }
                  itemValue={v}
                  key={idx}
                />
              ))}
        </div>
      </div>

      {/* <CategoryFilter /> */}
      <BrandFilter />
      {/* <PriceFilter /> */}
      {/* <ColorFilter /> */}
      {Object.keys(variations).map((variation) => (
        <SizeFilter
          key={variation}
          title={variation}
          items={variations[variation]}
        />
      ))}
    </div>
  );
};
