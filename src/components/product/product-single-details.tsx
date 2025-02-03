import React, { useEffect, useState } from "react";
import Button from "@components/ui/button";
import Counter from "@components/common/counter";
import { useRouter } from "next/router";
import { useProductQuery } from "@framework/product/get-product";
import { getVariations } from "@framework/utils/get-variations";
import usePrice from "@framework/product/use-price";
import { generateCartItem } from "@utils/generate-cart-item";
import { ProductAttributes } from "./product-attributes";
import isEmpty from "lodash/isEmpty";
import Link from "@components/ui/link";
import { useWindowSize } from "@utils/use-window-size";
import Carousel from "@components/ui/carousel/carousel";
import { SwiperSlide } from "swiper/react";
import ProductMetaReview from "@components/product/product-meta-review";
import { useSsrCompatible } from "@utils/use-ssr-compatible";
import { useUI } from "@contexts/ui.context";
import { number_format } from "src/helpers/my-helper";
import { useCartMutation } from "@framework/carts/use-cart";

const productGalleryCarouselResponsive = {
  "768": {
    slidesPerView: 2,
  },
  "0": {
    slidesPerView: 1,
  },
};



const ProductSingleDetails: React.FC = () => {
  const {
    query: { slug },
  } = useRouter();
  const router = useRouter()
  const { isAuthorized } = useUI()
  const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });
  const { data, isLoading } = useProductQuery(slug as string);
  const { mutate: updateCart } = useCartMutation()
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const [activeState, setActiveState] = useState<number | undefined>(data?.attributes[0].id ?? undefined)
  const [subActive, setSubActive] = useState<number>()
  const [chooseQuantity, setChooseQuantity] = useState<number>()
  const { price, price_sale, percent } = usePrice(data);
  const mergeAttributes = (attributes: any) => {
    return attributes?.flatMap((attribute: { sub_attribute: any; }) => [
      attribute, // Thêm attribute gốc
      ...attribute.sub_attribute, // Thêm tất cả sub_attribute
    ]);
  };

  const allAttribute = mergeAttributes(data?.attributes)
  const variations = getVariations(allAttribute);
  useEffect(() => {
    if (data && data.attributes.length > 0) {
      const variant = router.query['variant']
      if (variant) {
        const variantId = typeof variant === 'string' ? parseInt(variant) : variant
        const attributeItem = data.attributes.find((attr: any) => attr.id === variantId)
        if (attributeItem) {
          setAttributes((prev) => ({
            ...prev,
            [attributeItem.name]: attributeItem.value, // Cập nhật giá trị của thuộc tính
          }));
          setActiveState(attributeItem.id)
        }
      } else {
        const initialAttributes = data?.attributes.reduce((acc: { [x: string]: any; }, attribute: { name: string | number; value: any; }) => {
          acc[attribute.name] = attribute.value;
          return acc;
        }, {} as { [key: string]: string });
        setAttributes(initialAttributes)
        setActiveState(data?.attributes[0].id)
        const currentQuery = { ...router.query, variant: data.attributes[0].id }
        router.push(
          {
            pathname: router.pathname,
            query: currentQuery,
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [data])
  if (isLoading) return <p>Loading...</p>;

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
    }, 600);
    const item = {
      ...generateCartItem(data!, attributes, activeState, subActive),
      price: generateCartItem(data!, attributes, activeState, subActive).price ?? 0,
    };
    updateCart({ item, quantity });
  }
  function handleAttributeParent(attribute: any, attributeId: number) {
    const quantities = allAttribute.find((attr: any) => attr.id === attributeId)
    setAttributes((prev) => ({
      ...prev,
      ...attribute,
    }));
    if (attributeId) {
      setChooseQuantity(quantities.quantity)
      setActiveState(attributeId)
      const currentQuery = { ...router.query, variant: attributeId }
      router.push(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }
  const activeAttributes = data ? data?.attributes.find((attr: any) => attr.id === activeState) : []
  const productImages = {
    gallery: activeState
      ? activeAttributes ? activeAttributes.album : []
      : data?.attributes.flatMap((attribute: any) => attribute.album)
  }
  function handleAttributeChildren(attribute: any, attributeId: number) {
    const quantities = allAttribute.find((attr: any) => attr.id === attributeId)
    setAttributes((prev) => ({
      ...prev,
      ...attribute,
    }));
    if (attributeId) {
      setChooseQuantity(quantities.quantity)
      setSubActive(attributeId)
    }
  }

  return (
    <div className="block lg:grid grid-cols-9 gap-x-10 xl:gap-x-14 pt-7 pb-10 lg:pb-14 2xl:pb-20 items-start">
      {width < 1025 ? (
        <Carousel
          pagination={{
            clickable: true,
          }}
          breakpoints={productGalleryCarouselResponsive}
          className="product-gallery"
          buttonGroupClassName="hidden"
        >
          {productImages.gallery.map((item: any, index: number) => (
            <SwiperSlide key={`product-gallery-key-${index}`}>
              <div className="col-span-1 transition duration-150 ease-in hover:opacity-90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    `${process.env.NEXT_PUBLIC_SITE_URL}/${item}` ||
                    "/assets/placeholder/products/product-gallery.svg"
                  }
                  alt={`${data?.name}--${index}`}
                  className="object-cover w-full mix-blend-multiply"
                />
              </div>
            </SwiperSlide>
          ))}
        </Carousel>
      ) : (
        <div className={`col-span-5 grid ${productImages.gallery.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2.5`}>
          {productImages.gallery.map((item: any, index: number) => (
            <div
              key={index}
              className="col-span-1 transition duration-150 ease-in hover:opacity-90 bg-gray-100 rounded-md"
            >
              <img
                src={
                  `${process.env.NEXT_PUBLIC_SITE_URL}/${item}`
                }
                alt={`${data?.name}--${index}`}
                className="object-cover w-full mix-blend-multiply"
              />
            </div>
          ))}
        </div>
      )}

      <div className="col-span-4 pt-8 lg:pt-0">
        <div className="pb-7 mb-7 border-b border-gray-300">
          <h2 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold hover:text-black mb-3.5">
            {data?.name}
          </h2>
          <p className="text-body text-sm lg:text-sm leading-6 lg:leading-8 indent-8"
            dangerouslySetInnerHTML={{ __html: data?.description ?? "" }}
          />
          {isAuthorized && (
            <div className="flex items-center justify-between mt-5">
              <div>
                {price_sale && (
                  <>
                    <span className="line-through font-segoe text-gray-400 text-sm md:text-base lg:text-base xl:text-lg ltr:pl-2 rtl:pr-2">
                      {price}
                    </span>
                    {percent && (
                      <span className="ml-2 bg-red-500 text-white text-10px md:text-xs leading-5 rounded-md inline-block px-1 sm:px-1.5 xl:px-2 py-0.5 sm:py-1">
                        <p>
                          <span>-</span>
                          {percent} <span className="hidden sm:inline">%</span>
                        </p>
                      </span>
                    )}
                  </>
                )}
                {price_sale ? (
                  <div className="text-red-500 font-bold text-base md:text-xl lg:text-lg 2xl:text-2xl ltr:pr-2 rtl:pl-2 ltr:md:pr-0 rtl:md:pl-0 ltr:lg:pr-2 rtl:lg:pl-2 ltr:2xl:pr-0 rtl:2xl:pl-0">
                    {number_format(price_sale)} <span className="text-base italic">VND</span>
                  </div>
                ) : (
                  <div className="text-red-500 font-bold text-base md:text-xl lg:text-lg 2xl:text-2xl ltr:pr-2 rtl:pl-2 ltr:md:pr-0 rtl:md:pl-0 ltr:lg:pr-2 rtl:lg:pl-2 ltr:2xl:pr-0 rtl:2xl:pl-0">
                    {number_format(data?.product_price)} <span className="text-base italic">VND</span>
                  </div>
                )}

              </div>

              <div className="text-gray-600 font-semibold text-base md:text-xl lg:text-lg italic underline">
                Retail:
                <span className="ml-2">{number_format(data?.product_retail_price)} </span>
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
          {isAuthorized && chooseQuantity && (
            <div>Stock avaiable: {chooseQuantity}</div>
          )}
        </div>

        {isAuthorized && (
          <div className="flex items-center gap-x-4 ltr:md:pr-32 rtl:md:pl-32 ltr:lg:pr-12 rtl:lg:pl-12 ltr:2xl:pr-32 rtl:2xl:pl-32 ltr:3xl:pr-48 rtl:3xl:pl-48  border-b border-gray-300 py-8">
            <Counter
              quantity={quantity}
              onIncrement={() => setQuantity((prev) => prev < (chooseQuantity ?? 0) ? prev + 1 : prev)}
              onDecrement={() =>
                setQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
              }
              disableDecrement={quantity === 1}
            />
            <Button
              onClick={addToCart}
              variant="slim"
              className={`w-full md:w-6/12 xl:w-full ${!isSelected && "bg-gray-400 hover:bg-gray-400"
                }`}
              disabled={!isSelected}
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
              {data?.sku}
            </li>
            <li>
              <span className="font-semibold text-heading inline-block ltr:pr-2 rtl:pl-2">
                Category:
              </span>
              {data?.product_categories?.map((category: any) => (
                <Link
                  key={category.id}
                  href={'/search?q=' + category.slug}
                  className="transition hover:underline hover:text-heading"
                >
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 rounded-md font-bold">{category.name}</span>
                </Link>
              ))}
            </li>
            {data?.tags && Array.isArray(data.tags) && (
              <li className="productTags">
                <span className="font-semibold text-heading inline-block ltr:pr-2 rtl:pl-2">
                  Tags:
                </span>
                {data.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={tag.slug}
                    className="inline-block ltr:pr-1.5 rtl:pl-1.5 transition hover:underline hover:text-heading ltr:last:pr-0 rtl:last:pl-0"
                  >
                    {tag.name}
                    <span className="text-heading">,</span>
                  </Link>
                ))}
              </li>
            )}
          </ul>
        </div>

        <ProductMetaReview data={data} />
      </div>
      <div className="product-detail pt-8 col-span-8 md:flex gap-5">
        <div className="p-5">
          <p className="text-base lg:text-lg font-semibold text-heading underline">Detail</p>
        </div>
        <div>
          <div
            className="leading-6 lg:leading-8 ck-content"
            dangerouslySetInnerHTML={{ __html: data?.content ?? "" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSingleDetails;
