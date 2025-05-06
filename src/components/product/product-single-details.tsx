import React, { useEffect, useState } from "react";
import Button from "@components/ui/button";
import Counter from "@components/common/counter";
import { useRouter } from "next/router";
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
import { calculateTotalQuantity, cleanSku, number_format } from "src/helpers/my-helper";
import { useCartMutation } from "@framework/carts/use-cart";
import ProductDetailTab from "./product-detail-tab";
import { useAuth } from "@contexts/auth/auth-context";
import Lightbox from "./lightbox/Lightbox";
import { motion } from "framer-motion";

const productGalleryCarouselResponsive = {
  "768": {
    slidesPerView: 2,
  },
  "0": {
    slidesPerView: 1,
  },
};
interface ProductSingleDetailsProps {
  data: any; // Replace 'any' with the appropriate type for the product data
}

const ProductSingleDetails: React.FC<ProductSingleDetailsProps> = ({ data }) => {
  const [isLoading] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const router = useRouter()
  const { accessRights } = useAuth()
  const canWholeSalePrice = accessRights.canWholeSalePrice || false;
  const { isAuthorized } = useUI()
  const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });
  // const { data, isLoading } = useProductQuery(slug as string);
  const { mutate: updateCart } = useCartMutation()
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const [activeState, setActiveState] = useState<number | undefined>(data?.attributes[0].id ?? undefined)
  const [subActive, setSubActive] = useState<number>()
  const [chooseQuantity, setChooseQuantity] = useState<number>()
  const { price, price_sale, percent } = usePrice(data);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };
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
  }, [data, router])

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
      ...generateCartItem(data!, attributes, activeState, subActive, canWholeSalePrice),
      price: generateCartItem(data!, attributes, activeState, subActive, canWholeSalePrice).price ?? 0,
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
  const activeAttributes = data?.attributes.find((attr: any) => attr.id === activeState) || null
  const parseAlbum = (album: any): any[] => {
    if (!album) return []
    if (typeof album === 'string') {
      try {
        return JSON.parse(album)
      } catch {
        return []
      }
    }
    return album
  }
  const imagePath = process.env.NEXT_PUBLIC_SITE_URL;
  const productImages = {
    gallery: activeState
      ? (Array.isArray(activeAttributes?.album) && activeAttributes.album.some(Boolean)
        ? parseAlbum(activeAttributes.album)
        : parseAlbum(data?.album))
      : (Array.isArray(data?.attributes)
        ? data.attributes.flatMap((attr: any) => attr.album || [])
        : parseAlbum(data?.album))
  };
  const images = productImages?.gallery.map((item: any) =>
    item
      ? `${imagePath}/${item.medium}`
      : '/assets/placeholder/products/product-gallery.svg'
  ) || [];

  const productSku = activeAttributes?.sub_attribute.length > 0
    ? cleanSku(activeAttributes?.sub_attribute[0].product_attribute_sku)
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
    <>
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
            {productImages.gallery && productImages.gallery.map((img: any, index: number) => (
              <SwiperSlide key={`product-gallery-key-${index}`}>
                <div className="col-span-1 transition duration-150 ease-in hover:opacity-90">
                  <img
                    src={`${imagePath}/${img.medium}`}
                    srcSet={`
                      ${imagePath}/${img.tiny} 352w,
                      ${imagePath}/${img.small} 540w,
                      ${imagePath}/${img.medium} 720w,
                      ${imagePath}/${img.original} 1000w
                  `}
                    sizes="(max-width: 600px) 352px, (max-width: 900px) 540px, 720px"
                    alt={`${data?.name}--${index}`}
                    width={500}
                    height={500}
                    className="object-cover w-full mix-blend-multiply"
                    loading="eager"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Carousel>
        ) : (
          <div
            className={`col-span-5 grid ${productImages.gallery.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2.5`}>
            {productImages.gallery && productImages.gallery.map((img: any, index: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={imagesLoaded > index ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={index}
                className="col-span-1 transition duration-150 ease-in hover:opacity-90 bg-gray-100 rounded-md"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={`${imagePath}/${img.medium}`}
                  srcSet={`
                    ${imagePath}/${img.tiny} 352w,
                    ${imagePath}/${img.small} 540w,
                    ${imagePath}/${img.medium} 720w,
                    ${imagePath}/${img.original} 1000w
                `}
                  sizes="(max-width: 600px) 352px, (max-width: 900px) 540px, 720px"
                  alt={`${data?.name}--${index}`}
                  onLoad={() => setImagesLoaded((prev) => prev + 1)}
                  width={500}
                  height={500}
                  className="object-cover w-full mix-blend-multiply"
                  loading="lazy"
                />
              </motion.div>
            ))}
            {lightboxOpen && (
              <Lightbox
                images={images}
                initialIndex={selectedIndex}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </div>
        )}
        <div className="col-span-4 pt-8 lg:pt-0">
          <div className="pb-7 mb-7 border-b border-gray-300">
            <h2 className="text-heading text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold hover:text-black mb-3.5">
              {data?.name}
            </h2>
            {data?.description && data.description !== 'undefined' && (
              <p className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                dangerouslySetInnerHTML={{ __html: data?.description ?? "" }}
              ></p>
            )}
            {isAuthorized && (
              <div className="flex items-center justify-between mt-5">
                {
                  canWholeSalePrice && (
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
                  )
                }
                <div className="text-gray-600 font-semibold text-base md:text-xl lg:text-lg italic underline">
                  {canWholeSalePrice ? "Retail" : 'Price'}:
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
              productQuantity === 0 ? (
                <div className="text-red-600">Out of stock</div>
              ) : (
                <div>Quantity avaiable: {chooseQuantity}</div>
              )
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
                  {data.tags.map((tag: { id: number; slug: string; name: string }) => (
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
      </div>
      <ProductDetailTab data={data} />
    </>
  );
};

export default ProductSingleDetails;
