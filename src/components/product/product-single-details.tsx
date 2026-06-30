import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import Button from "@components/ui/button";
import Counter from "@components/common/counter";
import { useRouter } from "next/router";
import usePrice from "@framework/product/use-price";
import { ProductAttributes } from "./product-attributes";
import Link from "@components/ui/link";
import Carousel from "@components/ui/carousel/carousel";
import { SwiperSlide } from "swiper/react";
import ProductMetaReview from "@components/product/product-meta-review";
import { useUI } from "@contexts/ui.context";
import { number_format } from "src/helpers/my-helper";
import { useCartMutation } from "@framework/carts/use-cart";
import ProductDetailTab from "./product-detail-tab";
import { useAuth } from "@contexts/auth/auth-context";
import Lightbox from "./lightbox/Lightbox";
import { motion } from "framer-motion";
import { useProductQuery } from "@framework/product/get-product";
import { getAllImageSizes } from "@utils/use-image";
import useProductVariant from "./hooks/use-product-variant";
import { buildCartItemWithPrice } from "@utils/cart";
import { sanitizeHtml } from "@utils/sanitize-html";
import useQuantityInput from "./hooks/use-quantity-input";
import Image from "next/image";

const productGalleryCarouselResponsive = {
  "768": {
    slidesPerView: 2,
  },
  "0": {
    slidesPerView: 1,
  },
};

const parseAlbum = (album: any): any[] => {
  if (!album) return [];
  if (typeof album === "string") {
    try {
      return JSON.parse(album);
    } catch {
      return [];
    }
  }
  return album;
};

const fromGallery = (g: any): string[] =>
  Array.isArray(g)
    ? g
        .map((x: any) => x?.image_path || x?.url || x?.original || x)
        .filter((u: any) => typeof u === "string" && !!u)
    : [];

const fromAlbum = (a: any): string[] =>
  Array.isArray(a) ? parseAlbum(a) : a ? parseAlbum(a) : [];

const uniq = (arr: string[]) => Array.from(new Set(arr));

const ProductSingleDetails = memo(({ slug }: { slug: string }) => {
  const { data, isLoading } = useProductQuery(slug);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { accessRights } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const canWholeSalePrice = useMemo(() => {
    return accessRights?.canWholeSalePrice ?? false;
  }, [accessRights?.canWholeSalePrice]);
  const { isAuthorized } = useUI();

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
  const { mutate: updateCart } = useCartMutation();
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const { price, price_sale, percent } = usePrice(data);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }, []);

  const {
    variations,
    attributes,
    isSelected,
    activeState,
    subActive,
    chooseQuantity,
    activeAttributes,
    productSku,
    productQuantity,
    handleAttributeParent,
    handleAttributeChildren,
    selectVariantById,
    selectSubVariantById,
    setAttributesMap,
  } = useProductVariant(data);

  const availableQuantity = useMemo(() => {
    const parsedChoose =
      typeof chooseQuantity === "number"
        ? chooseQuantity
        : Number(chooseQuantity);
    if (Number.isFinite(parsedChoose) && parsedChoose > 0) {
      return parsedChoose;
    }
    const parsedProduct =
      typeof productQuantity === "number"
        ? productQuantity
        : Number(productQuantity);
    return Number.isFinite(parsedProduct) && parsedProduct > 0
      ? parsedProduct
      : undefined;
  }, [chooseQuantity, productQuantity]);

  const {
    quantity,
    inputValue,
    increment,
    decrement,
    handleInputChange,
    handleInputBlur,
    disableDecrement,
    disableIncrement,
  } = useQuantityInput({
    initial: 1,
    min: 1,
    max: availableQuantity,
  });

  const normalizedVariantParam = useMemo(() => {
    if (!router.isReady) return undefined;
    const variantParam = router.query["variant"];
    return Array.isArray(variantParam) ? variantParam[0] : variantParam;
  }, [router.isReady, router.query.variant]);

  const normalizedSubVariantParam = useMemo(() => {
    if (!router.isReady) return undefined;
    const subVariantParam = router.query["subVariant"];
    return Array.isArray(subVariantParam)
      ? subVariantParam[0]
      : subVariantParam;
  }, [router.isReady, router.query.subVariant]);

  const variantParamRef = useRef<string | undefined>(undefined);
  const hasInitializedVariantRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;

    if (
      !data ||
      !Array.isArray(data.attributes) ||
      data.attributes.length === 0
    )
      return;

    if (normalizedVariantParam) {
      if (variantParamRef.current === normalizedVariantParam) {
        return;
      }
      variantParamRef.current = normalizedVariantParam;
      const variantId = Number(normalizedVariantParam);
      if (!Number.isNaN(variantId)) {
        selectVariantById(variantId);
        hasInitializedVariantRef.current = true;
      }
      return;
    }

    variantParamRef.current = undefined;

    if (!hasInitializedVariantRef.current) {
      const initialAttributes = data.attributes.reduce(
        (
          acc: Record<string, string>,
          attribute: { name: string; value: string },
        ) => {
          acc[attribute.name] = attribute.value;
          return acc;
        },
        {},
      );
      setAttributesMap(initialAttributes);
      selectVariantById(data.attributes[0]?.id ?? null);
      hasInitializedVariantRef.current = true;
    }
  }, [
    router.isReady,
    data,
    normalizedVariantParam,
    selectVariantById,
    setAttributesMap,
  ]);

  const subVariantParamRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!router.isReady) return;

    if (
      !data ||
      !Array.isArray(data.attributes) ||
      data.attributes.length === 0
    )
      return;

    if (!normalizedSubVariantParam) {
      subVariantParamRef.current = undefined;
      return;
    }

    if (subVariantParamRef.current === normalizedSubVariantParam) {
      return;
    }

    subVariantParamRef.current = normalizedSubVariantParam;

    const subVariantId = Number(normalizedSubVariantParam);
    if (Number.isNaN(subVariantId)) return;

    selectSubVariantById(subVariantId);
  }, [router.isReady, data, normalizedSubVariantParam, selectSubVariantById]);

  useEffect(() => {
    if (!router.isReady) return;

    const currentVariant =
      typeof normalizedVariantParam === "string"
        ? normalizedVariantParam
        : undefined;
    const desiredVariant =
      activeState !== null ? String(activeState) : undefined;

    const currentSubVariant =
      typeof normalizedSubVariantParam === "string"
        ? normalizedSubVariantParam
        : undefined;
    const desiredSubVariant =
      subActive !== null ? String(subActive) : undefined;

    const nextQuery = { ...router.query };
    let changed = false;

    if (desiredVariant) {
      if (currentVariant !== desiredVariant) {
        nextQuery.variant = desiredVariant;
        changed = true;
      }
    } else if (currentVariant) {
      delete nextQuery.variant;
      changed = true;
    }

    if (desiredSubVariant) {
      if (currentSubVariant !== desiredSubVariant) {
        nextQuery.subVariant = desiredSubVariant;
        changed = true;
      }
    } else if (currentSubVariant) {
      delete nextQuery.subVariant;
      changed = true;
    }

    if (changed) {
      router.replace(
        {
          pathname: router.pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true, scroll: false },
      );
    }
  }, [
    router.isReady,
    router.pathname,
    router.query,
    activeState,
    subActive,
    normalizedVariantParam,
    normalizedSubVariantParam,
  ]);

  const addToCart = useCallback(() => {
    if (!isSelected) return;
    setAddToCartLoader(true);
    setTimeout(() => {
      setAddToCartLoader(false);
    }, 600);
    const item = buildCartItemWithPrice(
      data!,
      attributes,
      activeState,
      subActive,
      canWholeSalePrice,
    );
    updateCart({ item, quantity });
  }, [
    isSelected,
    data,
    attributes,
    activeState,
    subActive,
    canWholeSalePrice,
    updateCart,
    quantity,
  ]);

  const baseProductImages = useMemo(() => {
    if (Array.isArray(data?.gallery) && data.gallery.length > 0) {
      return uniq(fromGallery(data.gallery));
    }
    if (Array.isArray(data?.album) && data.album.length > 0) {
      return uniq(fromAlbum(data.album));
    }
    if (Array.isArray(data?.attributes)) {
      const attrGal = data.attributes.flatMap((attr: any) =>
        fromGallery(attr.gallery),
      );
      if (attrGal.length > 0) return uniq(attrGal);

      const attrAlb = data.attributes.flatMap((attr: any) =>
        fromAlbum(attr.album),
      );
      if (attrAlb.length > 0) return uniq(attrAlb);
    }
    return [];
  }, [data?.gallery, data?.album, data?.attributes]);

  const activeProductImages = useMemo(() => {
    if (!router.isReady || !activeState || !activeAttributes) {
      return [];
    }
    const list = fromGallery(activeAttributes.gallery)
      .concat(fromAlbum(activeAttributes.album))
      .concat(fromGallery(data?.gallery))
      .concat(fromAlbum(data?.album));

    if (list.length > 0) return uniq(list);

    if (Array.isArray(data?.attributes)) {
      const others = data.attributes
        .filter((a: any) => a !== activeAttributes)
        .flatMap((attr: any) => fromGallery(attr.gallery));
      if (others.length > 0) return uniq(others);

      const othersAlbum = data.attributes
        .filter((a: any) => a !== activeAttributes)
        .flatMap((attr: any) => fromAlbum(attr.album));
      if (othersAlbum.length > 0) return uniq(othersAlbum);
    }
    return [];
  }, [
    router.isReady,
    activeState,
    activeAttributes,
    data?.gallery,
    data?.album,
    data?.attributes,
  ]);

  const productImages = useMemo(
    () => ({
      gallery:
        activeProductImages.length > 0
          ? activeProductImages
          : baseProductImages,
    }),
    [activeProductImages, baseProductImages],
  );

  const images = useMemo(() => {
    const galleryToUse =
      productImages.gallery.length > 0
        ? productImages.gallery
        : baseProductImages;
    return galleryToUse.map((item: any) => {
      const allSizes = getAllImageSizes(item);
      return allSizes;
    });
  }, [productImages.gallery, baseProductImages]);

  const gridTemplateColumns = useMemo(() => {
    const imageCount = images?.length || 0;
    return imageCount > 1
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(1, minmax(0, 1fr))";
  }, [images?.length]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <div className="block lg:grid grid-cols-9 gap-x-10 xl:gap-x-14 pt-7 pb-10 lg:pb-14 2xl:pb-20 items-start">
        <div className="block lg:hidden">
          <Carousel
            pagination={{
              clickable: true,
            }}
            breakpoints={productGalleryCarouselResponsive}
            className="product-gallery"
            buttonGroupClassName="hidden"
          >
            {images &&
              images.map((img: any, index: number) => (
                <SwiperSlide key={`product-gallery-key-${index}`}>
                  <div className="col-span-1 transition duration-150 ease-in hover:opacity-90">
                    <Image
                      src={`${img.original}`}
                      alt={`${data?.name}--${index}`}
                      onLoad={() => setImagesLoaded((prev) => prev + 1)}
                      width={500}
                      height={500}
                      className="object-cover w-full mix-blend-multiply"
                      loading="lazy"
                    />
                  </div>
                </SwiperSlide>
              ))}
          </Carousel>
        </div>

        <div
          className="hidden lg:block col-span-5 grid gap-2.5"
          style={{
            gridTemplateColumns: gridTemplateColumns,
            display: "grid",
          }}
          suppressHydrationWarning
        >
          {images &&
            images.length > 0 &&
            images.map((img: any, index: number) => (
              <motion.div
                initial={false}
                animate={
                  isMounted && imagesLoaded > index
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, y: 0 }
                }
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={index}
                className="w-full aspect-square transition duration-150 ease-in hover:opacity-90 bg-gray-100 rounded-md overflow-hidden"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={`${img.original}`}
                  alt={`${data?.name}--${index}`}
                  onLoad={() => setImagesLoaded((prev) => prev + 1)}
                  width={500}
                  height={500}
                  className="object-cover w-full h-full mix-blend-multiply"
                  loading="lazy"
                />
              </motion.div>
            ))}
          {lightboxOpen && (
            <Lightbox
              images={images.map((img: any) => img.original)}
              initialIndex={selectedIndex}
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(normalizedDescription) }}
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
            {Object.keys(variations).map((variation) => {
              return (
                <ProductAttributes
                  key={variation}
                  title={variation}
                  attributes={variations[variation]}
                  defuatlActive={activeState}
                  activeAttributes={activeAttributes}
                  subActive={subActive}
                  active={attributes[variation] ?? ""}
                  handleAttributeParent={handleAttributeParent}
                  handleAttributeChildren={handleAttributeChildren}
                />
              );
            })}
            {isAuthorized &&
              chooseQuantity &&
              (productQuantity === 0 ? (
                <div className="text-red-600">Out of stock</div>
              ) : (
                <div>
                  Quantity avaiable:{" "}
                  {availableQuantity ?? chooseQuantity ?? productQuantity}
                </div>
              ))}
          </div>
          {isAuthorized && (
            <div className="flex items-center gap-x-4 ltr:md:pr-32 rtl:md:pl-32 ltr:lg:pr-12 rtl:lg:pl-12 ltr:2xl:pr-32 rtl:2xl:pl-32 ltr:3xl:pr-48 rtl:3xl:pl-48  border-b border-gray-300 py-8">
              <Counter
                quantity={quantity}
                quantityInput={inputValue}
                onIncrement={increment}
                onDecrement={decrement}
                onInputChange={handleInputChange}
                onInputBlur={handleInputBlur}
                disableDecrement={disableDecrement}
                disableIncrement={disableIncrement}
                inputAriaLabel="Product quantity"
              />
              <Button
                onClick={addToCart}
                variant="slim"
                className={`w-full md:w-6/12 xl:w-full ${
                  !isSelected && "bg-gray-400 hover:bg-gray-400"
                }`}
                disabled={!isSelected || Number(productQuantity) <= 0}
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
                {data?.product_categories?.map((category: any) => (
                  <Link
                    key={category.id}
                    href={"/categories/" + category.slug}
                    className="transition hover:underline hover:text-heading"
                  >
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 rounded-md font-bold">
                      {category.name}
                    </span>
                  </Link>
                ))}
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
