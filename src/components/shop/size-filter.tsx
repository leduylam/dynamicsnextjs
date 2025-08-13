import { CheckBox } from "@components/ui/checkbox";
import { buildColorBuckets, buildSizeBuckets } from "@utils/color-bucket";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import BucketList from "./bucket-list";

interface Item {
  id?: string | number;
  name: string;
  value: string;
  slug?: string;
  product_name?: string;
}

interface SizeFilterProps {
  title?: string;
  items?: Item[];
}

// ---- helpers ----
const FILTER_RE = /^filter\[(.+)\]$/i;
// NEW: key riêng cho bucket
const COLOR_BUCKET_KEY = "color";

function parseFiltersFromQuery(
  query: Record<string, any>
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(query)) {
    const m = key.match(FILTER_RE);
    if (!m) continue;
    const g = m[1].toLowerCase();
    if (typeof raw === "string") {
      out[g] = raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (Array.isArray(raw)) {
      out[g] = [
        ...new Set(
          raw.flatMap((s) =>
            String(s)
              .split(",")
              .map((v) => v.trim())
          )
        ),
      ].filter(Boolean);
    }
  }
  return out;
}

function buildNextQuery(
  baseQuery: Record<string, any>,
  nextFilters: Record<string, string[]>
) {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(baseQuery)) {
    if (!FILTER_RE.test(key)) clean[key] = val;
  }
  for (const [g, values] of Object.entries(nextFilters)) {
    if (values.length === 0) continue;
    clean[`filter[${g}]`] = values.join(",");
  }
  return clean;
}

/** ========================================================= */

export const SizeFilter = ({ title, items = [] }: SizeFilterProps) => {
  const router = useRouter();
  const { query, isReady, asPath } = router;

  const selectedFilters = useMemo(() => parseFiltersFromQuery(query), [query]);
  const [formState, setFormState] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isReady) return;
    setFormState(selectedFilters);
  }, [isReady, selectedFilters]);

  // —— BUCKET CHO COLOR —— (FE chỉ gửi bucket)
  const colorBuckets = useMemo(() => {
    if (title !== "Color" || !items?.length)
      return {} as Record<string, string[]>;
    return buildColorBuckets(items);
  }, [title, items]);

  const bucketNames = useMemo(() => Object.keys(colorBuckets), [colorBuckets]);

  // CHANGED: trạng thái theo 'color_bucket' chứ không phải 'color'
  function getBucketState(bucket: string) {
    const originals = colorBuckets[bucket] ?? [];
    const selectedBuckets = new Set(formState[COLOR_BUCKET_KEY] ?? []);
    const checked = selectedBuckets.has(bucket);
    return {
      checked,
      indeterminate: false, // không còn partial vì không expand
      originals,
      hit: checked ? originals.length : 0, // chỉ để hiển thị (hit/total)
      total: originals.length,
    };
  }

  // CHANGED: toggle chỉ ghi vào group 'color_bucket'
  function toggleBucket(bucket: string) {
    const current = new Set(formState[COLOR_BUCKET_KEY] ?? []);
    if (current.has(bucket)) current.delete(bucket);
    else current.add(bucket);

    const nextValues = [...current];
    const nextForm = { ...formState, [COLOR_BUCKET_KEY]: nextValues };
    if (nextValues.length === 0) {
      delete (nextForm as any)[COLOR_BUCKET_KEY];
    }
    setFormState(nextForm);

    const nextFilters = {
      ...parseFiltersFromQuery(router.query),
      [COLOR_BUCKET_KEY]: nextValues,
    };
    const nextQuery = buildNextQuery(router.query, nextFilters);

    router.replace(
      { pathname: asPath.split("?")[0], query: nextQuery },
      undefined,
      { shallow: true, scroll: false }
    );
  }

  const [visibleCount, setVisibleCount] = useState(10);
  const showMore = () => setVisibleCount((n) => n + 10);

  // giữ cho các group khác (Size/Material/...) như cũ
  function toggleValue(groupRaw: string, value: string) {
    const group = groupRaw.toLowerCase();
    const current = formState[group] ?? [];
    const exists = current.includes(value);
    const nextValues = exists
      ? current.filter((v) => v !== value)
      : [...current, value];

    const nextForm = { ...formState };
    if (nextValues.length === 0) delete nextForm[group];
    else nextForm[group] = nextValues;
    setFormState(nextForm);

    const nextQuery = buildNextQuery(query, nextForm);
    router.replace(
      { pathname: asPath.split("?")[0], query: nextQuery },
      undefined,
      { scroll: false, shallow: true }
    );
  }

  const sizeBuckets = useMemo(() => {
    if (title !== "Size" || !items?.length) return null;
    return buildSizeBuckets(
      items.map((item) => ({
        value: item.value,
        name: item.name,
        product_name: item.product_name ?? "",
        slug: item.slug,
        // tags can be added if present in Item
      }))
    );
  }, [title, items]);

  return (
    <div className="block border-b border-gray-300 pb-7">
      <h3 className="text-heading text-sm md:text-base font-semibold mb-7">
        {title}
      </h3>

      <div className="mt-2 flex flex-col space-y-4">
        {title === "Color" ? (
          <>
            {bucketNames.slice(0, visibleCount).map((bucket) => {
              const { checked, indeterminate, hit, total } =
                getBucketState(bucket);
              return (
                <CheckBox
                  key={bucket}
                  name={COLOR_BUCKET_KEY}
                  checked={checked}
                  // @ts-ignore
                  indeterminate={indeterminate}
                  value={bucket}
                  label={
                    <span className="flex items-center">
                      {bucket}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({hit}/{total})
                      </span>
                    </span>
                  }
                  onChange={() => toggleBucket(bucket)}
                />
              );
            })}
            {visibleCount < bucketNames.length && (
              <p
                className="text-sm mx-5 cursor-pointer italic hover:underline"
                onClick={showMore}
              >
                More ...
              </p>
            )}
          </>
        ) : title === "Size" && sizeBuckets ? (
          <>
            {sizeBuckets &&
              (
                ["Tops", "Bottoms", "Footwear", "Kids", "Accessories"] as const
              ).map((bucket) => {
                const list = sizeBuckets.get(bucket)!;
                if (!list.length) return null;
                return (
                  <BucketList
                    data={{ [bucket]: list }}
                    formState={formState}
                    toggleValue={toggleValue}
                  />
                );
              })}
          </>
        ) : (
          <>
            {items.map((item) => {
              const g = item.name.toLowerCase();
              const checked = (formState[g] ?? []).includes(item.value);
              return (
                <CheckBox
                  key={item.id ?? `${g}-${item.value}`}
                  label={
                    <span className="flex items-center">{item.value}</span>
                  }
                  name={g}
                  checked={checked}
                  value={item.value}
                  onChange={() => toggleValue(item.name, item.value)}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
