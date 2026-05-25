import { DEFAULT_OPTION } from "lib/constants";
import { Collection, Menu, Page, Product, ProductVariant } from "./types";

export const STORE_NAME = "SleekFan Co.";
export const NAVBAR_WORDMARK = "SleekFan";
export const TAGLINE = "Breeze Through Style.";
export const BUSINESS_IDEA =
  "Modern and stylish ceiling fans designed for UK homes and flats.";
export const HOMEPAGE_HEADLINE = "Elevate Your Space with Modern Ceiling Fans.";
export const HOMEPAGE_SUBHEADING =
  "Discover the perfect blend of design and efficiency for your home.";
export const HERO_PRODUCT_HANDLE = "sleek-fan-nova";
export const FALLBACK_CART_ID = "fallback-cart";
export const FALLBACK_CART_COOKIE = "fallbackCart";

const UPDATED_AT = "2026-05-25T00:00:00.000Z";
const IMAGE_WIDTH = 1400;
const IMAGE_HEIGHT = 1400;

type FallbackProductInput = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
};

const fallbackProductInputs: FallbackProductInput[] = [
  {
    id: "fallback-product-sleek-fan-aero",
    handle: "sleek-fan-aero",
    title: "Aero Sleek Ceiling Fan",
    description:
      "The Aero Sleek Ceiling Fan offers modern design with whisper-quiet operation, ideal for open living spaces. With energy-efficient LED lighting and remote control functionality, it enhances comfort and style in every room.",
    price: "249.99",
    currencyCode: "USD",
    imageUrl:
      "https://pnfjajqha7vht6gv.public.blob.vercel-storage.com/stores/99d85042-6e4a-4e5c-81c6-ef8c58e48842/products/sleek-fan-aero.webp",
    imageAlt:
      "Aero Sleek Ceiling Fan in a modern living room with soft natural light.",
    tags: ["quiet-living", "statement-style", "open-plan"],
  },
  {
    id: "fallback-product-sleek-fan-breeze",
    handle: "sleek-fan-breeze",
    title: "Breeze Soft Ceiling Fan",
    description:
      "Sleek and stylish, the Breeze Soft Ceiling Fan features a soft matte finish and modern blades that circulate air effortlessly. Perfect for bedrooms, it ensures a peaceful night's sleep with its silent operation.",
    price: "199.99",
    currencyCode: "USD",
    imageUrl:
      "https://pnfjajqha7vht6gv.public.blob.vercel-storage.com/stores/99d85042-6e4a-4e5c-81c6-ef8c58e48842/products/sleek-fan-breeze.webp",
    imageAlt:
      "Breeze Soft Ceiling Fan in a serene bedroom setting with dim evening light.",
    tags: ["quiet-living", "compact-living", "bedroom-edit"],
  },
  {
    id: "fallback-product-sleek-fan-nova",
    handle: "sleek-fan-nova",
    title: "Nova Infinity Ceiling Fan",
    description:
      "The Nova Infinity Ceiling Fan brings futuristic design to your home. It features an advanced motor for high airflow efficiency and is equipped with smart connectivity for easy control via your smartphone.",
    price: "349.99",
    currencyCode: "USD",
    imageUrl:
      "https://pnfjajqha7vht6gv.public.blob.vercel-storage.com/stores/99d85042-6e4a-4e5c-81c6-ef8c58e48842/products/sleek-fan-nova.webp",
    imageAlt:
      "Nova Infinity Ceiling Fan in a state-of-the-art office environment with bright overhead lights.",
    tags: ["smart-home", "statement-style", "high-airflow"],
  },
];

function createVariant(product: FallbackProductInput): ProductVariant {
  return {
    id: `fallback-variant-${product.handle}`,
    title: DEFAULT_OPTION,
    availableForSale: true,
    selectedOptions: [{ name: "Title", value: DEFAULT_OPTION }],
    price: {
      amount: product.price,
      currencyCode: product.currencyCode,
    },
  };
}

function createProduct(product: FallbackProductInput): Product {
  const variant = createVariant(product);
  const image = {
    url: product.imageUrl,
    altText: product.imageAlt,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  };

  return {
    id: product.id,
    handle: product.handle,
    availableForSale: true,
    title: product.title,
    description: product.description,
    descriptionHtml: `<p>${product.description}</p>`,
    options: [
      {
        id: `fallback-option-${product.handle}`,
        name: "Title",
        values: [DEFAULT_OPTION],
      },
    ],
    priceRange: {
      maxVariantPrice: variant.price,
      minVariantPrice: variant.price,
    },
    variants: [variant],
    featuredImage: image,
    images: [image],
    seo: {
      title: `${product.title} | ${STORE_NAME}`,
      description: product.description,
    },
    tags: product.tags,
    updatedAt: UPDATED_AT,
  };
}

export const fallbackProducts: Product[] =
  fallbackProductInputs.map(createProduct);

export const fallbackCollections: Collection[] = [
  {
    handle: "quiet-living",
    title: "Quiet",
    description:
      "Whisper-quiet fans suited to bedrooms, studies, and calm evening spaces.",
    seo: {
      title: "Quiet Ceiling Fans",
      description:
        "Whisper-quiet ceiling fans for bedrooms and calm contemporary interiors.",
    },
    path: "/search/quiet-living",
    updatedAt: UPDATED_AT,
  },
  {
    handle: "smart-home",
    title: "Smart",
    description:
      "Modern fans with remote and connected controls for everyday convenience.",
    seo: {
      title: "Smart Ceiling Fans",
      description:
        "Connected ceiling fans with efficient airflow and app-friendly control.",
    },
    path: "/search/smart-home",
    updatedAt: UPDATED_AT,
  },
  {
    handle: "statement-style",
    title: "Style",
    description:
      "Design-led fans that bring a clean architectural finish to living spaces.",
    seo: {
      title: "Statement Ceiling Fans",
      description:
        "Architectural ceiling fans with sleek lines and contemporary styling.",
    },
    path: "/search/statement-style",
    updatedAt: UPDATED_AT,
  },
];

export const fallbackPages: Page[] = [
  {
    id: "fallback-page-about",
    title: "About SleekFan Co.",
    handle: "about",
    body: `<p>${STORE_NAME} curates modern ceiling fans for UK homes and flats, balancing clean design, quiet performance, and energy-conscious comfort.</p>`,
    bodySummary:
      "SleekFan Co. curates modern ceiling fans for design-conscious UK homes.",
    seo: {
      title: "About SleekFan Co.",
      description:
        "Learn how SleekFan Co. brings modern comfort and efficient airflow to UK interiors.",
    },
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    id: "fallback-page-care",
    title: "Fan Care",
    handle: "care",
    body: `<p>Keep blades dust-free, balance airflow seasonally, and check fixings periodically to keep your SleekFan installation quiet and efficient.</p>`,
    bodySummary:
      "Simple care guidance for keeping modern ceiling fans clean and efficient.",
    seo: {
      title: "SleekFan Care",
      description:
        "Simple upkeep guidance for quiet, efficient ceiling fan performance.",
    },
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
  },
];

const fallbackCollectionHandles: Record<string, string[]> = {
  "quiet-living": ["sleek-fan-aero", "sleek-fan-breeze"],
  "smart-home": ["sleek-fan-nova"],
  "statement-style": ["sleek-fan-aero", "sleek-fan-nova"],
};

const headerMenu: Menu[] = [
  { title: "Shop", path: "/search" },
  { title: "Quiet", path: "/search/quiet-living" },
  { title: "Smart", path: "/search/smart-home" },
];

const footerMenu: Menu[] = [
  { title: "Shop", path: "/search" },
  { title: "Quiet", path: "/search/quiet-living" },
  { title: "Style", path: "/search/statement-style" },
];

function sortProducts(
  products: Product[],
  sortKey?: string,
  reverse?: boolean,
): Product[] {
  const sorted = [...products];

  if (sortKey === "PRICE") {
    sorted.sort(
      (first, second) =>
        Number(first.priceRange.minVariantPrice.amount) -
        Number(second.priceRange.minVariantPrice.amount),
    );
  } else if (sortKey === "TITLE") {
    sorted.sort((first, second) => first.title.localeCompare(second.title));
  } else if (sortKey === "CREATED" || sortKey === "CREATED_AT") {
    sorted.sort((first, second) =>
      second.updatedAt.localeCompare(first.updatedAt),
    );
  }

  if (reverse) {
    sorted.reverse();
  }

  return sorted;
}

export function getFallbackCollection(handle: string): Collection | undefined {
  if (!handle) {
    return {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: UPDATED_AT,
    };
  }

  return fallbackCollections.find((collection) => collection.handle === handle);
}

export function getFallbackCollectionProducts(
  handle: string,
  sortKey?: string,
  reverse?: boolean,
): Product[] {
  const collectionHandles = fallbackCollectionHandles[handle];

  if (!collectionHandles) {
    return [];
  }

  return sortProducts(
    fallbackProducts.filter((product) =>
      collectionHandles.includes(product.handle),
    ),
    sortKey,
    reverse,
  );
}

export function getFallbackMenu(handle: string): Menu[] {
  return handle.includes("footer") ? footerMenu : headerMenu;
}

export function getFallbackPage(handle: string): Page {
  return (
    fallbackPages.find((page) => page.handle === handle) || {
      id: `fallback-page-${handle}`,
      title: STORE_NAME,
      handle,
      body: `<p>${STORE_NAME} brings modern comfort to UK homes with a curated collection of stylish, efficient ceiling fans.</p>`,
      bodySummary:
        "Modern ceiling fans designed for stylish homes and compact flats.",
      seo: {
        title: `${STORE_NAME} | ${TAGLINE}`,
        description:
          "Modern ceiling fans designed for stylish UK homes and flats.",
      },
      createdAt: UPDATED_AT,
      updatedAt: UPDATED_AT,
    }
  );
}

export function getFallbackProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Product[] {
  const normalizedQuery = query?.trim().toLowerCase();
  const filteredProducts = normalizedQuery
    ? fallbackProducts.filter((product) => {
        const haystack = [
          product.title,
          product.description,
          product.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
    : fallbackProducts;

  return sortProducts(filteredProducts, sortKey, reverse);
}

export function getFallbackProductByHandle(
  handle: string,
): Product | undefined {
  return fallbackProducts.find((product) => product.handle === handle);
}

export function getFallbackProductById(productId: string): Product | undefined {
  return fallbackProducts.find((product) => product.id === productId);
}

export function getFallbackProductByVariantId(
  variantId: string,
): { product: Product; variant: ProductVariant } | undefined {
  for (const product of fallbackProducts) {
    const variant = product.variants.find(
      (candidate) => candidate.id === variantId,
    );

    if (variant) {
      return { product, variant };
    }
  }

  return undefined;
}

export function getFallbackProductRecommendations(
  productId: string,
): Product[] {
  return fallbackProducts
    .filter((product) => product.id !== productId)
    .slice(0, 2);
}

export function isFallbackVariantId(variantId: string): boolean {
  return variantId.startsWith("fallback-variant-");
}

export function isFallbackLineId(lineId: string): boolean {
  return lineId.startsWith("fallback-line-");
}
