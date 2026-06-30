import { useEffect, useMemo, useRef, useState } from "react";
import { ROUTES } from "@utils/routes";
import { useUI } from "@contexts/ui.context";
import Button from "@components/ui/button";
import Counter from "@components/common/counter";
import {
  ProductAttributes,
  type ColorwayForAttribute,
} from "@components/product/product-attributes";
import { number_format } from "src/helpers/my-helper";
import usePrice from "@framework/product/use-price";
import { useAuth } from "@contexts/auth/auth-context";
import Image from "next/image";
import { FaShare } from "react-icons/fa";
import { MdContentCopy, MdCheck } from "react-icons/md";
import { useProductDetail } from "@hooks/products/use-product-detail";
import { mapVariationAttributes } from "@utils/product-attribute-helpers";
import { getImageUrl } from "@utils/get-image-url";
import {
  findColorwayByAttributeValue,
  getProductImagesFromColorway,
} from "@utils/product-image-helpers";
import { sanitizeHtml } from "@utils/sanitize-html";

const isColorVariant = (title: string) => {
  const t = title.toLowerCase();
  return t === "color" || t.includes("màu") || t === "colour";
};

export default function ProductPopup() {
  const {
    modalData: { data },
    closeModal,
    openCart,
    isAuthorized,
  } = useUI();
  const { accessRights } = useAuth();
  const { price, price_sale, percent } = usePrice(data);

  // Use useMemo to re-calculate when accessRights changes
  const canWholeSalePrice = useMemo(() => {
    return accessRights?.canWholeSalePrice ?? false;
  }, [accessRights?.canWholeSalePrice]);
  const [viewCartBtn, setViewCartBtn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "success">(
    "idle",
  );

  const {
    allVariations,
    variations,
    selectedVariant,
    attributes,
    isSelected,
    handleAttribute,
    selectedStock,
    quantity,
    setQuantity,
    qtyStep,
    qtyMin,
    qtyMax,
    addToCart: addItemToCart,
    addToCartLoader,
  } = useProductDetail({ product: data });

  const productSku = selectedVariant?.sku ?? data?.sku;
  const availableQuantity = selectedStock;

  function addToCart() {
    if (!isSelected) return;
    setViewCartBtn(true);
    addItemToCart();
  }
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const shareBlockRef = useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCopyTimeout = () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  };

  function navigateToProductPage() {
    closeModal();
    window.location.href = `${ROUTES.PRODUCT}/${data.slug}`;
  }
  const buildShareUrl = () => {
    if (typeof window === "undefined" || !data?.slug) {
      return "";
    }
    return `${window.location.origin}/products/${data.slug}`;
  };
  const toggleShare = () => {
    const url = buildShareUrl();
    clearCopyTimeout();
    setCopyStatus("idle");
    if (!url) return;
    if (showShareUrl) {
      setShowShareUrl(false);
      return;
    }
    setShareUrl(url);
    setShowShareUrl(true);
  };
  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    if (typeof navigator === "undefined" || !navigator?.clipboard?.writeText)
      return;
    clearCopyTimeout();
    setCopyStatus("copying");
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyTimeoutRef.current = setTimeout(() => {
        setCopyStatus("success");
        copyTimeoutRef.current = null;
      }, 1500);
    } catch (error) {
      console.error("Failed to copy product link", error);
      setCopyStatus("idle");
    }
  };
  useEffect(() => {
    if (!showShareUrl) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (shareBlockRef.current?.contains(target)) return;
      if (shareButtonRef.current?.contains(target)) return;
      clearCopyTimeout();
      setCopyStatus("idle");
      setShowShareUrl(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareUrl]);
  useEffect(
    () => () => {
      clearCopyTimeout();
    },
    [],
  );

  // Ảnh theo màu đang chọn (colorway) → fallback ảnh product
  const colorways =
    (data as { colorways?: ColorwayForAttribute[] })?.colorways ?? [];
  const colorVariationKey = Object.keys(variations || {}).find(isColorVariant);
  const activeColorValue = colorVariationKey
    ? attributes?.[colorVariationKey]
    : undefined;
  const image = useMemo(() => {
    if (colorways.length > 0 && activeColorValue?.trim()) {
      const cw = findColorwayByAttributeValue(colorways, activeColorValue);
      if (cw) {
        const imgs = getProductImagesFromColorway(cw);
        const first = imgs[0];
        const path = first?.original || first?.url || first?.thumbnail;
        if (path) return getImageUrl(path);
      }
    }
    return data?.image ? getImageUrl(data.image) : "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorways, activeColorValue, data?.image]);

  const [delayedImage, setDelayedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;
    setLoading(true);
    const timeout = setTimeout(() => {
      setDelayedImage(image || "");
    }, 150);
    return () => clearTimeout(timeout);
  }, [image]);

  function navigateToCartPage() {
    closeModal();
    setTimeout(() => {
      openCart();
    }, 300);
  }
  return (
    <div className="rounded-lg bg-white">
      {/* Modal wrapper: cố định chiều cao để bên phải cuộn */}
      <div className="w-full md:w-[650px] lg:w-[960px] mx-auto max-h-[85vh]">
        <div className="flex flex-col lg:flex-row items-stretch h-[85vh]">
          {/* LEFT: Ảnh fixed size, không cuộn */}
          <div className="relative w-full lg:w-[430px] h-[60vh] lg:h-full bg-white overflow-hidden flex-shrink-0">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {delayedImage && (
              <Image
                src={delayedImage}
                alt={data.name}
                fill
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                className={`object-contain transition-opacity duration-300 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
                sizes="(min-width:1024px) 430px, 100vw"
                priority
              />
            )}
          </div>

          {/* RIGHT: Content cuộn độc lập */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <div className="pb-5">
              <div
                className="mb-2 md:mb-2.5 block -mt-1.5"
                onClick={navigateToProductPage}
                role="button"
              >
                <h2 className="text-heading text-lg md:text-xl lg:text-2xl font-semibold hover:text-black">
                  {data.name}
                </h2>
              </div>

              {data.description && data.description !== "undefined" && (
                <p
                  className="text-sm leading-6 md:text-body md:leading-7"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(data?.description),
                  }}
                />
              )}

              <p className="text-sm">
                <span className="font-semibold text-heading inline-block ltr:pr-2 rtl:pl-2">
                  SKU:
                </span>
                {productSku}
              </p>

              {isAuthorized && (
                <div className="flex items-center justify-between mt-3">
                  {canWholeSalePrice && (
                    <div>
                      <div className="text-heading font-semibold text-base md:text-xl lg:text-lg flex items-center">
                        <div>W/S:</div>
                        {price_sale && (
                          <div className="h-10 w-[1px] bg-gray-400 mx-2 rotate-12" />
                        )}
                        <div>
                          {price_sale ? (
                            <>
                              <del className="font-segoe text-gray-400 text-base lg:text-base ltr:pl-2.5 rtl:pr-2.5 -mt-0.5 md:mt-0">
                                {price}
                              </del>
                              <span className="bg-red-500 text-white text-10px md:text-xs leading-5 rounded-md inline-block px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1 ml-2">
                                -{percent}%
                              </span>
                              <span className="block mx-2">
                                {number_format(price_sale)}
                              </span>
                            </>
                          ) : (
                            <span className="block mx-2">
                              {number_format(price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="text-heading font-semibold text-base md:text-xl lg:text-lg">
                    {canWholeSalePrice ? "Retail" : "Price"}:
                    <span className="mx-2">
                      {number_format(data.product_retail_price)}
                    </span>
                  </div>
                </div>
              )}
            </div>

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
              availableQuantity !== undefined &&
              (availableQuantity <= 0 ? (
                <div className="text-red-600">Out of stock</div>
              ) : (
                <div>Quantity available: {availableQuantity}</div>
              ))}

            <div className="pt-2 md:pt-4">
              {isAuthorized && (
                <div className="flex items-center justify-between mb-4 gap-x-3 sm:gap-x-4">
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
                    inputAriaLabel="Product quantity"
                  />
                  <Button
                    onClick={addToCart}
                    variant="flat"
                    className={`w-full h-11 md:h-12 px-1.5 ${
                      !isSelected && "bg-gray-400 hover:bg-gray-400"
                    }`}
                    disabled={
                      !isSelected ||
                      (availableQuantity !== undefined && availableQuantity <= 0)
                    }
                    loading={addToCartLoader}
                  >
                    Add to Cart
                  </Button>
                </div>
              )}

              {viewCartBtn && (
                <button
                  onClick={navigateToCartPage}
                  className="w-full mb-4 h-11 md:h-12 rounded bg-gray-100 text-heading focus:outline-none border border-gray-300 transition-colors hover:bg-gray-50 focus:bg-gray-50"
                >
                  View Cart
                </button>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={navigateToProductPage}
                  variant="flat"
                  className="w-full h-11 md:h-12"
                >
                  View Details
                </Button>
                <button
                  type="button"
                  ref={shareButtonRef}
                  onClick={toggleShare}
                  className="px-5 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 rounded-md h-11 md:h-12 bg-gray-100 text-heading focus:outline-none border border-gray-300 transition-colors hover:bg-gray-50 focus:bg-gray-50 flex items-center justify-center"
                >
                  <FaShare />
                </button>
              </div>
              {showShareUrl && (
                <div
                  ref={shareBlockRef}
                  className="flex items-center gap-2 mt-2 max-w-xs sm:max-w-md w-full"
                >
                  <input
                    readOnly
                    value={shareUrl}
                    className={`flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white truncate ${
                      copyStatus === "success"
                        ? "border-green-500 text-green-600"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareUrl}
                    className={`h-9 w-9 flex items-center justify-center rounded-md border ${
                      copyStatus === "success"
                        ? "border-green-500 bg-green-100 text-green-600"
                        : "border-gray-300 bg-gray-100 text-heading hover:bg-gray-50"
                    } focus:outline-none`}
                    aria-label="Copy share link"
                  >
                    {copyStatus === "success" ? (
                      <MdCheck size={18} />
                    ) : (
                      <MdContentCopy size={18} />
                    )}
                  </button>
                  {copyStatus === "copying" && (
                    <span className="text-xs text-heading font-medium">
                      Copy
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
