interface VariantAttributeValue {
  attribute_name?: string;
  attribute_slug?: string;
  attribute_value?: string;
  attribute_id?: number | null;
  attribute_value_id?: number | null;
  sort_order?: number;
}

interface Variant {
  id?: number | string;
  uuid?: string;
  name?: string;
  sku?: string;
  stock?: number;
  /** Tồn CÓ THỂ ĐẶT (= stock − giữ chỗ). Ưu tiên dùng cho isAvailable/sellability. */
  available_stock?: number;
  attributes?: Record<string, string>;
  variant_attribute_values?: VariantAttributeValue[];
  image?: string | null;
  images?: Array<{
    url?: string;
    thumbnail?: string;
    original?: string;
  }>;
  [key: string]: unknown;
}

interface VariationOption {
  id: number | string;
  value: string;
  meta?: string;
  attribute: {
    slug: string;
    name: string;
  };
  variant?: Variant;
  stock?: number;
  isAvailable?: boolean;
}

function extractVariantAttributes(variant: Variant): Record<string, string> {
  const attributesJson =
    variant.attributes && typeof variant.attributes === "object"
      ? variant.attributes
      : {};

  if (Object.keys(attributesJson).length > 0) {
    return attributesJson;
  }

  if (
    variant.variant_attribute_values &&
    variant.variant_attribute_values.length > 0
  ) {
    const uniqueByAttributeName = new Map<string, VariantAttributeValue>();
    variant.variant_attribute_values.forEach((av) => {
      const attrName = (av.attribute_name || av.attribute_slug || "").trim();
      if (attrName && av.attribute_value) {
        const normalizedKey = attrName.toLowerCase();
        if (!uniqueByAttributeName.has(normalizedKey)) {
          uniqueByAttributeName.set(normalizedKey, av);
        }
      }
    });

    const result: Record<string, string> = {};
    uniqueByAttributeName.forEach((av) => {
      const attrName = (av.attribute_name || av.attribute_slug || "").trim();
      if (attrName && av.attribute_value) {
        result[attrName] = av.attribute_value;
      }
    });

    return result;
  }

  return {};
}

/** Priority for variant attribute order: color -> size -> hand -> shaft -> flex -> loft -> others */
export function getAttributeSortPriority(attrName: string): number {
  const t = (attrName || "").trim().toLowerCase();
  if (t === "color" || t.includes("màu") || t === "colour") return 0;
  if (t === "size" || t.includes("kích thước") || t.includes("kích cỡ"))
    return 1;
  if (t === "hand") return 2;
  if (t === "shaft") return 3;
  if (t === "flex") return 4;
  if (t === "loft") return 5;
  return 6;
}

/** Returns a new attributes object with keys sorted by display order (for cart item, item id, display name). */
export function sortAttributesByDisplayOrder(
  attributes: Record<string, string>,
): Record<string, string> {
  const sortedKeys = Object.keys(attributes).sort(
    (a, b) => getAttributeSortPriority(a) - getAttributeSortPriority(b),
  );
  const result: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    result[key] = attributes[key];
  });
  return result;
}

export function buildVariantOptionsFromVariants(
  variants: Variant[] | undefined,
  /** variant_options từ product — dùng thứ tự này thay vì hardcoded priority */
  productVariantOptions?: Array<{ name: string; values?: string[] }> | null,
): Record<string, VariationOption[]> {
  if (!variants || variants.length === 0) {
    return {};
  }

  const options: Record<string, Map<string, VariationOption>> = {};
  const attributeStockMap: Record<string, Record<string, number>> = {};

  variants.forEach((variant) => {
    // Sellability theo tồn CÓ THỂ ĐẶT (đã trừ giữ chỗ), fallback stock vật lý.
    const stock = variant.available_stock ?? variant.stock ?? 0;
    const variantAttrs = extractVariantAttributes(variant);

    Object.entries(variantAttrs).forEach(([attrName, attrValue]) => {
      if (!attributeStockMap[attrName]) {
        attributeStockMap[attrName] = {};
      }

      const value = String(attrValue);
      const key = `${attrName}-${value}`;
      const currentStock = attributeStockMap[attrName][key] || 0;
      attributeStockMap[attrName][key] = Math.max(currentStock, stock);
    });
  });

  variants.forEach((variant) => {
    const variantAttrs = extractVariantAttributes(variant);

    Object.entries(variantAttrs).forEach(([attrName, attrValue]) => {
      if (!options[attrName]) {
        options[attrName] = new Map();
      }

      const value = String(attrValue);
      const key = `${attrName}-${value}`;

      if (!options[attrName].has(key)) {
        const maxStock = attributeStockMap[attrName]?.[key] ?? 0;
        const isAvailable = maxStock > 0;
        const attrValueObj = variant.variant_attribute_values?.find(
          (av) => (av.attribute_name || av.attribute_slug || "") === attrName,
        );

        options[attrName].set(key, {
          id: attrValueObj?.attribute_value_id || Math.random(),
          value: value,
          meta: "",
          attribute: {
            slug: attrValueObj?.attribute_slug || attrName.toLowerCase(),
            name: attrValueObj?.attribute_name || attrName,
          },
          variant: variant,
          stock: maxStock,
          isAvailable: isAvailable,
        });
      }
    });
  });

  const result: Record<string, VariationOption[]> = {};

  // Sort theo variant_options order từ product (nếu có), fallback hardcoded priority
  const voOrder = (productVariantOptions ?? []).map((o) =>
    (o.name ?? "").trim().toLowerCase(),
  );
  const getSortIndex = (attrName: string): number => {
    if (voOrder.length > 0) {
      const idx = voOrder.indexOf(attrName.trim().toLowerCase());
      return idx >= 0
        ? idx
        : voOrder.length + getAttributeSortPriority(attrName);
    }
    return getAttributeSortPriority(attrName);
  };

  const sortedKeys = Object.keys(options).sort(
    (a, b) => getSortIndex(a) - getSortIndex(b),
  );
  sortedKeys.forEach((key) => {
    result[key] = Array.from(options[key].values());
  });

  return result;
}

export function filterVariantOptionsBySelections(
  variations: Record<string, VariationOption[]>,
  variants: Variant[] | undefined,
  selectedAttributes: Record<string, string>,
  parentAttributeName?: string | null,
): Record<string, VariationOption[]> {
  if (!variants || variants.length === 0) {
    return variations;
  }

  const filtered: Record<string, VariationOption[]> = {};
  const selectedKeys = Object.keys(selectedAttributes);
  const parentValue = parentAttributeName
    ? selectedAttributes[parentAttributeName]
    : null;

  const normalize = (str: string): string => (str || "").trim().toLowerCase();

  const matchesAttributes = (
    variantAttrs: Record<string, string>,
    testAttrs: Record<string, string>,
  ): boolean => {
    return Object.keys(testAttrs).every((testKey) => {
      const testValue = testAttrs[testKey];
      const normalizedTestKey = normalize(testKey);
      const matchingKey = Object.keys(variantAttrs).find(
        (k) => normalize(k) === normalizedTestKey,
      );

      if (!matchingKey) return false;

      const variantValue = variantAttrs[matchingKey];
      return (
        variantValue === testValue ||
        normalize(variantValue) === normalize(testValue)
      );
    });
  };

  Object.keys(variations).forEach((attrName) => {
    if (selectedKeys.length === 0) {
      filtered[attrName] = variations[attrName];
      return;
    }

    const validOptions: VariationOption[] = [];
    const isChildAttribute =
      parentAttributeName && attrName !== parentAttributeName && parentValue;

    variations[attrName].forEach((option) => {
      const testAttributes = isChildAttribute
        ? { [parentAttributeName]: parentValue, [attrName]: option.value }
        : { ...selectedAttributes, [attrName]: option.value };

      const matchingVariants = variants.filter((variant) => {
        const variantAttrs = extractVariantAttributes(variant);
        if (Object.keys(variantAttrs).length === 0) return false;
        return matchesAttributes(variantAttrs, testAttributes);
      });

      if (matchingVariants.length === 0) return;

      const maxStock = Math.max(
        ...matchingVariants.map((v) => v.available_stock ?? v.stock ?? 0),
      );

      validOptions.push({
        ...option,
        isAvailable: maxStock > 0,
        stock: maxStock,
      });
    });

    filtered[attrName] = validOptions;
  });

  return filtered;
}

export function findVariantByAttributes(
  variants: Variant[] | undefined,
  selectedAttributes: Record<string, string>,
): Variant | null {
  if (!variants || variants.length === 0 || !selectedAttributes) {
    return null;
  }

  return (
    variants.find((variant) => {
      const variantAttrs = extractVariantAttributes(variant);
      return Object.keys(selectedAttributes).every(
        (key) => variantAttrs[key] === selectedAttributes[key],
      );
    }) || null
  );
}

export function getVariantAttributes(variant: Variant): Record<string, string> {
  return extractVariantAttributes(variant);
}

export function findVariantById(
  variants: Variant[] | undefined,
  id: string | number,
): Variant | null {
  if (!variants || variants.length === 0 || id == null || id === "") {
    return null;
  }
  const idStr = String(id);
  return (
    variants.find(
      (v) => v.id != null && (String(v.id) === idStr || v.uuid === idStr),
    ) || null
  );
}
