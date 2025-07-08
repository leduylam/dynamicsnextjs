import { CheckBox } from "@components/ui/checkbox";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
interface SizeFilterProps {
  title?: string;
  items?: any;
}
export const SizeFilter = ({ title, items }: SizeFilterProps) => {
  const router = useRouter();
  const { query } = router;
  const selectedFilters = Object.entries(query).reduce<
    Record<string, string[]>
  >((acc, [key, val]) => {
    const match = key.match(/^filter\[(.+)\]$/); // match "filter[size]"
    if (!match) return acc;
    const filterKey = match[1];
    if (typeof val === "string") {
      acc[filterKey] = val.split(",").map((v) => v.trim());
    } else if (Array.isArray(val)) {
      acc[filterKey] = val;
    } else {
      acc[filterKey] = [];
    }
    return acc;
  }, {});
  const [formState, setFormState] =
    React.useState<Record<string, string[]>>(selectedFilters);
  React.useEffect(() => {
    setFormState(selectedFilters);
  }, [query]);
  const [colors, setColors] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  function handleItemClick(
    e: React.FormEvent<HTMLInputElement>,
    rawGroup: string
  ): void {
    const group = rawGroup.toLowerCase();
    const { value } = e.currentTarget;
    const currentValues = formState[group] ?? [];

    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    // Cập nhật UI
    setFormState((prev) => ({
      ...prev,
      [group]: updatedValues,
    }));

    // Lấy filter hiện tại
    const currentFilter =
      typeof query.filter === "object" &&
      query.filter !== null &&
      !Array.isArray(query.filter)
        ? (query.filter as Record<string, string>)
        : {};

    const newFilter = { ...currentFilter };

    if (updatedValues.length > 0) {
      newFilter[group] = updatedValues.join(",");
    } else {
      delete newFilter[group]; // 🧹 Xoá key nếu không còn value nào
    }

    const filterQuery: Record<string, string> = {};
    Object.entries(newFilter).forEach(([key, value]) => {
      filterQuery[`filter[${key}]`] = value;
    });

    const filterKeys =
      typeof query.filter === "object" &&
      query.filter !== null &&
      !Array.isArray(query.filter)
        ? Object.keys(query.filter)
        : [];
    const cleanQuery = filterKeys.reduce<Record<string, any>>((acc, k) => {
      if (!/^filter\[.+\]$/.test(k)) acc[k] = query[k];
      return acc;
    }, {});
    // Add updated filter keys
    Object.assign(cleanQuery, filterQuery);

    router.push(
      {
        pathname: router.asPath.split("?")[0], // đường path thực tế
        query: { ...cleanQuery },
      },
      undefined,
      { scroll: false }
    );
  }
  useEffect(() => {
    if (items && title === "Color") {
      setColors(items.map((color: { value: any }) => color.value));
    }
  }, [items, title]);
  const splitColors = colors.flatMap((color) =>
    color.split("-").map((part: string) => part.trim())
  );
  const uniqueColors = [...new Set(splitColors)];
  const showMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };
  React.useEffect(() => {
    Object.keys(query).forEach((key) => {
      const values =
        typeof query[key] === "string" ? query[key].split(",") : [];
      setFormState((prevState) => ({
        ...prevState,
        [key]: values,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="block border-b border-gray-300 pb-7">
      <h3 className="text-heading text-sm md:text-base font-semibold mb-7">
        {title}
      </h3>
      <div className="mt-2 flex flex-col space-y-4">
        {title === "Color" ? (
          <>
            {uniqueColors
              .slice(0, visibleCount)
              ?.map((item: any, index: number) => (
                <CheckBox
                  key={index}
                  label={<span className="flex items-center">{item}</span>}
                  name={title.toLowerCase()}
                  checked={
                    (Array.isArray(formState[title.toLowerCase()]) &&
                      formState[title.toLowerCase()]?.includes(item)) ||
                    false
                  }
                  value={item}
                  onChange={(e) => handleItemClick(e, title)}
                />
              ))}
            {visibleCount < uniqueColors.length && (
              <p
                className="text-sm mx-5 cursor-pointer italic hover:underline"
                onClick={showMore}
              >
                More ...
              </p>
            )}
          </>
        ) : (
          <>
            {items?.map((item: any) => (
              <CheckBox
                key={item.id}
                label={<span className="flex items-center">{item.value}</span>}
                name={item.name.toLowerCase()}
                checked={
                  (Array.isArray(formState[item.name.toLowerCase()]) &&
                    formState[item.name.toLowerCase()]?.includes(item.value)) ||
                  false
                }
                value={item.value}
                onChange={(e) => handleItemClick(e, item.name)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
