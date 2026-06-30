/**
 * Adapter layer: admin-vgd API contract → shape mà các component/page DSC kỳ vọng.
 *
 * admin-vgd luôn bọc response trong `{ success, data }` và đặt tên field khác
 * api-dsc cũ (price vs product_price, colorways vs attributes, image object vs
 * string url...). Lớp này giữ UI/pages DSC nguyên vẹn — chỉ chuẩn hoá data ở
 * ranh giới hook. Mỗi resource có 1 mapper, dùng lại ở mọi hook liên quan.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

/** Bóc envelope `{ success, data }` của admin-vgd → trả phần `data`. */
export function unwrap<T = any>(body: any): T {
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return body.data as T;
  }
  return body as T;
}

/** Ghép media path tương đối với SITE_URL; giữ nguyên nếu đã là absolute URL. */
export function joinMedia(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}/${String(path).replace(/^\/+/, "")}`;
}

/** admin-vgd image có thể là string url hoặc object {url,original,thumbnail}. */
export function imageUrl(img: any): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url || img.original || img.thumbnail || "";
}

// ── HOME ────────────────────────────────────────────────────────────────────

export function adaptBrand(b: any) {
  // null (không "") khi thiếu ảnh → để `?? placeholder` ở BrandCard kích hoạt,
  // tránh empty-src warning. admin-vgd dsc brands hiện chưa có logo.
  const logo = imageUrl(b?.image) || b?.logo || null;
  const bg = imageUrl(b?.background_image) || b?.cover || logo || null;
  return {
    ...b,
    slug: b?.slug,
    name: b?.name,
    image: { original: logo },
    background_image: { original: bg },
  };
}

export function adaptBanner(b: any) {
  const img = imageUrl(b?.image);
  return {
    id: b?.id,
    title: b?.title,
    url: b?.link ?? b?.slug ?? "",
    // HeroBlock/index map album.mobile|desktop qua joinMedia (đã absolute-safe).
    album: { mobile: img, desktop: img },
    image: { original: img },
  };
}

export function adaptCategory(c: any) {
  return {
    ...c,
    name: c?.name,
    slug: c?.slug,
    image: imageUrl(c?.image),
    icon: typeof c?.icon === "string" ? c.icon : imageUrl(c?.icon),
    productCount: c?.products_count ?? c?.productCount ?? 0,
    tags: c?.tags ?? [],
  };
}

/** Category phẳng từ API (admin-vgd): có parent_id để dựng cây. */
export type FlatCategory = {
  id: number | string;
  parent_id?: number | string | null;
  name?: string;
  slug?: string;
  [key: string]: unknown;
};

/** Node cây: thêm `subCategory` (key mà header-menu/mega-menu đọc). */
export type CategoryTreeNode<T extends FlatCategory = FlatCategory> = T & {
  subCategory: CategoryTreeNode<T>[];
};

/**
 * Dựng cây phân cấp từ danh sách phẳng theo `parent_id`. Node có parent_id rỗng
 * (null/0) hoặc parent không nằm trong tập → root. Giữ nguyên thứ tự đầu vào
 * (API đã sort theo sort_order), không mutate input.
 */
export function buildCategoryTree<T extends FlatCategory>(
  flat: T[],
): CategoryTreeNode<T>[] {
  const byId = new Map<T["id"], CategoryTreeNode<T>>();
  for (const raw of flat) {
    byId.set(raw.id, { ...raw, subCategory: [] });
  }

  const roots: CategoryTreeNode<T>[] = [];
  for (const node of byId.values()) {
    const parentId = node.parent_id;
    const parent =
      parentId != null && parentId !== 0
        ? byId.get(parentId as T["id"])
        : undefined;
    if (parent) {
      parent.subCategory.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// ── PRODUCT ───────────────────────────────────────────────────────────────────

export function adaptProductCard(p: any) {
  const mainImg = imageUrl(p?.image);
  const attributes = Array.isArray(p?.colorways)
    ? p.colorways.map((c: any) => ({
        value: c?.value,
        image: c?.main_image || imageUrl(c?.image) || imageUrl(c?.images?.[0]),
      }))
    : Array.isArray(p?.attributes)
      ? p.attributes
      : [];
  // admin-vgd: retail_price (guest) + price (B2B authorized); stock|available_stock.
  const retail = Number(p?.retail_price ?? p?.price ?? 0);
  const price = Number(p?.price ?? p?.retail_price ?? 0);
  const sale = p?.sale_price != null ? Number(p.sale_price) : null;
  const quantity =
    p?.quantity ?? p?.stock ?? p?.available_stock ?? (p?.in_stock ? 1 : 0);
  return {
    ...p,
    id: p?.id,
    name: p?.name,
    slug: p?.slug,
    sku: p?.sku,
    quantity,
    image: mainImg,
    attributes,
    new: p?.isNewArrival ? 1 : 0,
    // ⚠ Tier wholesale (price) vs retail (retail_price). pricing_tier + price_lists
    // quyết định giá B2B thật — map trực tiếp field admin-vgd; xác nhận lại sau.
    product_price: price,
    product_retail_price: retail,
    // null (không undefined) để getServerSideProps serialize được.
    promotion_price: sale && sale > 0 && sale < retail ? sale : null,
  };
}

export function adaptProductDetail(p: any) {
  const base = adaptProductCard(p);
  const rawGallery = Array.isArray(p?.gallery)
    ? p.gallery
    : Array.isArray(p?.images)
      ? p.images
      : [];
  const gallery = rawGallery.length
    ? rawGallery.map((g: any) => ({
        original: imageUrl(g),
        thumbnail:
          typeof g === "object" ? g?.thumbnail || imageUrl(g) : imageUrl(g),
        url: imageUrl(g),
      }))
    : base.gallery;
  return {
    ...base,
    description: p?.description ?? "",
    content: p?.description ?? "",
    gallery,
    variations: p?.variations ?? null,
    variants: p?.variants ?? null,
    brand: p?.brand ?? null,
  };
}

export function adaptProductList(body: any) {
  const payload = unwrap<any>(body); // { data, paginatorInfo }
  const items = (payload?.data ?? []).map(adaptProductCard);
  const pg = payload?.paginatorInfo ?? {};
  return {
    data: items,
    products: items,
    current_page: pg.current_page ?? 1,
    last_page: pg.last_page ?? 1,
    per_page: pg.per_page ?? items.length,
    total: pg.total ?? items.length,
  };
}

/** admin-vgd trả mảng phẳng (new-arrival/featured/related). */
export function adaptProductArray(body: any) {
  return unwrap<any[]>(body).map(adaptProductCard);
}

/**
 * admin-vgd attributes: [{ name, code, values: [{ value, label }] }]
 * → mảng phẳng [{ id, name, value, label }] để getVariations() groupBy "name".
 */
export function adaptAttributes(body: any) {
  const attrs = unwrap<any[]>(body) ?? [];
  return attrs.flatMap((attr: any) =>
    (attr?.values ?? []).map((v: any, i: number) => ({
      id: `${attr?.code ?? attr?.name}-${v?.value ?? i}`,
      name: attr?.name,
      value: v?.value,
      label: v?.label ?? v?.display_value ?? v?.value,
    })),
  );
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

export function adaptLogin(body: any) {
  const d = unwrap<any>(body);
  return {
    access_token: d?.access_token,
    context: "client",
    remember: d?.remember_me ?? d?.remember ?? false,
    // roles undefined khi login response gọn → handleLoginSuccess sẽ gọi /me.
    user: d?.user ?? null,
    roles: d?.user?.roles,
    permissions: d?.user?.permissions,
  };
}

export function adaptMe(body: any) {
  const d = unwrap<any>(body);
  return {
    user: d,
    roles: d?.roles ?? [],
    permissions: d?.permissions ?? [],
  };
}

export function adaptRefresh(body: any) {
  const d = unwrap<any>(body);
  return {
    access_token: d?.access_token,
    remember: d?.remember_me ?? d?.remember ?? false,
  };
}
