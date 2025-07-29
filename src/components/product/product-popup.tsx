import React, { useEffect, useState } from "react";
import isEmpty from "lodash/isEmpty";
import { ROUTES } from "@utils/routes";
import { useUI } from "@contexts/ui.context";
import Button from "@components/ui/button";
import Counter from "@components/common/counter";
import { ProductAttributes } from "@components/product/product-attributes";
import { generateCartItem } from "@utils/generate-cart-item";
import {
  getVariations,
  mergeAttributes,
} from "@framework/utils/get-variations";
import {
  calculateTotalQuantity,
  cleanSku,
  number_format,
} from "src/helpers/my-helper";
import { useCartMutation } from "@framework/carts/use-cart";
import usePrice from "@framework/product/use-price";
import { useAuth } from "@contexts/auth/auth-context";
import { getAllImageSizes } from "@utils/use-image";
export default function ProductPopup() {
  const {
    modalData: { data },
    closeModal,
    openCart,
    isAuthorized,
  } = useUI();
  const { accessRights } = useAuth();
  const { price, price_sale, percent } = usePrice(data);
  const canWholeSalePrice = accessRights.canWholeSalePrice || false;
  // const { addItemToCart } = useCart();
  const { mutate: updateCart } = useCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [viewCartBtn, setViewCartBtn] = useState<boolean>(false);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const [activeState, setActiveState] = useState<number | null>(null);
  const [subActive, setSubActive] = useState<number | null>(null);
  const [chooseQuantity, setChooseQuantity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const allAttribute = mergeAttributes(data?.attributes);
  const variations = getVariations(allAttribute);
  const isSelected = !isEmpty(variations)
    ? !isEmpty(attributes) &&
      Object.keys(variations).every((variation) =>
        attributes.hasOwnProperty(variation)
      )
    : true;
  function addToCart() {
    if (!isSelected) return;
    // to show btn feedback while product carting
    setAddToCartLoader(true);
    setTimeout(() => {
      setAddToCartLoader(false);
      setViewCartBtn(true);
    }, 600);
    const item = {
      ...generateCartItem(
        data!,
        attributes,
        activeState === null ? undefined : activeState,
        subActive === null ? undefined : subActive,
        canWholeSalePrice
      ),
      price:
        generateCartItem(
          data!,
          attributes,
          activeState === null ? undefined : activeState,
          subActive === null ? undefined : subActive,
          canWholeSalePrice
        ).price ?? 0,
    };
    updateCart({ item, quantity });
  }
  function navigateToProductPage() {
    closeModal();
    window.location.href = `${ROUTES.PRODUCT}/${data.slug}`;
  }
  function handleAttributeParent(attribute: any, attributeId: number) {
    const quantities = allAttribute.find(
      (attr: any) => attr.id === attributeId
    );
    setAttributes((prev) => ({
      ...prev,
      ...attribute,
    }));
    if (attributeId) {
      setChooseQuantity(quantities.quantity);
      setActiveState(attributeId);
    }
  }
  useEffect(() => {
    if (!activeState && allAttribute?.length > 0) {
      const firstInStockAttr = allAttribute.find((attr: any) => {
        const hasSub =
          Array.isArray(attr.sub_attributes) && attr.sub_attributes.length > 0;
        if (hasSub) {
          return attr.sub_attributes.some(
            (sub: any) => Number(sub.quantity) > 0
          );
        }
        return Number(attr.quantity) > 0;
      });

      if (firstInStockAttr) {
        handleAttributeParent(
          {
            [firstInStockAttr.name]: firstInStockAttr.value,
          },
          firstInStockAttr.id
        );
      }
    }
  }, [activeState, allAttribute]);
  const [delayedImage, setDelayedImage] = useState<any>(null);
  const activeAttributes = data
    ? data?.attributes.find((attr: any) => attr.id === activeState)
    : [];
  const image = activeState
    ? Object.keys(activeAttributes?.image || {}).length > 0
      ? activeAttributes.image
      : data.image
    : data.image;

  useEffect(() => {
    if (!image) return;
    setLoading(true);
    const timeout = setTimeout(() => {
      const bestImg = getAllImageSizes(image); // 👈 dùng đúng hàm đã export
      setDelayedImage(bestImg || "");
    }, 150);
    return () => clearTimeout(timeout);
  }, [image]);
  const productSku =
    activeAttributes?.sub_attributes.length > 0
      ? cleanSku(activeAttributes?.sub_attributes[0].product_attribute_sku)
      : activeAttributes?.product_attribute_sku;

  const getProductQuantity = () => {
    if (activeAttributes) {
      return calculateTotalQuantity(activeAttributes);
    }
    return 0;
  };

  // Lấy giá trị số lượng khi cần sử dụng
  const productQuantity = getProductQuantity();
  function handleAttributeChildren(attribute: any, attributeId: number) {
    const quantities = allAttribute.find(
      (attr: any) => attr.id === attributeId
    );
    setAttributes((prev) => ({
      ...prev,
      ...attribute,
    }));
    if (attributeId) {
      setChooseQuantity(quantities.quantity);
      setSubActive(attributeId);
    }
  }

  function navigateToCartPage() {
    closeModal();
    setTimeout(() => {
      openCart();
    }, 300);
  }
  return (
    <div className="rounded-lg bg-white">
      <div className="flex flex-col lg:flex-row w-full md:w-[650px] lg:w-[960px] mx-auto overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-430px max-h-430px lg:max-h-full overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
          {delayedImage && (
            <img
              src={`${delayedImage.original}`}
              srcSet={`${delayedImage.tiny} 480w, ${delayedImage.small} 640w, ${delayedImage.medium} 800w, ${delayedImage.original} 1200w`}
              sizes="(max-width: 768px) 100vw, 800px"
              alt={data.name}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              className={`object-contain w-full h-auto transition-opacity duration-300 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
            />
          )}
        </div>
        <div className="flex flex-col p-5 md:p-8 w-full">
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
                dangerouslySetInnerHTML={{ __html: data?.description ?? "" }}
              ></p>
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
                      <div>W/S: </div>
                      {price_sale && (
                        <div className="h-10 w-[1px] bg-gray-400 mx-2 rotate-12"></div>
                      )}
                      <div className="">
                        {price_sale && (
                          <>
                            <del className="font-segoe text-gray-400 text-base lg:text-base ltr:pl-2.5 rtl:pr-2.5 -mt-0.5 md:mt-0">
                              {price}
                            </del>
                            <span className="bg-red-500 text-white text-10px md:text-xs leading-5 rounded-md inline-block px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1 ml-2">
                              <p>
                                <span>-</span>
                                {percent}{" "}
                                <span className="hidden sm:inline">%</span>
                              </p>
                            </span>
                          </>
                        )}
                        {price_sale ? (
                          <span className="block mx-2">
                            {number_format(price_sale)}{" "}
                          </span>
                        ) : (
                          <span className="block mx-2">
                            {number_format(price)}{" "}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-heading font-semibold text-base md:text-xl lg:text-lg">
                  {canWholeSalePrice ? "Retail" : "Price"}:
                  <span className="mx-2">
                    {number_format(data.product_retail_price)}{" "}
                  </span>
                </div>
              </div>
            )}
          </div>

          {Object.keys(variations).map((variation) => {
            return (
              <ProductAttributes
                key={variation}
                title={variation}
                attributes={variations[variation]}
                defuatlActive={activeState === null ? undefined : activeState}
                activeAttributes={activeAttributes}
                subActive={subActive === null ? undefined : subActive}
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
              <div>Quantity avaiable: {chooseQuantity}</div>
            ))}
          <div className="pt-2 md:pt-4">
            {isAuthorized && (
              <div className="flex items-center justify-between mb-4 gap-x-3 sm:gap-x-4">
                <Counter
                  quantity={quantity}
                  onIncrement={() =>
                    setQuantity((prev) =>
                      prev < (chooseQuantity ?? 0) ? prev + 1 : prev
                    )
                  }
                  onDecrement={() =>
                    setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
                  }
                  disableDecrement={quantity === 1}
                />
                <Button
                  onClick={addToCart}
                  variant="flat"
                  className={`w-full h-11 md:h-12 px-1.5 ${
                    !isSelected && "bg-gray-400 hover:bg-gray-400"
                  }`}
                  disabled={!isSelected || Number(productQuantity) <= 0}
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

            <Button
              onClick={navigateToProductPage}
              variant="flat"
              className="w-full h-11 md:h-12"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
