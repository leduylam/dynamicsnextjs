import { VariationOption } from "@/types/product-detail";
import { MappedAttribute } from "@/types/product-attribute";

/**
 * Map variation options to ProductAttributes format
 */
export function mapVariationAttributes(
  variationOptions: VariationOption[],
): MappedAttribute[] {
  return variationOptions.map((attr: VariationOption) => {
    const stock = attr.stock ?? 0;
    const isAvailable =
      attr.isAvailable !== undefined ? attr.isAvailable : stock > 0;

    return {
      id:
        typeof attr.id === "number"
          ? attr.id
          : Number(attr.id) || Math.floor(Math.random() * 1000000),
      value: attr.value,
      meta: attr.meta || "",
      stock: stock,
      isAvailable: isAvailable,
    };
  });
}
