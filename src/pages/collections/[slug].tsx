import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import CollectionTopBar from "@components/collection/collection-top-bar";
import { GetServerSideProps } from "next";
import { findCollecitonBySlug } from "@framework/collecttion/get-all-collection";
import { useEffect, useState } from "react";
import { Product } from "@framework/types";
import ProductCard from "@components/product/product-card";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Collections({ collection }: any) {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    if (collection?.products) {
      setProducts(collection.products);
    }
  }, [collection])
  return (
    <div className="border-t-2 border-borderBottom">
      <Container>
        <div className={`flex pt-8 pb-16 lg:pb-20`}>
          <div className="w-full">
            <CollectionTopBar data={collection} />
            <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8`}>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={`product--key${product.id}`}
                    product={product}
                    variant="grid"
                  />
                ))
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

Collections.Layout = Layout;

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  try {
    const slug = params?.slug as string; // Ép kiểu slug thành string
    if (!slug) {
      return {
        notFound: true, // Trả về trang 404 nếu slug không tồn tại
      };
    }

    // Gọi API lấy collection theo slug
    const collection = await findCollecitonBySlug({ slug });

    if (!collection) {
      return {
        notFound: true, // Trả về 404 nếu không tìm thấy collection
      };
    }

    return {
      props: {
        ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
        collection, // Trả dữ liệu nếu tìm thấy
      },
    };
  } catch (error) {
    return {
      props: {
        collection: null, // Tránh crash nếu API lỗi
        error: "Không thể tải dữ liệu.",
      },
    };
  }
};

