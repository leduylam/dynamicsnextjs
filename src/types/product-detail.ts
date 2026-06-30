import { Product } from "@framework/types";

export interface ProductVariant {
  id?: number | string;
  uuid?: string;
  name?: string;
  sku?: string;
  stock?: number;
  /** Tồn CÓ THỂ ĐẶT (= stock − giữ chỗ). Storefront dùng số này cho sellability. */
  available_stock?: number;
  attributes?: Record<string, string>;
  variant_attribute_values?: Array<{
    attribute_name?: string;
    attribute_slug?: string;
    attribute_value?: string;
    attribute_id?: number | null;
    attribute_value_id?: number | null;
    sort_order?: number;
  }>;
  image?: string | null;
  images?: Array<{
    url?: string;
    thumbnail?: string;
    original?: string;
  }>;
  [key: string]: unknown;
}

export interface VariationOption {
  id: number | string;
  value: string;
  meta?: string;
  attribute: {
    slug: string;
    name: string;
  };
  variant?: ProductVariant;
  /** Tồn CÓ THỂ ĐẶT max của value này (build-variant-options ưu tiên available_stock). */
  stock?: number;
  isAvailable?: boolean;
}

export interface UseProductDetailOptions {
  product: Product | null | undefined;
  /** Query params từ URL (?color=xxx&size=xxx) để init attributes. */
  initialQueryParams?: Record<string, string | string[] | undefined>;
}

export interface UseProductDetailReturn {
  // Variants
  allVariations: Record<string, VariationOption[]>;
  variations: Record<string, VariationOption[]>;
  selectedVariant: ProductVariant | null;
  attributes: Record<string, string>;
  selectedParentVariant: string | null;
  parentAttributeName: string | null;
  childAttributeNames: string[];
  isSelected: boolean;
  handleAttribute: (attribute: { name: string; value: string }) => void;

  // Stock (CÓ THỂ ĐẶT) của lựa chọn hiện tại
  selectedStock: number | undefined;

  // Quantity
  quantity: number;
  setQuantity: (quantity: number | ((prev: number) => number)) => void;
  qtyStep: number;
  qtyMin: number;
  qtyMax: number | undefined;

  // Cart
  addToCart: () => void;
  addToCartLoader: boolean;
}
