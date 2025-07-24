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
  targetSize: string = "medium"
): string => {
  if (!url) return "";
  let updated = url.replace(
    /\/(tiny|small|medium|large|original)\//,
    `/${targetSize}/`
  );
  updated = updated.replace(
    /_(tiny|small|medium|large|original)(\.(jpg|jpeg|png|webp|gif))$/i,
    `_${targetSize}$2`
  );
  const hasSuffix =
    /_(tiny|small|medium|large|original)\.(jpg|jpeg|png|webp|gif)$/i;
  const fileExt = /\.(jpg|jpeg|png|webp|gif)$/i;
  if (!hasSuffix.test(updated)) {
    updated = updated.replace(fileExt, `_${targetSize}$&`);
  }
  return updated;
};
