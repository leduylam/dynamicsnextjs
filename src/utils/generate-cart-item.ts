import { isEmpty } from "lodash";

interface Item {
  id: string | number;
  name: string;
  slug: string;
  sku?: string;
  product_id?: string;
  attributes?: any;
  album?: Array<{ tiny: string; [key: string]: unknown }>;
  promotions?: {
    discount: number;
  };
  price?: number;
  product_price?: number;
  product_retail_price?: number;
  price_sale?: number;
  quantity?: number;
  [key: string]: unknown;
}

/**
 * Extract first image from gallery array
 * Gallery can be array of objects with image_path, url, original properties, or array of strings
 */
function getFirstImageFromGallery(gallery: any): string | null {
  if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
    return null;
  }
  const firstItem = gallery[0];
  if (typeof firstItem === "string") {
    return firstItem;
  }
  if (typeof firstItem === "object" && firstItem !== null) {
    return (
      firstItem.image_path ||
      firstItem.url ||
      firstItem.original ||
      firstItem.image ||
      null
    );
  }
  return null;
}

/**
 * Get image with priority: variant/sub-variant image/gallery > product image/gallery
 */
function getImage(
  subAttribute: any,
  attribute: any,
  item: Item
): string | undefined {
  // Priority 1: subAttribute image or gallery[0]
  if (subAttribute) {
    if (subAttribute.image && typeof subAttribute.image === "string") {
      return subAttribute.image;
    }
    const subGalleryImage = getFirstImageFromGallery(subAttribute.gallery);
    if (subGalleryImage) {
      return subGalleryImage;
    }
  }

  // Priority 2: attribute image or gallery[0]
  if (attribute) {
    if (attribute.image && typeof attribute.image === "string") {
      return attribute.image;
    }
    const attrGalleryImage = getFirstImageFromGallery(attribute.gallery);
    if (attrGalleryImage) {
      return attrGalleryImage;
    }
  }

  // Priority 3: product image or gallery[0]
  if (item.image && typeof item.image === "string") {
    return item.image;
  }
  const productGalleryImage = getFirstImageFromGallery(item.gallery);
  if (productGalleryImage) {
    return productGalleryImage;
  }

  return undefined;
}

export function generateCartItem(
  item: Item,
  attributes: Record<string, string>,
  activeState: number | undefined,
  subActive: number | undefined,
  canWholeSalePrice: boolean
) {
  const { id, name, slug, product_price, product_retail_price } = item;
  const attribute = item.attributes?.find(
    (attr: any) => attr.id === activeState
  );

  const subAttribute = attribute?.sub_attributes?.find(
    (subAttr: any) => subAttr.id === subActive
  );
  const itemSku = subAttribute
    ? subAttribute.product_attribute_sku
    : attribute?.product_attribute_sku;
  // const detailSku = attribute ? attribute.product_detail_sku : "";
  const image = getImage(subAttribute, attribute, item);

  const promotion_price = item.promotions
    ? item?.product_price! - item.promotions.discount
    : null;
  
  // Calculate price với fallback logic
  let finalPrice: number | undefined;
  if (canWholeSalePrice) {
    // User có quyền xem giá sỉ
    finalPrice = promotion_price || product_price;
  } else {
    // User không có quyền, dùng giá lẻ
    finalPrice = product_retail_price;
    // Fallback: nếu product_retail_price = 0/null, dùng product_price
    if (!finalPrice || finalPrice === 0) {
      finalPrice = product_price;
    }
  }

  
  return {
    id: !isEmpty(attributes)
      ? `${id}.${Object.values(attributes).join(".")}`
      : id,
    name,
    product_id: id,
    slug,
    product_price,
    product_retail_price,
    sku: itemSku,
    image: image,
    price: finalPrice,
    attributes,
  };
}
