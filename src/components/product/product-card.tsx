import cn from "classnames";
import { useEffect, useState, type FC } from "react";
import { useUI } from "@contexts/ui.context";
import usePrice from "@framework/product/use-price";
import { Product } from "@framework/types";
import ProductViewIcon from "@components/icons/product-view-icon";
import ProductWishIcon from "@components/icons/product-wish-icon";
import ProductCompareIcon from "@components/icons/product-compare-icon";
import RatingDisplay from "@components/common/rating-display";
import { number_format } from "src/helpers/my-helper";
import { useAuth } from "@contexts/auth/auth-context";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface ProductProps {
  product: Product;
  index: number;
  className?: string;
  contactClassName?: string;
  imageContentClassName?: string;
  variant?:
  | "grid"
  | "gridSlim"
  | "list"
  | "listSmall"
  | "gridModern"
  | "gridModernWide"
  | "gridTrendy"
  | "rounded"
  | "circle";
  imgWidth?: number | string;
  imgHeight?: number | string;
  imgLoading?: "eager" | "lazy";
  hideProductDescription?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  bgTransparent?: boolean;
  bgGray?: boolean;
  demoVariant?: "ancient";
  disableBorderRadius?: boolean;
}

const ProductCard: FC<ProductProps> = ({
  product,
  index,
  className = "",
  contactClassName = "",
  imageContentClassName = "",
  variant = "list",
  imgWidth = 340,
  imgHeight = 340,
  showCategory = false,
  showRating = false,
  bgTransparent = false,
  bgGray = false,
  demoVariant,
  disableBorderRadius = false,
}) => {
  const { accessRights } = useAuth();
  const { openModal, setModalView, setModalData, isAuthorized } = useUI();
  const canWholeSalePrice = accessRights.canWholeSalePrice || false;
  function handlePopupView() {
    setModalData({ data: product });
    setModalView("PRODUCT_VIEW");
    return openModal();
  }
  const isNewArrival = product.new === 1
  const { price_sale, percent } = usePrice(product);
  const [attrImage, setAttrImage] = useState<string[]>([])
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hoverImage, setHoverImage] = useState<string>("");
  const imagePath = process.env.NEXT_PUBLIC_SITE_URL;
  const handleImageHover = (imageUrl: string) => {
    const folder = imageUrl.includes('tiny') ? 'medium' : imageUrl.includes('medium') ? 'large' : 'tiny';
    return imageUrl.replace('tiny', folder).replace('_tiny', `_${folder}`).replace('_medium', `_${folder}`).replace('_large', `_${folder}`);
  }
  useEffect(() => {
    if (product?.image) {
      const imageUrl = `${imagePath}/${product.image.small}`;
      setHoverImage(imageUrl);
    }
  }, [product?.image]);
  useEffect(() => {
    if (product?.attributes && product?.attributes.length > 0) {
      const imageUrls = product.attributes
        .filter((attr: any) => attr?.image?.tiny) // chỉ giữ attribute có ảnh
        .map((attr: any) => `${imagePath}/${attr.image.tiny}`);
      setAttrImage(imageUrls);
    }
  }, [product?.attributes]);
  return (
    <div
      className={cn(
        `group box-border overflow-hidden flex ${!disableBorderRadius && "rounded-md"
        } cursor-pointer`,
        {
          "ltr:pr-0 rtl:pl-0 pb-2 lg:pb-3 flex-col items-start transition duration-200 ease-in-out transform hover:-translate-y-1 md:hover:-translate-y-1.5 hover:shadow-product":
            variant === "grid" ||
            variant === "gridModern" ||
            variant === "gridModernWide" ||
            variant === "gridTrendy",
          " bg-white":
            (variant === "grid" && !bgGray) ||
            (variant === "gridModern" && !bgGray) ||
            (variant === "gridModernWide" && !bgGray) ||
            (variant === "gridTrendy" && !bgGray) ||
            (variant === "gridSlim" && !bgGray),
          "bg-gray-200": variant === "list" || bgGray,
          "ltr:pr-0 rtl:pl-0 md:pb-1 flex-col items-start":
            variant === "gridSlim",
          "items-center border border-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-listProduct":
            variant === "listSmall",
          "flex-row items-center transition-transform ease-linear ltr:pr-2 rtl:pl-2 ltr:lg:pr-3 rtl:lg:pl-3 ltr:2xl:pr-4 rtl:2xl:pl-4":
            variant === "list",
          "!bg-transparent": variant === "grid" && bgTransparent === true,
        },
        className
      )}
      onClick={handlePopupView}
      role="button"
      title={product?.name}
    >
      <div
        className={cn(
          "flex h-[204px] sm:h-[348px] md:h-[239px] lg:h-[202px] xl:h-[239px]",
          {
            "mb-3 md:mb-3.5": variant === "grid",
            "mb-3 md:mb-3.5 pb-0": variant === "gridSlim",
            "flex-shrink-0 w-32 sm:w-44 md:w-36 lg:w-44":
              variant === "listSmall",
            "mb-3 md:mb-3.5 relative":
              variant === "gridModern" ||
              variant === "gridModernWide" ||
              variant === "gridTrendy",
          },
          imageContentClassName
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 1 : 0.3 }}
          transition={{ duration: 0.5 }} // 👈 tốc độ fade 0.5s
          className="w-full h-full"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={hoverImage}
              src={hoverImage}
              srcSet={`
                ${imagePath}/${product?.image.tiny} 352px,
                ${imagePath}/${product?.image.small} 540px,
                ${imagePath}/${product?.image.medium} 720px,
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              sizes="(max-width: 600px) 352px, (max-width: 900px) 540px, 720px"
              width={demoVariant === "ancient" ? 352 : Number(imgWidth)}
              height={demoVariant === "ancient" ? 452 : Number(imgHeight)}
              alt={product?.name || "Product Image"}
              loading={index < 4 ? "eager" : "lazy"} // Chuyển đổi loading
              onLoad={() => setIsImageLoaded(true)}
              className={cn(
                `bg-white ${!disableBorderRadius && "rounded-s-md"}`,
                {
                  "w-full h-full object-contain ": true,
                  "transition duration-200 ease-in":
                    variant === "grid" ||
                    variant === "gridModern" ||
                    variant === "gridModernWide" ||
                    variant === "gridTrendy",
                  "rounded-md group-hover:rounded-b-none":
                    (variant === "grid" && !disableBorderRadius) ||
                    (variant === "gridModern" && !disableBorderRadius) ||
                    (variant === "gridModernWide" && !disableBorderRadius) ||
                    (variant === "gridTrendy" && !disableBorderRadius),
                  "rounded-md transition duration-150 ease-linear transform group-hover:scale-105":
                    variant === "gridSlim",
                  "rounded-s-md transition duration-200 ease-linear transform group-hover:scale-105":
                    variant === "list",
                }
              )}
            />
          </AnimatePresence>

        </motion.div>
        <div className="absolute top-3.5 md:top-5 3xl:top-7 ltr:left-3.5 rtl:right-3.5 ltr:md:left-5 rtl:md:right-5 ltr:3xl:left-7 rtl:3xl:right-7 flex flex-col gap-y-1 items-start">
          {canWholeSalePrice && isAuthorized && percent && (
            <span className="bg-yellow-500 text-white text-10px md:text-xs leading-5 rounded-md inline-block px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1">
              <p>
                <span>-</span>
                {percent} <span className="hidden sm:inline">%</span>
              </p>
            </span>
          )}
          {isNewArrival &&
            (
              <span className="bg-red-500 text-white text-10px md:text-xs leading-5 rounded-md inline-block px-1.5 sm:px-1.5 xl:px-2 py-0.5 sm:py-1">
                <p>
                  New <span className="hidden sm:inline">Arrival</span>
                </p>
              </span>
            )}
        </div>
        {variant === "gridModernWide" && (
          <div className="absolute ltr:right-2 rtl:left-2 ltr:sm:right-3 rtl:sm:left-3 bottom-6 space-y-2 w-[32px] sm:w-[42px] lg:w-[52px]">
            <ProductViewIcon className="w-full transition duration-300 ease-in delay-100 bg-white rounded-md sm:opacity-0 group-hover:opacity-100" />
            <ProductWishIcon className="w-full transition duration-300 ease-in delay-200 bg-white rounded-md sm:opacity-0 group-hover:opacity-100" />
            <ProductCompareIcon className="w-full transition duration-300 ease-in delay-300 bg-white rounded-md sm:opacity-0 group-hover:opacity-100" />
          </div>
        )}
      </div>
      <div
        className={cn(
          "w-full overflow-hidden p-2",
          {
            "md:px-2.5 xl:px-4": variant === "grid",

            "px-2 md:px-2.5 xl:px-4 h-full flex flex-col":
              variant === "gridModern" ||
              variant === "gridModernWide" ||
              variant === "gridTrendy",

            "ltr:pl-0 rtl:pr-0": variant === "gridSlim",
            "px-4 lg:px-5 2xl:px-4": variant === "listSmall",
          },
          contactClassName
        )}
      >
        {(variant === "gridModern" ||
          variant === "gridModernWide" ||
          variant === "gridTrendy") && (
            <div className="flex items-center py-2 gap-x-2">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-[#FBD103]"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="text-xs font-semibold truncate sm:text-sm text-heading">
                4.5
              </span>
              {product.quantity === 0 && (
                <span className="text-xs sm:text-sm leading-5 ltr:pl-3 rtl:pr-3 font-semibold text-[#EF4444]">
                  Out of stock
                </span>
              )}
            </div>
          )}
        {!!(showCategory || showRating) && (
          <div className="flex flex-col md:flex-row md:items-center lg:flex-row xl:flex-row 2xl:flex-row  mb-0.5 items-start">
            {!!showCategory && (
              <h3
                className={cn(
                  "font-semibold text-sm mb-1 md:mb-0 ltr:mr-2 rtl:ml-2 ltr:md:mr-3 rtl:md:ml-3",
                  {
                    "text-white": bgTransparent,
                    "text-black/70": !bgTransparent,
                  }
                )}
              >
                Category
              </h3>
            )}
            {!!showRating && <RatingDisplay rating={2.5} />}
          </div>
        )}
        <div className="mb-4 leading-3">
          <h2
            className={cn("truncate mb-1", {
              "text-sm md:text-base": variant === "grid",
              "font-semibold": demoVariant !== "ancient",
              "font-bold": demoVariant === "ancient",
              "text-xs sm:text-sm md:text-base":
                variant === "gridModern" ||
                variant === "gridModernWide" ||
                variant === "gridTrendy",
              "md:mb-1.5 text-sm sm:text-base md:text-sm lg:text-base xl:text-lg":
                variant === "gridSlim",
              "text-sm sm:text-base md:mb-1.5 pb-0": variant === "listSmall",
              "text-sm sm:text-base md:text-sm lg:text-base xl:text-lg md:mb-1.5":
                variant === "list",
              "text-white": bgTransparent,
              "text-heading": !bgTransparent,
            })}
          >
            {product?.name}
          </h2>
          <p className="text-sm sm:text-base xl:text-base md:mb-1.5">{product.sku}</p>
        </div>

        {Array.isArray(attrImage) && attrImage.filter(Boolean).length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {attrImage.filter(Boolean).map((img: any, index: number) => (
              <div key={index} className="w-auto shadow-product hover:border hover:border-gray-400">
                <Image
                  src={img}
                  alt="Your Image"
                  width={500}
                  height={35}
                  className="object-cover w-full"
                  style={{ height: "auto", width: "auto" }}
                  onMouseOver={() => setHoverImage(handleImageHover(img))}
                  loading="lazy"
                  priority={false}
                />
              </div>
            ))}
          </div>
        )}
        {/* {!hideProductDescription && product?.description && (
          <p className="text-body text-xs lg:text-sm leading-normal xl:leading-relaxed max-w-[250px] truncate">
            {product?.description}
          </p>
        )} */}
        {isAuthorized && (
          <div
            className={`font-semibold text-sm sm:text-base mt-1.5 ${variant === "grid"
              ? "lg:text-base lg:mt-2.5"
              : "sm:text-xl md:text-base lg:text-xl md:mt-2.5 2xl:mt-3"
              }
          ${variant === "gridModern" ||
                variant === "gridModernWide" ||
                variant === "gridTrendy"
                ? "flex flex-col-reverse !gap-x-0 !mt-auto"
                : ""
              } ${bgTransparent ? "text-white" : "text-heading"}`}
          >
            <span
              className={`block ${canWholeSalePrice ? 'text-red-500' : 'text-balance'} ${demoVariant === "ancient" && "font-bold text-gray-900 text-lg"
                }`}
            >
              <span>{canWholeSalePrice ? 'Retail' : 'Price'}: </span>
              <span className="float-right">{number_format(product.product_retail_price ?? 0)}</span>
            </span>
            {canWholeSalePrice && (
              <>
                {price_sale && (
                  <del
                    className={`block text-sm italic text-gray-400 ${demoVariant === "ancient" && "font-bold text-gray-900 text-lg"
                      }`}
                  >
                    <span>W/S: </span>
                    <del className="float-right">{number_format(product.product_price ?? 0)}</del>
                  </del>
                )}
                {price_sale ? (
                  <span
                    className={`block text-sm italic text-gray-900 ${demoVariant === "ancient" && "font-bold text-gray-900 text-lg"
                      }`}
                  >
                    <span>W/S: </span>
                    <span className="float-right">{number_format(price_sale ?? 0)}</span>
                  </span>
                ) : (
                  <span
                    className={`block text-sm italic text-gray-900 ${demoVariant === "ancient" && "font-bold text-gray-900 text-lg"
                      }`}
                  >
                    <span>W/S: </span>
                    <span className="float-right">{number_format(product.product_price ?? 0)}</span>
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {(variant === "gridTrendy" || variant === "gridModern") && (
        <div className="absolute flex ltr:right-2 rtl:left-2 bottom-2 gap-x-2">
          <ProductWishIcon className="transition ease-in duration-300 sm:opacity-0 group-hover:opacity-100 delay-200 w-[35px] sm:w-[42px] lg:w-[52px] bg-[#F1F3F4] rounded-md" />
          <ProductCompareIcon className="transition ease-in duration-300 sm:opacity-0 group-hover:opacity-100 delay-300 w-[35px] sm:w-[42px] lg:w-[52px] bg-[#F1F3F4] rounded-md" />
        </div>
      )}
    </div>
  );
};

export default ProductCard;
