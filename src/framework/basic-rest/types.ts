import { QueryKey } from "@tanstack/react-query";

export type CollectionsQueryOptionsType = {
  text?: string;
  collection?: string;
  status?: string;
  limit?: number;
};

export type CategoriesQueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  demoVariant?: "ancient";
};
export type ProductsQueryOptionsType = {
  type: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};
export type QueryOptionsType = {
  text?: string;
  slug?: string | string[];
  category?: string;
  status?: string;
  limit?: number;
  page?: number;
  demoVariant?: "ancient";
  params?: { [anyProps: string]: string };
};
export type QueryBannerType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  demoVariant?: "ancient";
};

export type ShopsQueryOptionsType = {
  text?: string;
  shop?: Shop;
  status?: string;
  limit?: number;
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};
export type Attachment = {
  id: string | number;
  thumbnail: string;
  original: string;
};
export type Category = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  products?: Product[];
  productCount?: number;
};
export type Collection = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  products?: Product[];
  productCount?: number;
};
export type Brand = {
  id: number | string;
  name: string;
  slug: string;
  image?: Attachment;
  background_image?: any;
  [key: string]: unknown;
};
export type Banner = {
  id: number | string;
  name: string;
  slug: string;
  item: any;
  image?: Attachment;
  [key: string]: unknown;
};
export type Tag = {
  id: string | number;
  name: string;
  slug: string;
};
export type Product = {
  id: number | string;
  name: string;
  slug: string;
  product_price: number;
  quantity: number;
  product_retail_price?: number;
  image: any;
  sku?: string;
  gallery?: Attachment[];
  category?: Category;
  tag?: Tag[];
  tags?: Tag[];
  meta?: any[];
  description?: string;
  content?: string;
  variations?: object;
  product_categories?: any[];
  [key: string]: unknown;
  isNewArrival?: boolean;
  attributes?: any;
};
export type OrderItem = {
  id: number | string;
  product_name: string;
  total: number;
  quantity: number;
};
export type Order = {
  id: string | number;
  name: string;
  slug: string;
  order_items: OrderItem[];
  grand_total: number;
  tracking_number: string;
  customer: {
    id: number;
    email: string;
  };
  shipping_fee: number;
  memo: string;
};

export type Shop = {
  id: string | number;
  owner_id: string | number;
  owner_name: string;
  address: string;
  phone: string;
  website: string;
  ratings: string;
  name: string;
  slug: string;
  description: string;
  cover_image: Attachment;
  logo: Attachment;
  socialShare: any;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  image: string | null;
  status: string | null;
  company_id: string | null;
  store_id: string | null;
  province_id: string | null;
  district_id: string | null;
  ward_id: string | null;
  type: string | null;
  roleName: any;
  roles: any;
};
