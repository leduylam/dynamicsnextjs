import { useCallback, useEffect, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import {
  getVariations,
  mergeAttributes,
} from "@framework/utils/get-variations";
import {
  calculateTotalQuantity,
  cleanSku,
} from "src/helpers/my-helper";

type Attribute = {
  id: number;
  name: string;
  value: string;
  quantity?: number;
  parent_id?: number;
  image?: { [key: string]: any } | string;
  gallery?: any;
  album?: any;
  sub_attributes?: Attribute[];
  product_attribute_sku?: string;
  [key: string]: any;
};

type Product = {
  id?: number | string;
  slug?: string;
  attributes?: Attribute[];
  [key: string]: any;
};

interface UseProductVariantOptions {
  onVariantChange?: (variantId?: number) => void;
}

export interface UseProductVariantReturn {
  variations: Record<string, Attribute[]>;
  attributes: Record<string, string>;
  isSelected: boolean;
  activeState: number | null;
  subActive: number | null;
  chooseQuantity: number | null;
  activeAttributes: Attribute | null;
  productSku?: string;
  productQuantity: number;
  handleAttributeParent: (
    attribute: Record<string, string>,
    attributeId: number
  ) => void;
  handleAttributeChildren: (
    attribute: Record<string, string>,
    attributeId: number
  ) => void;
  selectVariantById: (attributeId: number | null) => void;
  selectSubVariantById: (attributeId: number | null) => void;
  selectFirstAvailable: () => void;
  setAttributesMap: (map: Record<string, string>) => void;
  resetSelection: () => void;
}

export const useProductVariant = (
  product?: Product,
  options?: UseProductVariantOptions
): UseProductVariantReturn => {
  const onVariantChange = options?.onVariantChange;

  const productAttributes = useMemo(
    () => (Array.isArray(product?.attributes) ? product?.attributes : []),
    [product?.attributes]
  );

  const allAttributes = useMemo(
    () => mergeAttributes(productAttributes),
    [productAttributes]
  );

  const [attributes, setAttributesState] = useState<Record<string, string>>({});
  const [activeState, setActiveState] = useState<number | null>(null);
  const [subActive, setSubActive] = useState<number | null>(null);
  const [chooseQuantity, setChooseQuantity] = useState<number | null>(null);

  useEffect(() => {
    setAttributesState({});
    setActiveState(null);
    setSubActive(null);
    setChooseQuantity(null);
  }, [product?.id, product?.slug]);

  const variations = useMemo(
    () => getVariations(allAttributes),
    [allAttributes]
  );

  const isSelected = useMemo(() => {
    if (isEmpty(variations)) {
      return true;
    }
    if (isEmpty(attributes)) {
      return false;
    }
    return Object.keys(variations).every((variation) =>
      Object.prototype.hasOwnProperty.call(attributes, variation)
    );
  }, [variations, attributes]);

  const activeAttributes = useMemo(() => {
    if (!activeState) return null;
    return (
      productAttributes.find((attr) => attr.id === activeState) ?? null
    );
  }, [productAttributes, activeState]);

  const productSku = useMemo(() => {
    if (!activeAttributes) return undefined;
    if (
      Array.isArray(activeAttributes.sub_attributes) &&
      activeAttributes.sub_attributes.length > 0
    ) {
      const firstSubAttributeSku =
        activeAttributes.sub_attributes[0]?.product_attribute_sku;
      return firstSubAttributeSku
        ? cleanSku(firstSubAttributeSku)
        : undefined;
    }
    return activeAttributes.product_attribute_sku;
  }, [activeAttributes]);

  const productQuantity = useMemo(() => {
    if (!activeAttributes) return 0;
    return calculateTotalQuantity(activeAttributes);
  }, [activeAttributes]);

  const normalizeQuantity = useCallback((value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed =
      typeof value === "number" ? value : Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }, []);

  const notifyVariantChange = useCallback(
    (variantId?: number) => {
      if (onVariantChange) {
        onVariantChange(variantId);
      }
    },
    [onVariantChange]
  );

  const setAttributesMap = useCallback((map: Record<string, string>) => {
    setAttributesState(map);
  }, []);

  const handleAttributeParent = useCallback(
    (attribute: Record<string, string>, attributeId: number) => {
      const quantities = allAttributes?.find(
        (attr: Attribute) => attr.id === attributeId
      );
      setAttributesState((prev) => {
        const next = {
          ...prev,
          ...attribute,
        };
        if (Array.isArray(quantities?.sub_attributes)) {
          quantities?.sub_attributes.forEach((sub: Attribute) => {
            if (
              sub?.name &&
              Object.prototype.hasOwnProperty.call(next, sub.name)
            ) {
              delete next[sub.name];
            }
          });
        }
        return next;
      });
      if (attributeId) {
        setChooseQuantity(normalizeQuantity(quantities?.quantity));
        setActiveState(attributeId);
        setSubActive(null);
        notifyVariantChange(attributeId);
      }
    },
    [allAttributes, notifyVariantChange, normalizeQuantity]
  );

  const handleAttributeChildren = useCallback(
    (attribute: Record<string, string>, attributeId: number) => {
      const quantities = allAttributes?.find(
        (attr: Attribute) => attr.id === attributeId
      );
      setAttributesState((prev) => ({
        ...prev,
        ...attribute,
      }));
      if (attributeId) {
        setChooseQuantity(normalizeQuantity(quantities?.quantity));
        setSubActive(attributeId);
      }
    },
    [allAttributes, normalizeQuantity]
  );

  const selectVariantById = useCallback(
    (attributeId: number | null) => {
      if (attributeId === null) {
        setActiveState(null);
        setSubActive(null);
        setChooseQuantity(null);
        notifyVariantChange(undefined);
        return;
      }

      const attributeItem = productAttributes.find(
        (attr) => attr.id === attributeId
      );
      if (!attributeItem) return;

      handleAttributeParent(
        { [attributeItem.name]: attributeItem.value },
        attributeId
      );
    },
    [productAttributes, handleAttributeParent, notifyVariantChange]
  );

  const selectSubVariantById = useCallback(
    (attributeId: number | null) => {
      if (attributeId === null) {
        setSubActive(null);
        setChooseQuantity(null);
        return;
      }
      const attributeItem = allAttributes.find(
        (attr: Attribute) => attr.id === attributeId
      );
      if (!attributeItem) return;
      handleAttributeChildren(
        { [attributeItem.name]: attributeItem.value },
        attributeId
      );
    },
    [allAttributes, handleAttributeChildren]
  );

  const selectFirstAvailable = useCallback(() => {
    if (!productAttributes.length) return;
    const firstAvailable =
      productAttributes.find((attr) => {
        const subAttributes = Array.isArray(attr.sub_attributes)
          ? attr.sub_attributes
          : [];
        if (subAttributes.length > 0) {
          return subAttributes.some(
            (sub: Attribute) => Number(sub.quantity) > 0
          );
        }
        return Number(attr.quantity) > 0;
      }) ?? productAttributes[0];

    handleAttributeParent(
      { [firstAvailable.name]: firstAvailable.value },
      firstAvailable.id
    );
  }, [productAttributes, handleAttributeParent]);

  const resetSelection = useCallback(() => {
    setAttributesState({});
    setActiveState(null);
    setSubActive(null);
    setChooseQuantity(null);
    notifyVariantChange(undefined);
  }, [notifyVariantChange]);

  return {
    variations,
    attributes,
    isSelected,
    activeState,
    subActive,
    chooseQuantity,
    activeAttributes,
    productSku,
    productQuantity,
    handleAttributeParent,
    handleAttributeChildren,
    selectVariantById,
    selectSubVariantById,
    selectFirstAvailable,
    setAttributesMap,
    resetSelection,
  };
};

export default useProductVariant;

