import { useEffect, useMemo, useState, useCallback, memo } from "react";
import Button from "@components/ui/button";
import Counter from "@components/common/counter";
import { useRouter } from "next/router";
import usePrice from "@framework/product/use-price";
import { ProductAttributes } from "./product-attributes";
import type { ColorwayForAttribute } from "./product-attributes";
import Link from "@components/ui/link";
import Carousel from "@components/ui/carousel/carousel";
import { SwiperSlide } from "swiper/react";
import ProductMetaReview from "@components/product/product-meta-review";
import ProductDetailTab from "./product-detail-tab";
import Lightbox from "./lightbox/Lightbox";
import { motion } from "framer-motion";
import { useProductQuery } from "@framework/product/get-product";
import { useUI } from "@contexts/ui.context";
import { useAuth } from "@contexts/auth/auth-context";
import { number_format } from "src/helpers/my-helper";
import { sanitizeHtml } from "@utils/sanitize-html";
import { getImageUrl } from "@utils/get-image-url";
import { useSsrCompatible } from "@utils/use-ssr-compatible";
import { useWindowSize } from "@utils/use-window-size";
import { useProductDetail } from "@hooks/products/use-product-detail";
import { mapVariationAttributes } from "@utils/product-attribute-helpers";
import {
  getProductImages,
  getProductImagesFromColorway,
  findColorwayByAttributeValue,
  getAllProductGalleryImages,
} from "@utils/product-image-helpers";
import { ProductImage } from "@/types/product-image";

const productGalleryCarouselResponsive = {
  "768": {
    slidesPerView: 2,
  },
  "0": {
    slidesPerView: 1,
  },
};

const isColorVariant = (title: string) => {
  const t = title.toLowerCase();
  return t === "color" || t.includes("màu") || t === "colour";
};

const ProductSingleDetails = memo(({ slug }: { slug: string }) => {
  const { data, isLoading } = useProductQuery(slug);
  const router = useRouter();
  const { isAuthorized } = useUI();
  const { accessRights } = useAuth();
  const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });

  const canWholeSalePrice = useMemo(
    () => accessRights?.canWholeSalePrice ?? false,
    [accessRights?.canWholeSalePrice],
  );

  const { price, price_sale, percent } = usePrice(data);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const normalizedDescription = useMemo(() => {
    if (!data?.description || data.description === "undefined") return null;
    let desc = String(data.description).trim();
    desc = desc.replace(/\s+/g, " ");
    desc = desc.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const trimmed = desc.trim();
    if (trimmed.startsWith("<p>") && trimmed.endsWith("</p>")) {
      desc = trimmed.slice(3, -4).trim();
    }
    return desc;
  }, [data?.description]);

  const {
    allVariations,
    variations,
    selectedVariant,
    attributes,
    parentAttributeName,
    childAttributeNames,
    isSelected,
    handleAttribute,
    selectedStock,
    quantity,
    setQuantity,
    qtyStep,
    qtyMin,
    qtyMax,
    addToCart,
    addToCartLoader,
  } = useProductDetail({
    product: data,
    initialQueryParams: router.query,
  });

  // Sync URL ?color=xxx&size=xxx khi đổi lựa chọn
  const orderedAttrNames = useMemo(
    () =>
      parentAttributeName ? [parentAttributeName, ...childAttributeNames] : [],
    [parentAttributeName, childAttributeNames],
  );

  useEffect(() => {
    if (!router.isReady || !slug) return;
    const nextQuery: Record<string, string | string[] | undefined> = {
      ...router.query,
      slug,
    };
    delete nextQuery.variant;
    delete nextQuery.subVariant;
    for (const attrName of orderedAttrNames) {
      const key = attrName.toLowerCase().trim();
      if (attributes[attrName]) nextQuery[key] = attributes[attrName];
      else delete nextQuery[key];
    }
    const same = orderedAttrNames.every((attrName) => {
      const key = attrName.toLowerCase().trim();
      const raw = router.query[key];
      const cur = Array.isArray(raw) ? raw[0] : raw;
      const next = nextQuery[key];
      return String(cur ?? "") === String(next ?? "");
    });
    if (same) return;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes, slug, orderedAttrNames, router.isReady]);

  const colorways =
    (data as { colorways?: ColorwayForAttribute[] })?.colorways ?? [];
  const colorVariationKey = Object.keys(variations || {}).find(isColorVariant);
  const activeColorValue = colorVariationKey
    ? attributes?.[colorVariationKey]
    : undefined;

  // Colorway theo màu đã chọn → gallery ảnh đổi theo màu
  const activeColorway = useMemo(() => {
    if (colorways.length === 0 || !activeColorValue?.trim()) return null;
    return findColorwayByAttributeValue(colorways, activeColorValue);
  }, [colorways, activeColorValue]);

  const displayImages = useMemo(() => {
    const fromColorway = activeColorway
      ? getProductImagesFromColorway(activeColorway)
      : [];
    return fromColorway.length > 0
      ? fromColorway
      : getProductImages(
          data as Record<string, unknown> | null | undefined,
          selectedVariant as Record<string, unknown> | null,
        );
  }, [activeColorway, data, selectedVariant]);

  const selectedImage = displayImages[selectedImageIndex] || displayImages[0];

  const lightboxImages = useMemo(
    () =>
      getAllProductGalleryImages(
        data as Record<string, unknown> | null | undefined,
      ),
    [data],
  );
  const lightboxSlides =
    lightboxImages.length > 0 ? lightboxImages : displayImages;

  const lightboxUrls = useMemo(
    () =>
      lightboxSlides.map((img) =>
        getImageUrl(img.original || img.url || img.thumbnail),
      ),
    [lightboxSlides],
  );

  const openLightbox = useCallback(
    (displayIndex: number) => {
      const img = displayImages[displayIndex];
      let initial = 0;
      if (img && lightboxUrls.length > 0) {
        const u = getImageUrl(img.original || img.url || img.thumbnail);
        const li = lightboxUrls.indexOf(u);
        if (li >= 0) initial = li;
      }
      setSelectedImageIndex(initial);
      setLightboxOpen(true);
    },
    [displayImages, lightboxUrls],
  );

  // Reset gallery về ảnh đầu khi đổi màu
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [activeColorValue]);

  if (isLoading) return <p>Loading...</p>;

  const productSku = selectedVariant?.sku ?? (data as { sku?: string })?.sku;

  return (
    <>
      <div className="block lg:grid grid-cols-9 gap-x-10 xl:gap-x-14 pt-7 pb-10 lg:pb-14 2xl:pb-20 items-start">
        <div className="col-span-5 flex flex-col gap-2.5">
          {displayImages.length > 0 && (
            <>
              {width >= 1025 ? (
                <div className="relative overflow-hidden bg-gray-50 rounded-lg">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer outline-none rounded-lg"
                      onClick={() => openLightbox(selectedImageIndex)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLightbox(selectedImageIndex);
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={`main-${selectedImageIndex}-${selectedImage?.original || selectedImage?.url}`}
                        src={getImageUrl(
                          selectedImage?.thumbnail ||
                            selectedImage?.original ||
                            selectedImage?.url,
                        )}
                        alt={`${data?.name ?? ""}--${selectedImageIndex + 1}`}
                        className="w-full object-cover mix-blend-multiply pointer-events-none"
                      />
                    </div>
                  </motion.div>
                </div>
              ) : (
                <Carousel
                  pagination={{ clickable: true }}
                  breakpoints={productGalleryCarouselResponsive}
                  className="product-gallery"
                  buttonGroupClassName="hidden"
                >
                  {displayImages.map((item: ProductImage, index: number) => (
                    <SwiperSlide key={`product-gallery-key-${index}`}>
                      <div
                        role="button"
                        tabIndex={0}
                        className="col-span-1 transition duration-150 ease-in hover:opacity-90 cursor-pointer rounded-md"
                        onClick={() => openLightbox(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openLightbox(index);
                          }
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(
                            item?.thumbnail || item?.original || item?.url,
                          )}
                          alt={`${data?.name ?? ""}--${index + 1}`}
                          className="object-cover w-full mix-blend-multiply pointer-events-none"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Carousel>
              )}

              {displayImages.length > 1 && width >= 1025 && (
                <div className="grid grid-cols-5 gap-2.5">
                  {displayImages.map((item: ProductImage, index: number) => (
                    <div
                      key={`thumbnail-${index}`}
                      className={`transition duration-150 ease-in cursor-pointer border-2 bg-gray-50 rounded ${
                        selectedImageIndex === index
                          ? "border-black opacity-100"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(item?.thumbnail || item?.url)}
                        alt={`${data?.name ?? ""}--thumb-${index + 1}`}
                        className="object-cover w-full aspect-square mix-blend-multiply"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {lightboxOpen && (
            <Lightbox
              images={lightboxUrls}
              initialIndex={selectedImageIndex}
              onClose={() => setLightboxOpen(false)}
            />
          )}
        </div>

        <div className="col-span-4 pt-8 lg:pt-0">
          <div className="pb-7 mb-7 border-b border-gray-300">
            <h2 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold hover:text-black mb-3.5">
              {data?.name}
            </h2>
            {normalizedDescription && (
              <div
                className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(normalizedDescription),
                }}
                suppressHydrationWarning
              />
            )}
            {isAuthorized && (
              <div className="flex items-center justify-between mt-5">
                {canWholeSalePrice && (
                  <div>
                    {price_sale && (
                      <>
                        <span className="line-through font-segoe text-gray-400 text-sm md:text-base lg:text-base xl:text-lg ltr:pl-2 rtl:pr-2">
                          W/S: {price}
                        </span>
                        {percent && (
                          <span className="ml-2 bg-red-500 text-white text-10px md:text-xs leading-5 rounded-md inline-block px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1">
                            <p>
                              <span>-</span>
                              {percent}{" "}
                              <span className="hidden sm:inline">%</span>
                            </p>
                          </span>
                        )}
                      </>
                    )}
                    {price_sale ? (
                      <div className="text-red-500 font-bold text-base md:text-xl lg:text-lg 2xl:text-2xl ltr:pr-2 rtl:pl-2 ltr:md:pr-0 rtl:md:pl-0 ltr:lg:pr-2 rtl:lg:pl-2 ltr:2xl:pr-0 rtl:2xl:pl-0">
                        W/S: {number_format(price_sale)}{" "}
                        <span className="text-base italic">VND</span>
                      </div>
                    ) : (
                      <div className="text-red-500 font-bold text-base md:text-xl lg:text-lg 2xl:text-2xl ltr:pr-2 rtl:pl-2 ltr:md:pr-0 rtl:md:pl-0 ltr:lg:pr-2 rtl:lg:pl-2 ltr:2xl:pr-0 rtl:2xl:pl-0">
                        <span className="text-gray-600 font-semibold text-base md:text-xl lg:text-lg italic">
                          W/S:{" "}
                        </span>
                        {number_format(data?.product_price)}{" "}
                        <span className="text-base italic">VND</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-gray-600 font-semibold text-base md:text-xl lg:text-lg italic underline">
                  {canWholeSalePrice ? "Retail" : "Price"}:
                  <span className="ml-2">
                    {number_format(data?.product_retail_price)}{" "}
                  </span>
                  <span className="text-base">VND</span>
                </div>
              </div>
            )}
          </div>

          <div className="pb-3 border-b border-gray-300">
            {Object.keys(allVariations).map((variation) => {
              const filtered = variations[variation] ?? [];
              const variationOptions =
                filtered.length > 0
                  ? filtered
                  : (allVariations[variation] ?? []);
              if (variationOptions.length === 0) return null;

              const mappedAttributes = mapVariationAttributes(variationOptions);

              const productColorways = (
                data as { colorways?: ColorwayForAttribute[] }
              )?.colorways;
              const optionsForColorways =
                allVariations?.[variation] ?? variationOptions;
              const colorwaysForAttr =
                productColorways && productColorways.length > 0
                  ? productColorways
                  : isColorVariant(variation) && optionsForColorways.length > 0
                    ? optionsForColorways.map((opt) => ({
                        value: opt.value,
                        image: opt.variant?.image,
                        images: opt.variant?.images,
                      }))
                    : undefined;

              return (
                <ProductAttributes
                  key={variation}
                  title={variation}
                  attributes={mappedAttributes}
                  active={attributes[variation] ?? ""}
                  onClick={handleAttribute}
                  colorways={colorwaysForAttr}
                />
              );
            })}

            {isAuthorized &&
              selectedStock !== undefined &&
              (selectedStock <= 0 ? (
                <div className="text-red-600">Out of stock</div>
              ) : (
                <div>Quantity available: {selectedStock}</div>
              ))}
          </div>

          {isAuthorized && (
            <div className="flex items-center gap-x-4 ltr:md:pr-32 rtl:md:pl-32 ltr:lg:pr-12 rtl:lg:pl-12 ltr:2xl:pr-32 rtl:2xl:pl-32 ltr:3xl:pr-48 rtl:3xl:pl-48  border-b border-gray-300 py-8">
              <Counter
                quantity={quantity}
                onIncrement={() =>
                  setQuantity((prev) => {
                    const next = prev + qtyStep;
                    return qtyMax != null ? Math.min(qtyMax, next) : next;
                  })
                }
                onDecrement={() =>
                  setQuantity((prev) => Math.max(qtyMin, prev - qtyStep))
                }
                disableDecrement={quantity <= qtyMin}
                disableIncrement={qtyMax != null && quantity >= qtyMax}
              />
              <Button
                onClick={addToCart}
                variant="slim"
                className={`w-full md:w-6/12 xl:w-full ${
                  !isSelected && "bg-gray-400 hover:bg-gray-400"
                }`}
                disabled={
                  !isSelected ||
                  (selectedStock !== undefined && selectedStock <= 0)
                }
                loading={addToCartLoader}
              >
                <span className="py-2 3xl:px-8">Add to cart</span>
              </Button>
            </div>
          )}

          <div className="py-6">
            <ul className="text-sm space-y-5 pb-1">
              <li>
                <span className="font-semibold text-heading inline-block ltr:pr-2 rtl:pl-2">
                  SKU:
                </span>
                {productSku}
              </li>
              <li>
                <span className="font-semibold text-heading inline-block ltr:pr-2 rtl:pl-2">
                  Category:
                </span>
                {data?.product_categories?.map(
                  (category: {
                    id: number | string;
                    slug: string;
                    name: string;
                  }) => (
                    <Link
                      key={category.id}
                      href={"/categories/" + category.slug}
                      className="transition hover:underline hover:text-heading"
                    >
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 rounded-md font-bold">
                        {category.name}
                      </span>
                    </Link>
                  ),
                )}
              </li>
              {data?.tags && Array.isArray(data.tags) && (
                <li className="productTags">
                  <span className="font-semibold text-heading inline-block ltr:pr-2 rtl:pl-2">
                    Tags:
                  </span>
                  {data.tags.map(
                    (tag: {
                      id: string | number;
                      slug: string;
                      name: string;
                    }) => (
                      <Link
                        key={tag.id.toString()}
                        href={tag.slug}
                        className="inline-block ltr:pr-1.5 rtl:pl-1.5 transition hover:underline hover:text-heading ltr:last:pr-0 rtl:last:pl-0"
                      >
                        {tag.name}
                        <span className="text-heading">,</span>
                      </Link>
                    ),
                  )}
                </li>
              )}
            </ul>
          </div>

          <ProductMetaReview data={data} />
        </div>
      </div>
      <ProductDetailTab data={data} />
    </>
  );
});

ProductSingleDetails.displayName = "ProductSingleDetails";

export default ProductSingleDetails;
