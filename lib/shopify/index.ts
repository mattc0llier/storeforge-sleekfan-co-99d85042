import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "lib/constants";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
  revalidateTag,
} from "next/cache";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import {
  FALLBACK_CART_COOKIE,
  FALLBACK_CART_ID,
  fallbackCollections,
  fallbackPages,
  getFallbackCollection,
  getFallbackCollectionProducts,
  getFallbackMenu,
  getFallbackPage,
  getFallbackProductByHandle,
  getFallbackProductByVariantId,
  getFallbackProductRecommendations,
  getFallbackProducts,
  isFallbackLineId,
  isFallbackVariantId,
} from "./fallback-data";
import {
  Cart,
  CartItem,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : "";
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
const isShopifyConfigured = Boolean(endpoint && key);

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

type FallbackCartLine = {
  merchandiseId: string;
  quantity: number;
};

export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!isShopifyConfigured) {
      throw new Error("Shopify environment variables are not fully configured");
    }

    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount.currencyCode,
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines),
  };
};

const reshapeCollection = (
  collection: ShopifyCollection,
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`,
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

const getDefaultCollection = (): Collection => ({
  handle: "",
  title: "All",
  description: "All products",
  seo: {
    title: "All",
    description: "All products",
  },
  path: "/search",
  updatedAt: new Date().toISOString(),
});

const isFallbackCart = (cartId?: string) => cartId === FALLBACK_CART_ID;

const formatAmount = (amount: number) => amount.toFixed(2);

const parseFallbackCartLines = (value?: string): FallbackCartLine[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (line): line is FallbackCartLine =>
        typeof line?.merchandiseId === "string" &&
        typeof line?.quantity === "number" &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
};

async function readFallbackCartLines(): Promise<FallbackCartLine[]> {
  const cookieStore = await cookies();
  return parseFallbackCartLines(cookieStore.get(FALLBACK_CART_COOKIE)?.value);
}

const reshapeFallbackCartItem = (
  line: FallbackCartLine,
): CartItem | undefined => {
  const fallbackProduct = getFallbackProductByVariantId(line.merchandiseId);

  if (!fallbackProduct) {
    return undefined;
  }

  const { product, variant } = fallbackProduct;
  const lineAmount = formatAmount(Number(variant.price.amount) * line.quantity);

  return {
    id: `fallback-line-${variant.id}`,
    quantity: line.quantity,
    cost: {
      totalAmount: {
        amount: lineAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
};

const reshapeFallbackCart = (lines: FallbackCartLine[]): Cart => {
  const cartLines = lines
    .map((line) => reshapeFallbackCartItem(line))
    .filter(Boolean) as CartItem[];
  const totalQuantity = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const totalAmount = cartLines.reduce(
    (sum, line) => sum + Number(line.cost.totalAmount.amount),
    0,
  );
  const currencyCode = cartLines[0]?.cost.totalAmount.currencyCode || "USD";

  return {
    id: FALLBACK_CART_ID,
    checkoutUrl: "/",
    lines: cartLines,
    totalQuantity,
    cost: {
      subtotalAmount: {
        amount: formatAmount(totalAmount),
        currencyCode,
      },
      totalAmount: {
        amount: formatAmount(totalAmount),
        currencyCode,
      },
      totalTaxAmount: {
        amount: "0.00",
        currencyCode,
      },
    },
  };
};

async function writeFallbackCart(lines: FallbackCartLine[]): Promise<Cart> {
  const cookieStore = await cookies();
  const validLines = lines.filter(
    (line) => line.quantity > 0 && isFallbackVariantId(line.merchandiseId),
  );

  cookieStore.set("cartId", FALLBACK_CART_ID);
  cookieStore.set(FALLBACK_CART_COOKIE, JSON.stringify(validLines));

  return reshapeFallbackCart(validLines);
}

async function addToFallbackCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const currentLines = await readFallbackCartLines();
  const quantityByMerchandiseId = new Map(
    currentLines.map((line) => [line.merchandiseId, line.quantity]),
  );

  for (const line of lines) {
    if (!isFallbackVariantId(line.merchandiseId)) {
      continue;
    }

    quantityByMerchandiseId.set(
      line.merchandiseId,
      (quantityByMerchandiseId.get(line.merchandiseId) || 0) + line.quantity,
    );
  }

  return writeFallbackCart(
    Array.from(quantityByMerchandiseId.entries()).map(
      ([merchandiseId, quantity]) => ({
        merchandiseId,
        quantity,
      }),
    ),
  );
}

async function removeFromFallbackCart(lineIds: string[]): Promise<Cart> {
  const currentLines = await readFallbackCartLines();
  const lineIdSet = new Set(lineIds);

  return writeFallbackCart(
    currentLines.filter(
      (line) => !lineIdSet.has(`fallback-line-${line.merchandiseId}`),
    ),
  );
}

async function updateFallbackCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const currentLines = await readFallbackCartLines();
  const quantityByMerchandiseId = new Map(
    currentLines.map((line) => [line.merchandiseId, line.quantity]),
  );

  for (const line of lines) {
    if (!isFallbackVariantId(line.merchandiseId)) {
      continue;
    }

    if (line.quantity <= 0) {
      quantityByMerchandiseId.delete(line.merchandiseId);
      continue;
    }

    quantityByMerchandiseId.set(line.merchandiseId, line.quantity);
  }

  return writeFallbackCart(
    Array.from(quantityByMerchandiseId.entries()).map(
      ([merchandiseId, quantity]) => ({
        merchandiseId,
        quantity,
      }),
    ),
  );
}

export async function createCart(): Promise<Cart> {
  if (!isShopifyConfigured) {
    return writeFallbackCart([]);
  }

  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  if (
    !isShopifyConfigured ||
    lines.some((line) => isFallbackVariantId(line.merchandiseId))
  ) {
    return addToFallbackCart(lines);
  }

  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value;

  if (
    !isShopifyConfigured ||
    isFallbackCart(cartId) ||
    lineIds.some((lineId) => isFallbackLineId(lineId))
  ) {
    return removeFromFallbackCart(lineIds);
  }

  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId: cartId!,
      lineIds,
    },
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value;

  if (
    !isShopifyConfigured ||
    isFallbackCart(cartId) ||
    lines.some((line) => isFallbackVariantId(line.merchandiseId))
  ) {
    return updateFallbackCart(lines);
  }

  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId: cartId!,
      lines,
    },
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  "use cache: private";
  cacheTag(TAGS.cart);
  cacheLife("seconds");

  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId) {
    return undefined;
  }

  if (!isShopifyConfigured || isFallbackCart(cartId)) {
    return reshapeFallbackCart(await readFallbackCartLines());
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!isShopifyConfigured) {
    return getFallbackCollection(handle);
  }

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  if (!isShopifyConfigured) {
    console.log(
      `Skipping getCollectionProducts for '${collection}' - Shopify not configured`,
    );
    return getFallbackCollectionProducts(collection, sortKey, reverse);
  }

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
    },
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products),
  );
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!isShopifyConfigured) {
    console.log("Skipping getCollections - Shopify not configured");
    return [getDefaultCollection(), ...fallbackCollections];
  }

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    getDefaultCollection(),
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith("hidden"),
    ),
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!isShopifyConfigured) {
    console.log(`Skipping getMenu for '${handle}' - Shopify not configured`);
    return getFallbackMenu(handle);
  }

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url
        .replace(domain, "")
        .replace("/collections", "/search")
        .replace("/pages", ""),
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  if (!isShopifyConfigured) {
    return getFallbackPage(handle);
  }

  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  if (!isShopifyConfigured) {
    return fallbackPages;
  }

  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  if (!isShopifyConfigured) {
    console.log(`Skipping getProduct for '${handle}' - Shopify not configured`);
    return getFallbackProductByHandle(handle);
  }

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  if (!isShopifyConfigured) {
    return getFallbackProductRecommendations(productId);
  }

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  if (!isShopifyConfigured) {
    return getFallbackProducts({ query, reverse, sortKey });
  }

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, "seconds");
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
