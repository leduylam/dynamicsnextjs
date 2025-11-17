import React, { useMemo } from "react";
import { BrandFilter } from "./brand-filter";
import { FilteredItem } from "./filtered-item";
import { useRouter } from "next/router";
import isEmpty from "lodash/isEmpty";
import { SizeFilter } from "./size-filter";
import { useSizeQuery } from "@framework/product/get-all-size";
import { getVariations } from "@framework/utils/get-variations";
type Props = { slug?: string };
export const ShopFilters: React.FC<Props> = React.memo(({ slug }) => {
  const router = useRouter();
  const { pathname, query } = router;
  const isCategoryRoute = pathname?.startsWith("/categories");
  const { data } = useSizeQuery({ ...(slug ? { slug } : {}), ...query });
  const variations = useMemo(() => getVariations(data), [data]);
  const activeFilterTags = useMemo(() => {
    const entries = Object.entries(query).filter(
      ([key]) => !(isCategoryRoute && key === "slug")
    );
    const tags: { key: string; value: string }[] = [];
    entries.forEach(([key, raw]) => {
      if (Array.isArray(raw)) {
        raw.forEach((item) => {
          const value = String(item).trim();
          if (value) {
            value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .forEach((v) => tags.push({ key, value: v }));
          }
        });
      } else if (typeof raw === "string") {
        raw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .forEach((v) => tags.push({ key, value: v }));
      }
    });
    return tags;
  }, [isCategoryRoute, query]);
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
        {!isEmpty(activeFilterTags) && (
        <div className="flex flex-wrap -m-1.5 pt-2">
            {activeFilterTags.map(({ key, value }, idx) => (
              <FilteredItem itemKey={key} itemValue={value} key={`${key}-${value}-${idx}`} />
              ))}
        </div>
        )}
      </div>

      {/* <CategoryFilter /> */}
      <BrandFilter slug={slug} />
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
});

ShopFilters.displayName = 'ShopFilters';
