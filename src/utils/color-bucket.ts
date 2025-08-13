/** =========================================================
 *  BUCKET HOÁ MÀU
 *  ======================================================= */

const BUCKET_TOKENS: Record<string, string[]> = {
  White: ["white", "ivory", "cream", "pearl"],
  Black: [
    "black",
    "noir",
    "ebony",
    "jet",
    "onyx",
    "charcoal",
    "graphite",
    "ink",
  ],
  Gray: [
    "gray",
    "grey",
    "ash",
    "slate",
    "smoke",
    "silver",
    "pewter",
    "steel",
    "stone",
    "fog",
    "high rise",
  ],
  Navy: ["navy", "blazer", "midnight", "indigo"],
  Blue: [
    "blue",
    "cobalt",
    "azure",
    "sky",
    "ocean",
    "marine",
    "royal",
    "sapphire",
    "denim",
    "teal",
    "maritime",
    "waterfall",
  ],
  Green: [
    "green",
    "forest",
    "myrtle",
    "olive",
    "sage",
    "mint",
    "lime",
    "emerald",
    "jade",
    "moss",
    "fern",
    "pine",
  ],
  Purple: [
    "purple",
    "violet",
    "lavender",
    "lilac",
    "mauve",
    "plum",
    "amethyst",
    "grape",
    "orchid",
  ],
  Magenta: ["magenta", "fuchsia"],
  Pink: [
    "pink",
    "rose",
    "rosy",
    "blush",
    "coral",
    "koral",
    "salmon",
    "peach",
    "confetti",
  ],
  Red: [
    "red",
    "scarlet",
    "crimson",
    "ruby",
    "cherry",
    "burgundy",
    "maroon",
    "wine",
    "cranberry",
  ],
  Orange: ["orange", "tangerine", "amber", "apricot", "pumpkin", "sunset"],
  Yellow: [
    "yellow",
    "mustard",
    "gold",
    "golden",
    "lemon",
    "butter",
    "canary",
    "sunflower",
    "sunbright",
  ],
  Brown: [
    "brown",
    "chocolate",
    "coffee",
    "cocoa",
    "mocha",
    "chestnut",
    "walnut",
    "caramel",
    "camel",
    "tan",
  ],
  Beige: ["beige", "taupe", "sand", "khaki"],
  Neutral: ["daydream", "loveable"], // hoặc để trống nếu không muốn gộp kiểu "mood"
};

export const STRONG_BUCKETS = new Set([
  "Navy",
  "Blue",
  "Green",
  "Purple",
  "Magenta",
  "Pink",
  "Red",
  "Orange",
  "Yellow",
  "Brown",
  "Beige",
]);
// các màu nền/Trung tính – sẽ bị loại nếu có strong màu
export const WEAK_BUCKETS = new Set(["White", "Black", "Neutral", "Gray"]);

// 2) Helper: escape regex + cho phép khoảng trắng hoặc dấu '-' trong token nhiều từ

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tokenToRegex = (t: string) => {
  const pat = t.includes(" ")
    ? `\\b${escapeRe(t).replace(/\s+/g, "(?:\\s|-)")}\\b` // "royal blue" => \broyal(?:\s|-)blue\b
    : `\\b${escapeRe(t)}\\b`;
  return new RegExp(pat, "i");
};

// 3) Build COLOR_BUCKETS_RULES từ token list
export const COLOR_BUCKETS_RULES: Record<string, RegExp[]> = Object.fromEntries(
  Object.entries(BUCKET_TOKENS).map(([bucket, tokens]) => [
    bucket,
    [...new Set(tokens.map((t) => t.trim().toLowerCase()).filter(Boolean))].map(
      tokenToRegex
    ),
  ])
);

export function applyDominance(buckets: string[]): string[] {
  if (buckets.length <= 1) return buckets;
  const strong = buckets.filter((b) => STRONG_BUCKETS.has(b));
  // nếu có ít nhất 1 strong -> chỉ giữ strong
  if (strong.length) return strong;
  return buckets; // không có strong thì giữ nguyên
}
export function detectBucketsFromName(raw: string): string[] {
  if (!raw) return [];
  const parts = String(raw)
    .split(/[\/&+,]| - |\s\/\s/g)
    .flatMap((s) => s.split("-"))
    .map((s) => s.trim())
    .filter(Boolean);

  const matched = new Set<string>();
  for (const part of parts) {
    for (const [bucket, rules] of Object.entries(COLOR_BUCKETS_RULES)) {
      if (rules.some((r) => r.test(part))) matched.add(bucket);
    }
  }
  if (!matched.size) {
    for (const [bucket, rules] of Object.entries(COLOR_BUCKETS_RULES)) {
      if (rules.some((r) => r.test(raw))) matched.add(bucket);
    }
  }
  return matched.size ? [...matched] : ["Other"];
}

export function buildColorBuckets(items: { value: string }[]) {
  const map = new Map<string, Set<string>>();
  for (const it of items) {
    const name = String(it.value ?? "").trim();
    if (!name) continue;
    const groups = applyDominance(detectBucketsFromName(name));
    for (const g of groups) {
      if (!map.has(g)) map.set(g, new Set());
      map.get(g)!.add(name);
    }
  }
  const ORDER = [
    "White",
    "Black",
    "Navy",
    "Blue",
    "Green",
    "Purple",
    "Magenta",
    "Pink",
    "Red",
    "Orange",
    "Yellow",
    "Brown",
    "Neutral",
    "Other",
  ];
  const entries = [...map.entries()].sort(
    (a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0])
  );
  return Object.fromEntries(
    entries.map(([k, v]) => [k, [...v].sort((a, b) => a.localeCompare(b))])
  ) as Record<string, string[]>;
}
// ================== Size bucketing (smart) ==================

type SizeBucket = "Tops" | "Bottoms" | "Footwear" | "Kids" | "Accessories";

const APPAREL_SET = new Set([
  "xxs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "xxxl",
  "3xl",
  "4xl",
  "5xl",
  "osfa",
  "one size",
  "onesize",
  "os",
]);

const normalizeSize = (s: string) => s.trim().toLowerCase();
const isNumeric = (s: string) => /^\d+$/.test(s);
const isDecimal = (s: string) => /^\d+(\.\d+)$/.test(s);
const isRange = (s: string) => /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(s);

const normText = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const hasKeyword = (haystack: string, kws: string[]) =>
  kws.some((k) => new RegExp(`\\b${k}\\b`, "i").test(haystack));

// Keyword theo catalogue
const KW = {
  accessories: [
    "accessory",
    "accessories",
    "belt",
    "hat",
    "cap",
    "scarf",
    "glove",
    "watch",
    "bag",
    "wallet",
    "sunglasses",
    "jewelry",
    "ring",
    "necklace",
    "bracelet",
    "earring",
    "visor",
    "headband",
    "beanie",
  ],
  footwear: [
    "shoe",
    "shoes",
    "sneaker",
    "trainer",
    "cleat",
    "stud",
    "boot",
    "boots",
    "sandal",
    "flip flop",
    "flip-flop",
    "slide",
    "loafer",
    "heel",
    "sock",
    "socks",
    "stocking",
    "leg warmer",
  ],
  bottoms: [
    "jean",
    "jeans",
    "trouser",
    "pant",
    "pants",
    "short",
    "shorts",
    "skirt",
    "skort",
    "legging",
    "tights",
    "jogger",
    "cargo",
    "chino",
  ],
  tops: [
    "tee",
    "t-shirt",
    "shirt",
    "polo",
    "hoodie",
    "sweatshirt",
    "crewneck",
    "jacket",
    "blazer",
    "coat",
    "cardigan",
    "tank",
    "camisole",
    "top",
    "bra",
  ],
  kidsHints: ["kid", "kids", "youth", "junior", "toddler", "infant", "baby"],
};

export function detectSizeBucket(
  v: string,
  ctx?: { name?: string; product_name: string; slug?: string; tags?: string[] }
): SizeBucket {
  const s = normalizeSize(v);

  const text = [
    normText(ctx?.name),
    normText(ctx?.product_name),
    normText(ctx?.slug),
    normText((ctx?.tags || []).join(" ")),
  ].join(" ");

  if (text.trim()) {
    if (hasKeyword(text, KW.accessories)) return "Accessories";
    if (hasKeyword(text, KW.footwear)) return "Footwear";
    if (hasKeyword(text, KW.bottoms)) return "Bottoms";
    if (hasKeyword(text, KW.tops)) return "Tops";
  }
  const kidsHinted = text && hasKeyword(text, KW.kidsHints);

  if (APPAREL_SET.has(s)) return "Tops";
  if (isRange(s)) return "Footwear";
  if (isDecimal(s)) return "Footwear";

  if (isNumeric(s)) {
    const num = parseInt(s, 10);
    if (num >= 100 && num <= 200) return "Kids";
    if (num >= 26 && num <= 42) return "Bottoms";
    return kidsHinted ? "Kids" : "Footwear";
  }

  return kidsHinted ? "Kids" : "Tops";
}

export function buildSizeBuckets(
  items: {
    value: string;
    name?: string;
    product_name: string;
    slug?: string;
    tags?: string[];
  }[],
  ctx?: { name?: string; product_name: string; slug?: string; tags?: string[] }
) {
  const map = new Map<SizeBucket, string[]>();
  map.set("Tops", []);
  map.set("Bottoms", []);
  map.set("Footwear", []);
  map.set("Kids", []);
  map.set("Accessories", []);

  for (const it of items) {
    const v = String(it.value ?? "").trim();
    if (!v) continue;
    const bucket = detectSizeBucket(v, {
      name: it.name ?? ctx?.name,
      product_name: it.product_name ?? ctx?.product_name,
      slug: it.slug ?? ctx?.slug,
      tags: it.tags ?? ctx?.tags,
    });
    map.get(bucket)!.push(v);
  }

  // Sort rules...
  const apparelOrder = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "3XL",
    "4XL",
    "5XL",
    "OSFA",
    "One Size",
  ];
  const orderIndex = new Map(apparelOrder.map((x, i) => [x.toLowerCase(), i]));

  const sortApparel = (a: string, b: string) => {
    const la = a.toLowerCase(),
      lb = b.toLowerCase();
    const ia = orderIndex.get(la),
      ib = orderIndex.get(lb);
    if (ia != null && ib != null) return ia - ib;
    if (ia != null) return -1;
    if (ib != null) return 1;

    const na = /^\d+$/.test(a) ? parseInt(a, 10) : NaN;
    const nb = /^\d+$/.test(b) ? parseInt(b, 10) : NaN;
    const aPant = Number.isInteger(na) && na >= 26 && na <= 42;
    const bPant = Number.isInteger(nb) && nb >= 26 && nb <= 42;
    if (aPant && bPant) return na - nb;
    if (aPant) return -1;
    if (bPant) return 1;

    return a.localeCompare(b, undefined, { numeric: true });
  };

  const parseToNumber = (s: string) => {
    if (isRange(s)) {
      const [l, r] = s.split("-").map((x) => parseFloat(x));
      return (l + r) / 2;
    }
    return parseFloat(s);
  };
  const sortFootwear = (a: string, b: string) =>
    parseToNumber(a) - parseToNumber(b);
  const sortKids = (a: string, b: string) =>
    (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);

  map.set("Tops", map.get("Tops")!.sort(sortApparel));
  map.set("Bottoms", map.get("Bottoms")!.sort(sortApparel));
  map.set("Footwear", map.get("Footwear")!.sort(sortFootwear));
  map.set("Kids", map.get("Kids")!.sort(sortKids));
  map.set("Accessories", map.get("Accessories")!.sort(sortApparel));

  return map;
}
