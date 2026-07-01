import { Attachment } from "@framework/types";
import { ProductImage } from "@/types/product-image";
import { getImageUrl } from "@utils/get-image-url";

export type ColorwayForImages = {
  value: string;
  image?: string | null;
  main_image?: string | null;
  images?: Array<{
    url?: string;
    thumbnail?: string;
    original?: string;
    is_main?: boolean;
  }>;
};

type ImageLike =
  | string
  | { url?: string; thumbnail?: string; original?: string }
  | null
  | undefined;

type ProductLike = {
  colorways?: ColorwayForImages[];
  variants?: Array<Record<string, unknown>>;
  images?: ImageLike[];
  gallery?: ImageLike[];
  image?: ImageLike;
  [key: string]: unknown;
};

function normalizeAttributeValue(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[\s/\\\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function colorwayHasImageData(cw: ColorwayForImages): boolean {
  return !!(cw.image || cw.main_image || (cw.images && cw.images.length > 0));
}

/**
 * Tìm colorway khớp với giá trị attribute (màu) đã chọn. Dùng chung logic với
 * product-attributes để ảnh đổi theo màu.
 */
export function findColorwayByAttributeValue(
  colorways: ColorwayForImages[],
  attributeValue: string,
): ColorwayForImages | null {
  if (!colorways?.length || !attributeValue?.trim()) return null;
  const n = normalizeAttributeValue(attributeValue);
  const c = colorways.find((cw) => {
    if (!colorwayHasImageData(cw)) return false;
    const cwNorm = normalizeAttributeValue(cw.value);
    return cwNorm === n || cw.value.trim() === attributeValue.trim();
  });
  return c ?? null;
}

/**
 * Lấy toàn bộ ảnh từ một colorway: main_image/image chính + mảng images, chuẩn
 * hóa thành ProductImage[]. Luôn ưu tiên main_image theo từng màu (giống admin).
 */
export function getProductImagesFromColorway(
  colorway: ColorwayForImages,
): ProductImage[] {
  const list: ProductImage[] = [];
  const seen = new Set<string>();

  const push = (path: string | undefined | null) => {
    if (!path) return;
    const url = getImageUrl(path);
    if (url && !seen.has(url)) {
      seen.add(url);
      list.push({ url, thumbnail: url, original: url });
    }
  };

  if (colorway.images?.length) {
    const mainImg = colorway.images.find((i) => i.is_main);
    const ordered = mainImg
      ? [mainImg, ...colorway.images.filter((i) => i !== mainImg)]
      : colorway.images;
    ordered.forEach((img) => {
      push(img.thumbnail ?? img.original ?? img.url);
    });
    return list;
  }

  // Fallback cho dữ liệu cũ không có images[]: chỉ dùng main_image/image khi gallery rỗng.
  const mainPath = colorway.main_image ?? colorway.image;
  push(mainPath);
  return list;
}

/** Màu (chuẩn hoá) CÒN HÀNG, suy từ variants đã có sẵn trong response list.
 *  variant.name dạng "Color / Size" → màu = phần trước dấu "/". */
function inStockColorSet(
  variants: Array<Record<string, unknown>> | undefined,
): Set<string> {
  const set = new Set<string>();
  for (const v of variants ?? []) {
    const stock = Number(
      (v?.available_stock as number | undefined) ??
        (v?.stock as number | undefined) ??
        0,
    );
    if (stock > 0) {
      const norm = normalizeAttributeValue(String(v?.name ?? "").split("/")[0]);
      if (norm) set.add(norm);
    }
  }
  return set;
}

/**
 * Lọc colorways theo MÀU CÒN HÀNG (suy từ variants — giống cách single/popup lọc
 * OOS). Không suy được tồn (thiếu variant name/stock) → giữ nguyên để không ẩn nhầm.
 */
export function getInStockColorways<T extends { value?: string | null }>(
  colorways: T[] | undefined,
  variants: Array<Record<string, unknown>> | undefined,
): T[] {
  const list = colorways ?? [];
  if (!list.length) return list;
  const inStock = inStockColorSet(variants);
  if (inStock.size === 0) return list;
  return list.filter((cw) =>
    inStock.has(normalizeAttributeValue(String(cw?.value ?? ""))),
  );
}

/**
 * Ảnh đại diện product-card = ảnh của colorway MÀU CÒN HÀNG đầu tiên (tránh
 * colorway hết hàng vốn hay trỏ ảnh cũ/đã xoá → vỡ ảnh trên grid). null nếu không có.
 */
export function getFirstInStockColorwayImage(
  colorways: ColorwayForImages[] | undefined,
  variants: Array<Record<string, unknown>> | undefined,
): string | null {
  for (const cw of getInStockColorways(colorways, variants)) {
    const first = getProductImagesFromColorway(cw)[0];
    const raw = first?.original || first?.url || first?.thumbnail;
    if (raw) return raw;
  }
  return null;
}

/**
 * Convert image to ProductImage format
 */
function convertToProductImage(
  img: ImageLike | Attachment,
): ProductImage | null {
  if (!img) return null;

  if (typeof img === "string") {
    return { url: img, thumbnail: img, original: img };
  }

  const o = img as { url?: string; thumbnail?: string; original?: string };
  const original = o.original || o.thumbnail || o.url || "";
  const thumbnail = o.thumbnail || o.original || o.url || "";
  const url = o.url || o.original || o.thumbnail || "";

  return { url, thumbnail, original };
}

/**
 * Toàn bộ ảnh của sản phẩm (mọi colorway + ảnh cấp product + từng variant nếu có),
 * không trùng URL. Dùng cho lightbox xem lần lượt mọi ảnh.
 */
export function getAllProductGalleryImages(
  product: ProductLike | null | undefined,
): ProductImage[] {
  if (!product) return [];

  const images: ProductImage[] = [];
  const seenUrls = new Set<string>();

  const push = (img: ProductImage) => {
    const raw = img.original || img.url || img.thumbnail;
    const u = getImageUrl(raw);
    if (!u || seenUrls.has(u)) return;
    seenUrls.add(u);
    images.push({
      url: img.url || u,
      thumbnail: img.thumbnail || u,
      original: img.original || u,
    });
  };

  const colorways = (product.colorways ?? []) as ColorwayForImages[];
  for (const cw of colorways) {
    getProductImagesFromColorway(cw).forEach(push);
  }

  getProductImages(product, null).forEach(push);

  const variants = product.variants;
  if (Array.isArray(variants)) {
    const base: ProductLike = {
      ...product,
      images: undefined,
      gallery: undefined,
      image: undefined,
    };
    for (const v of variants) {
      getProductImages(base, v).forEach(push);
    }
  }

  return images;
}

export function getProductImages(
  product: ProductLike | null | undefined,
  selectedVariant: Record<string, unknown> | null | undefined,
): ProductImage[] {
  const images: ProductImage[] = [];
  const seenUrls = new Set<string>();

  const addImage = (img: ImageLike | Attachment) => {
    const imageObj = convertToProductImage(img);
    if (!imageObj) return;

    const imageUrl = imageObj.url || imageObj.thumbnail || imageObj.original;
    if (imageUrl && !seenUrls.has(imageUrl)) {
      seenUrls.add(imageUrl);
      images.push(imageObj);
    }
  };

  // Priority 1: Selected variant images
  if (selectedVariant) {
    const variantImages = selectedVariant.images as ImageLike[] | undefined;
    if (Array.isArray(variantImages) && variantImages.length > 0) {
      variantImages.forEach(addImage);
      return images;
    }

    const variantImage = selectedVariant.image as ImageLike;
    if (variantImage) {
      addImage(variantImage);
      return images;
    }
  }

  // Priority 2: Product images
  if (Array.isArray(product?.images) && product.images.length > 0) {
    product.images.forEach(addImage);
    return images;
  }

  // Priority 3: Product gallery
  if (Array.isArray(product?.gallery) && product.gallery.length > 0) {
    product.gallery.forEach(addImage);
    return images;
  }

  // Priority 4: Single product image
  if (product?.image) {
    addImage(product.image);
    return images;
  }

  return images;
}
