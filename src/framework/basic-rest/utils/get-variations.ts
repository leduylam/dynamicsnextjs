import groupBy from "lodash/groupBy";

export function getVariations(variations: object | undefined) {
  if (!variations) return {};
  return groupBy(variations, "name");
}

export const mergeAttributes = (attributes: any[]) => {
  // Tạo 1 mảng mới đã sort, ưu tiên thằng còn hàng lên trước
  const sorted = [...attributes].sort((a, b) => {
    const aHasStock =
      a.sub_attribute?.some((sub: any) => Number(sub.quantity) > 0) ||
      Number(a.quantity) > 0;
    const bHasStock =
      b.sub_attribute?.some((sub: any) => Number(sub.quantity) > 0) ||
      Number(b.quantity) > 0;
    return Number(bHasStock) - Number(aHasStock); // true > false → thằng còn hàng lên trước
  });
  // Sau khi sort, tiến hành merge cha + con
  return sorted.flatMap((attribute) => [
    attribute,
    ...(attribute.sub_attribute ?? []),
  ]);
};
