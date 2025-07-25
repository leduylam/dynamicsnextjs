const sizeMap: Record<string, string | null> = {
  original: null, // sẽ không thêm hậu tố
  tiny: "165x165",
  small: "360x360",
  medium: "720x720",
};

export function getBestImage(
  image: any,
  size: "tiny" | "small" | "medium" | "original" = "medium"
): string | null {
  if (!image) return null;
  if (typeof image === "string") return handleImageHover(image, size);
  if (typeof image === "object" && image[size]) return image[size];
  if (typeof image === "object" && image.original)
    return handleImageHover(image.original, size);
  return null;
}

export function getAllImageSizes(image: any): Record<string, string> {
  const sizes = ["tiny", "small", "medium", "original"];
  const result: Record<string, string> = {};
  for (const size of sizes) {
    let url = "";
    if (typeof image === "string") {
      url =
        size === "original"
          ? image // ❌ không xử lý original
          : handleImageHover(image, size);
    } else if (typeof image === "object") {
      url = image?.[size] || "";
      // Nếu không có size cụ thể mà có original, thì xử lý từ original (trừ original ra)
      if (!url && image?.original && size !== "original") {
        url = handleImageHover(image.original, size);
      }
    }
    if (url) {
      result[size] = url;
    }
  }
  return result;
}
export const handleImageHover = (
  url: string,
  targetSize: keyof typeof sizeMap = "medium"
): string => {
  if (!url) return "";
  const sizePattern = /_(\d+x\d+)(\.(jpg|jpeg|png|webp|gif))$/i;
  const labelPattern =
    /_(tiny|small|medium|large|original)(\.(jpg|jpeg|png|webp|gif))$/i;
  const fileExt = /\.(jpg|jpeg|png|webp|gif)$/i;
  let updated = url;
  // ✅ Đổi folder nếu có /tiny/ → /medium/
  updated = updated.replace(
    /\/(tiny|small|medium|large|original)\//,
    `/${targetSize}/`
  );
  // ✅ Nếu là dạng _180x180.jpg → đổi thành _720x720.jpg
  if (sizePattern.test(updated)) {
    updated = updated.replace(sizePattern, `_${sizeMap[targetSize]}$2`);
    return updated;
  }
  // ✅ Nếu là dạng _tiny.jpg → _medium.jpg
  updated = updated.replace(labelPattern, `_${targetSize}$2`);
  // ✅ Nếu chưa có hậu tố gì → thêm vào trước .jpg
  const hasSuffix = labelPattern;
  if (!hasSuffix.test(updated)) {
    updated = updated.replace(fileExt, `_${targetSize}$&`);
  }
  return updated;
};
