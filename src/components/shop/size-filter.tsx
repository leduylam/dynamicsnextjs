import { CheckBox } from "@components/ui/checkbox";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

interface Item {
  id?: string | number;
  name: string; // group name (e.g. "Size", "Material")
  value: string; // option value (e.g. "M", "Cotton")
}

interface SizeFilterProps {
  title?: string;
  items?: Item[];
}

// ---- helpers ----
const FILTER_RE = /^filter\[(.+)\]$/i;

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
      // Next đôi khi trả mảng nhưng mình vẫn merge thành unique list
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
  // 1) giữ lại các query KHÔNG phải filter[...]
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(baseQuery)) {
    if (!FILTER_RE.test(key)) clean[key] = val;
  }
  // 2) thêm lại filter[...] theo nextFilters
  for (const [g, values] of Object.entries(nextFilters)) {
    if (values.length === 0) continue;
    clean[`filter[${g}]`] = values.join(",");
  }
  return clean;
}

export const SizeFilter = ({ title, items = [] }: SizeFilterProps) => {
  const router = useRouter();
  const { query, isReady, asPath } = router;

  // filters hiện tại lấy thẳng từ URL (phẳng theo filter[...])
  const selectedFilters = useMemo(() => parseFiltersFromQuery(query), [query]);

  // formState để control UI (checkbox)
  const [formState, setFormState] = useState<Record<string, string[]>>({});

  // đồng bộ UI khi URL thay đổi
  useEffect(() => {
    if (!isReady) return;
    setFormState(selectedFilters);
  }, [isReady, selectedFilters]);

  // xử lý Color đặc biệt (chuẩn hóa và tách theo "-")
  const uniqueColors = useMemo(() => {
    if (title !== "Color" || !items?.length) return [];
    const parts = items
      .map((x) => String(x.value ?? "").trim())
      .filter(Boolean)
      .flatMap((c) => c.split("-").map((s) => s.trim()))
      .filter(Boolean);
    return [...new Set(parts)];
  }, [title, items]);

  const [visibleCount, setVisibleCount] = useState(10);
  const showMore = () => setVisibleCount((n) => n + 10);

  function toggleValue(groupRaw: string, value: string) {
    const group = groupRaw.toLowerCase();
    const current = formState[group] ?? [];
    const exists = current.includes(value);
    const nextValues = exists
      ? current.filter((v) => v !== value)
      : [...current, value];

    // Cập nhật UI ngay
    const nextForm = { ...formState };
    if (nextValues.length === 0) delete nextForm[group];
    else nextForm[group] = nextValues;
    setFormState(nextForm);

    // Cập nhật URL — xóa filter cũ rồi set mới
    const nextQuery = buildNextQuery(query, nextForm);

    router.replace(
      { pathname: asPath.split("?")[0], query: nextQuery },
      undefined,
      { scroll: false, shallow: true }
    );
  }

  return (
    <div className="block border-b border-gray-300 pb-7">
      <h3 className="text-heading text-sm md:text-base font-semibold mb-7">
        {title}
      </h3>

      <div className="mt-2 flex flex-col space-y-4">
        {title === "Color" ? (
          <>
            {uniqueColors.slice(0, visibleCount).map((color, i) => {
              const g = (title ?? "").toLowerCase();
              const checked = (formState[g] ?? []).includes(color);
              return (
                <CheckBox
                  key={`${color}-${i}`}
                  label={<span className="flex items-center">{color}</span>}
                  name={g}
                  checked={checked}
                  value={color}
                  onChange={() => toggleValue(title!, color)}
                />
              );
            })}
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
