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

  const subAttribute = attribute?.sub_attributes.find(
    (subAttr: any) => subAttr.id === subActive
  );
  const itemSku = subAttribute
    ? subAttribute.product_attribute_sku
    : attribute.product_attribute_sku;
  // const detailSku = attribute ? attribute.product_detail_sku : "";
  const image = attribute.image ?? item.image;

  const promotion_price = item.promotions
    ? item?.product_price! - item.promotions.discount
    : null;
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
    price: canWholeSalePrice
      ? promotion_price
        ? promotion_price
        : product_price
      : product_retail_price,
    attributes,
  };
}
