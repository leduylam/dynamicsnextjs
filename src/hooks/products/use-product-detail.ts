import { useState, useMemo, useEffect } from "react";
import { useCartMutation } from "@framework/carts/use-cart";
import { useAuth } from "@contexts/auth/auth-context";
import { getImageUrl } from "@utils/get-image-url";
import { Product } from "@framework/types";
import {
  buildVariantOptionsFromVariants,
  findVariantByAttributes,
  filterVariantOptionsBySelections,
  sortAttributesByDisplayOrder,
} from "@framework/utils/build-variant-options";
import {
  type ColorwayForImages,
  findColorwayByAttributeValue,
  getProductImagesFromColorway,
} from "@utils/product-image-helpers";
import {
  UseProductDetailOptions,
  UseProductDetailReturn,
  ProductVariant,
  VariationOption,
} from "@/types/product-detail";

/** Tồn CÓ THỂ ĐẶT của 1 dòng: ưu tiên available_stock, fallback stock. */
function availableOf(x: Record<string, unknown> | null | undefined): number {
  const raw =
    (x?.available_stock as number | undefined) ??
    (x?.stock as number | undefined) ??
    (x?.stock_quantity as number | undefined) ??
    0;
  const v = Number(raw);
  return Number.isFinite(v) ? v : 0;
}

/**
 * Hook xử lý logic product detail: variant/colorway/SKU/gallery (port từ client-vgd)
 * + B2B cart của client-dsc (useCartMutation + canWholeSalePrice).
 */
export function useProductDetail(
  options: UseProductDetailOptions,
): UseProductDetailReturn {
  const { product, initialQueryParams } = options;

  const { mutate: updateCart } = useCartMutation();
  const { accessRights } = useAuth();
  const canWholeSalePrice = accessRights?.canWholeSalePrice ?? false;

  const [quantity, setQuantity] = useState(1);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);

  type ProductWithVariants = Product & {
    variants?: ProductVariant[];
    uuid?: string | number;
    colorways?: ColorwayForImages[];
  };

  const productWithVariants = product as ProductWithVariants | null | undefined;
  const variants = productWithVariants?.variants || [];
  const productId =
    productWithVariants?.id || productWithVariants?.uuid || null;

  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [selectedParentVariant, setSelectedParentVariant] = useState<
    string | null
  >(null);

  const productVariantOptions =
    (
      product as {
        variant_options?: Array<{ name: string; values?: string[] }>;
      }
    )?.variant_options ?? null;

  const allVariations = useMemo(
    () => buildVariantOptionsFromVariants(variants, productVariantOptions),
    [variants, productVariantOptions],
  );

  const allAttrNames = Object.keys(allVariations);
  const parentAttributeName = allAttrNames.length > 0 ? allAttrNames[0] : null;
  const childAttributeNames = allAttrNames.slice(1);

  // Reset khi đổi product
  useEffect(() => {
    setAttributes({});
    setSelectedParentVariant(null);
  }, [productId]);

  // Auto-select từ ?color=xxx&size=xxx hoặc chọn option đầu khi mount
  useEffect(() => {
    if (variants.length === 0 || !parentAttributeName) return;

    if (initialQueryParams && Object.keys(initialQueryParams).length > 0) {
      const newAttributes: Record<string, string> = {};
      for (const attrName of allAttrNames) {
        const paramKey = attrName.toLowerCase().trim();
        const raw = initialQueryParams[paramKey];
        const paramValue = Array.isArray(raw) ? raw[0] : raw;
        if (paramValue == null || String(paramValue).trim() === "") continue;
        const opts = allVariations[attrName] || [];
        const normalized = String(paramValue).trim().toLowerCase();
        const opt = opts.find(
          (o) => String(o.value).trim().toLowerCase() === normalized,
        );
        if (opt) newAttributes[attrName] = opt.value;
      }
      if (Object.keys(newAttributes).length > 0) {
        setAttributes(newAttributes);
        const pv = newAttributes[parentAttributeName];
        if (pv) setSelectedParentVariant(pv);
        return;
      }
    }

    if (Object.keys(attributes).length > 0) return;
    const parentOptions = allVariations[parentAttributeName] || [];
    const firstAvailableOption =
      parentOptions.find((opt: VariationOption) => (opt.stock ?? 0) > 0) ||
      parentOptions[0];
    if (firstAvailableOption) {
      setAttributes({ [parentAttributeName]: firstAvailableOption.value });
      setSelectedParentVariant(firstAvailableOption.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants.length, parentAttributeName, productId, initialQueryParams]);

  // Filter child variants theo parent đã chọn
  const variations = useMemo(
    () =>
      filterVariantOptionsBySelections(
        allVariations,
        variants,
        attributes,
        parentAttributeName,
      ),
    [allVariations, variants, attributes, parentAttributeName],
  );

  const selectedVariant = useMemo(() => {
    return findVariantByAttributes(
      variants,
      attributes,
    ) as ProductVariant | null;
  }, [variants, attributes]);

  useEffect(() => {
    if (parentAttributeName) {
      setSelectedParentVariant(attributes[parentAttributeName] || null);
    }
  }, [attributes, parentAttributeName]);

  // Đã chọn đủ attribute bắt buộc chưa
  const variationKeys = Object.keys(variations);
  const isSelected =
    variationKeys.length > 0
      ? Object.keys(attributes).length > 0 &&
        variationKeys.every((variation) =>
          Object.prototype.hasOwnProperty.call(attributes, variation),
        )
      : true;

  function handleAttribute(attribute: { name: string; value: string }) {
    setAttributes((prev) => {
      const selectedAttrKey = attribute.name;
      const selectedAttrValue = attribute.value;

      if (!selectedAttrKey || !parentAttributeName) return prev;

      const isParentAttribute = selectedAttrKey === parentAttributeName;

      if (isParentAttribute) {
        const parentOption = allVariations[parentAttributeName]?.find(
          (opt: VariationOption) => opt.value === selectedAttrValue,
        );
        if (parentOption && (parentOption.stock ?? 0) <= 0) {
          return prev;
        }

        setSelectedParentVariant(selectedAttrValue);
        return { [selectedAttrKey]: selectedAttrValue };
      }

      const parentValue = prev[parentAttributeName];
      if (!parentValue) {
        return prev;
      }

      const childOption = variations[selectedAttrKey]?.find(
        (opt: VariationOption) => opt.value === selectedAttrValue,
      );
      if (childOption && (childOption.stock ?? 0) <= 0) {
        return prev;
      }

      return {
        ...prev,
        [selectedAttrKey]: selectedAttrValue,
      };
    });
  }

  // Tồn CÓ THỂ ĐẶT của lựa chọn hiện tại (variant đã chọn, fallback product)
  const selectedStock = useMemo(() => {
    if (selectedVariant) {
      return availableOf(selectedVariant as Record<string, unknown>);
    }
    if (variants.length === 0) {
      return availableOf(product as Record<string, unknown> | null);
    }
    return undefined;
  }, [selectedVariant, variants.length, product]);

  const qtyStep = 1;
  const qtyMin = 1;
  const qtyMax =
    selectedStock != null && selectedStock > 0 ? selectedStock : undefined;

  // Reset quantity về min khi đổi lựa chọn
  useEffect(() => {
    setQuantity(qtyMin);
  }, [selectedVariant, qtyMin]);

  const isColorVariant = (title: string) => {
    const t = title.toLowerCase();
    return t === "color" || t.includes("màu") || t === "colour";
  };

  function getColorwayImageUrlForCart(): string | undefined {
    const colorways = productWithVariants?.colorways ?? [];
    if (colorways.length === 0) return undefined;

    const colorKey =
      Object.keys(variations || {}).find(isColorVariant) ??
      allAttrNames.find(isColorVariant) ??
      Object.keys(attributes).find(isColorVariant);
    const activeColorValue = colorKey ? attributes[colorKey] : undefined;

    const colorway = activeColorValue?.trim()
      ? findColorwayByAttributeValue(colorways, activeColorValue)
      : null;
    if (!colorway) return undefined;

    const imgs = getProductImagesFromColorway(colorway);
    const first = imgs[0];
    if (!first) return undefined;
    const path = first.original || first.url || first.thumbnail;
    return path ? getImageUrl(path) : undefined;
  }

  // Giá hiển thị cho cart item (B2B vs retail) — giống generate-cart-item của DSC.
  function resolveDisplayPrice(): number {
    const p = product as
      | {
          product_price?: number;
          product_retail_price?: number;
          promotion_price?: number | null;
        }
      | null
      | undefined;
    if (!p) return 0;
    if (canWholeSalePrice) {
      return Number(p.promotion_price || p.product_price || 0);
    }
    const retail = Number(p.product_retail_price || 0);
    return retail > 0 ? retail : Number(p.product_price || 0);
  }

  // Add to cart — dùng useCartMutation của DSC (payload product_id/variant_id).
  function addToCart() {
    if (!isSelected || !product) return;

    setAddToCartLoader(true);
    setTimeout(() => setAddToCartLoader(false), 600);

    const sortedAttributes = sortAttributesByDisplayOrder(attributes);
    const colorwayImageUrl = getColorwayImageUrlForCart();

    const variantId =
      selectedVariant?.id != null
        ? Number(selectedVariant.id)
        : selectedVariant?.uuid != null
          ? Number(selectedVariant.uuid)
          : null;

    const item = {
      id: !Object.keys(sortedAttributes).length
        ? product.id
        : `${product.id}.${Object.values(sortedAttributes).join(".")}`,
      product_id: product.id,
      variant_id: Number.isFinite(variantId) ? variantId : null,
      name: product.name,
      slug: product.slug,
      sku: selectedVariant?.sku ?? (product as { sku?: string }).sku,
      image: colorwayImageUrl ?? (product as { image?: string }).image ?? "",
      price: resolveDisplayPrice(),
      attributes: sortedAttributes,
    };

    updateCart({ item, quantity });
  }

  return {
    allVariations,
    variations,
    selectedVariant,
    attributes,
    selectedParentVariant,
    parentAttributeName,
    childAttributeNames,
    isSelected,
    handleAttribute,

    selectedStock,

    quantity,
    setQuantity,
    qtyStep,
    qtyMin,
    qtyMax,

    addToCart,
    addToCartLoader,
  };
}
