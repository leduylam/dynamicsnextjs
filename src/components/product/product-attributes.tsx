import cn from "classnames";
import { getImageUrl } from "@utils/get-image-url";

export type ColorwayForAttribute = {
  value: string;
  image?: string | null;
  main_image?: string | null;
  images?: Array<{
    url?: string;
    thumbnail?: string;
    original?: string;
    is_main?: boolean;
  }>;
  is_new?: boolean;
};

interface Props {
  className?: string;
  title: string;
  attributes: {
    id: number;
    value: string;
    meta: string;
    isAvailable?: boolean;
    stock?: number;
  }[];
  active: string;
  onClick: (attribute: { name: string; value: string }) => void;
  /** Khi có, hiển thị ảnh colorway thay vì text/màu nền (khớp theo value) */
  colorways?: ColorwayForAttribute[];
}

function normalizeValue(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[\s/\\\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasImageData(cw: ColorwayForAttribute): boolean {
  return !!(cw.image || cw.main_image || (cw.images && cw.images.length > 0));
}

function findColorwayImage(
  colorways: ColorwayForAttribute[],
  value: string,
): string | null {
  const n = normalizeValue(value);
  const c = colorways.find((cw) => {
    if (!hasImageData(cw)) return false;
    const cwNorm = normalizeValue(cw.value);
    return cwNorm === n || cw.value.trim() === value.trim();
  });
  if (!c) return null;
  // Ưu tiên ảnh trong images[] (gallery thực tế); main_image/image chỉ là fallback.
  if (c.images?.length) {
    const mainImg = c.images.find((i) => i.is_main);
    const img = mainImg ?? c.images[0];
    return img.thumbnail ?? img.original ?? img.url ?? null;
  }
  if (c.main_image) return c.main_image;
  if (c.image) return c.image;
  return null;
}

const isColorVariant = (title: string) => {
  const t = title.toLowerCase();
  return t === "color" || t.includes("màu") || t === "colour";
};

export const ProductAttributes: React.FC<Props> = ({
  className = "mb-4",
  title,
  attributes,
  active,
  onClick,
  colorways = [],
}) => {
  const useColorwayImages =
    isColorVariant(title) && colorways && colorways.length > 0;

  const isOptionAvailable = ({
    isAvailable,
    stock,
  }: {
    isAvailable?: boolean;
    stock?: number;
  }): boolean => {
    const hasStock = stock !== undefined && stock > 0;
    return isAvailable !== undefined ? isAvailable : hasStock;
  };

  // Nhóm COLOR = mỗi color gom nhiều size → color nào hết sạch mọi size thì ẩn
  // hẳn color đó (ẩn "nhóm") cho gọn. Nhóm khác (size…) giữ nguyên option leaf,
  // chỉ hiển thị disabled/mờ khi hết. Stock của option color = max tồn qua các
  // size (buildVariantOptionsFromVariants) nên = 0 ⇔ color chết hoàn toàn.
  const visibleAttributes = isColorVariant(title)
    ? (attributes ?? []).filter(isOptionAvailable)
    : (attributes ?? []);

  if (visibleAttributes.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="text-base md:text-lg text-heading font-semibold mb-2.5 capitalize">
        {title}
        {active && (
          <>
            {": "}
            <span className="font-normal italic text-base">{active}</span>
          </>
        )}
      </h3>
      <ul className="flex flex-wrap colors ltr:-mr-3 rtl:-ml-3">
        {visibleAttributes.map(({ id, value, meta, isAvailable, stock }) => {
          const isDisabled = !isOptionAvailable({ isAvailable, stock });
          const imageUrl = useColorwayImages
            ? findColorwayImage(colorways, value)
            : null;
          const matchedColorway = useColorwayImages
            ? colorways.find(
                (cw) => normalizeValue(cw.value) === normalizeValue(value),
              )
            : null;
          const isNewColorway = matchedColorway?.is_new;
          return (
            <li
              key={`${value}-${id}`}
              className={cn(
                "relative rounded border min-w-9 md:min-w-11 h-9 md:h-11 px-2 md:px-3 mb-2 md:mb-3 ltr:mr-2 rtl:ml-2 ltr:md:mr-3 rtl:md:ml-3 flex justify-center items-center text-xs md:text-sm uppercase font-semibold transition duration-200 ease-in-out overflow-hidden",
                {
                  "cursor-pointer hover:border-black text-heading": !isDisabled,
                  "cursor-not-allowed opacity-50 bg-gray-100 border-gray-200 text-gray-500":
                    isDisabled,
                  "border-black": value === active && !isDisabled,
                  "border-gray-200": value !== active && !isDisabled,
                },
              )}
              onClick={() => {
                if (!isDisabled) {
                  onClick({ name: title, value: value });
                }
              }}
            >
              {isNewColorway && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] leading-3 rounded px-1 font-bold z-10">
                  New
                </span>
              )}
              {useColorwayImages && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(imageUrl)}
                  alt={value}
                  className="w-full h-full object-cover rounded"
                />
              ) : isColorVariant(title) && meta ? (
                <span
                  className="block w-full h-full rounded"
                  style={{ backgroundColor: meta }}
                />
              ) : (
                value
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
