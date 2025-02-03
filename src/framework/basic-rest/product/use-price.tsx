import { useMemo } from "react";
import { number_format } from "src/helpers/my-helper";
interface WholesalePriceResult {
  price: string;
  price_sale: string | null;
  percent: number | null;
}
export function formatPrice({
  amount,
  currencyCode,
  locale,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  });

  return formatCurrency.format(amount);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
}: {
  baseAmount: number;
  amount: number;
  currencyCode: string;
  locale: string;
}) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: "percent" });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale })
    : null;

  return { price, basePrice, discount };
}

function calculatePromotionPrice(
  price: number,
  discountType: "percent" | "amount",
  discountValue: number
): number {
  return discountType === "percent"
    ? price - (price * discountValue) / 100
    : price - discountValue;
}

export default function usePrice(
  data: any
) {
  const result: WholesalePriceResult = useMemo(() => {
    if (!data) {
      return { price: "0", price_sale: null, percent: null };
    }

    const { product_price, promotions, promotion_price } = data;
    let price_sale = null;
    let percent = null;

    // Tính giá khuyến mãi
    if (promotions && promotions.discount_value > 0) {
      percent =
        promotions.discount_type === "percent"
          ? promotions.discount_value
          : Math.round((promotions.discount_value / product_price) * 100);

      price_sale = calculatePromotionPrice(
        product_price,
        promotions.discount_type,
        promotions.discount_value
      );
    } else if (promotion_price && promotion_price > 0) {
      price_sale = promotion_price;
    }

    return {
      price: number_format(product_price),
      price_sale: price_sale ? number_format(price_sale) : null,
      percent,
    };
  }, [data]);
  return result
}
