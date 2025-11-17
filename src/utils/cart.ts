import { generateCartItem } from "@utils/generate-cart-item";

export const buildCartItemWithPrice = (
  product: any,
  attributes: Record<string, string>,
  activeState?: number | null,
  subActive?: number | null,
  canWholeSalePrice?: boolean
) => {
  const normalizedActiveState =
    activeState === null || activeState === undefined
      ? undefined
      : activeState;
  const normalizedSubActive =
    subActive === null || subActive === undefined ? undefined : subActive;
  const normalizedWholesale = Boolean(canWholeSalePrice);
  const cartItem = generateCartItem(
    product,
    attributes,
    normalizedActiveState,
    normalizedSubActive,
    normalizedWholesale
  );

  return {
    ...cartItem,
    price: cartItem?.price ?? 0,
  };
};

export default buildCartItemWithPrice;

