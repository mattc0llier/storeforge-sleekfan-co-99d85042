import Footer from "components/layout/footer";
import Image from "next/image";
import Link from "next/link";
import {
  HERO_PRODUCT_HANDLE,
  HOMEPAGE_HEADLINE,
  HOMEPAGE_SUBHEADING,
  STORE_NAME,
  TAGLINE,
} from "lib/shopify/fallback-data";
import { getProduct, getProducts } from "lib/shopify";

export const metadata = {
  description: HOMEPAGE_SUBHEADING,
  openGraph: {
    description: HOMEPAGE_SUBHEADING,
    title: `${STORE_NAME} | ${TAGLINE}`,
    type: "website",
  },
};

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default async function HomePage() {
  const [products, heroCandidate] = await Promise.all([
    getProducts({}),
    getProduct(HERO_PRODUCT_HANDLE),
  ]);
  const heroProduct = heroCandidate || products[0];
  const featuredProducts = products.slice(0, 3);

  return (
    <>
      <div className="border-b border-[var(--brand-border)] bg-white/60">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-[var(--brand-accent)]">
              {STORE_NAME}
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--brand-muted)]">
              {TAGLINE}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-5xl lg:text-6xl">
              {HOMEPAGE_HEADLINE}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--brand-muted)] sm:text-lg">
              {HOMEPAGE_SUBHEADING}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand-accent)]/20 transition-all hover:shadow-xl hover:shadow-[var(--brand-accent)]/30"
              >
                Shop The Collection
              </Link>
              {heroProduct ? (
                <Link
                  href={`/product/${heroProduct.handle}`}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--brand-border)] px-6 py-3 text-sm font-medium text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                >
                  Explore {heroProduct.title}
                </Link>
              ) : null}
            </div>
            <div className="mt-10 grid gap-4 text-sm text-[var(--brand-muted)] sm:grid-cols-3">
              <div className="rounded-3xl border border-[var(--brand-border)] bg-white/70 px-4 py-4">
                Quiet motors for bedrooms and open-plan living.
              </div>
              <div className="rounded-3xl border border-[var(--brand-border)] bg-white/70 px-4 py-4">
                Energy-smart lighting and efficient airflow.
              </div>
              <div className="rounded-3xl border border-[var(--brand-border)] bg-white/70 px-4 py-4">
                Clean lines that suit modern UK homes and flats.
              </div>
            </div>
          </div>
          {heroProduct ? (
            <Link
              href={`/product/${heroProduct.handle}`}
              className="group block"
            >
            <div
              className="relative overflow-hidden rounded-[2rem] border border-[var(--brand-border)] p-4"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, rgba(245, 245, 244, 0.95) 100%)",
                boxShadow: "0 24px 80px rgba(28, 25, 23, 0.08)",
              }}
            >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-stone-100 to-stone-50">
                  <Image
                    src={heroProduct.featuredImage.url}
                    alt={heroProduct.featuredImage.altText}
                    fill
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-accent)]">
                      Hero Pick
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-[var(--brand-ink)]">
                      {heroProduct.title}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[var(--brand-muted)]">
                      Smart airflow, refined finishes, and a calm silhouette for
                      contemporary interiors.
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-[var(--brand-ink)]">
                    {formatPrice(
                      heroProduct.priceRange.minVariantPrice.amount,
                      heroProduct.priceRange.minVariantPrice.currencyCode,
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ) : null}
        </section>
      </div>
      {featuredProducts.length ? (
        <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 lg:py-20">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-[var(--brand-accent)]">
                Curated Fans
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--brand-ink)] lg:text-4xl">
                Minimal forms. Quiet performance.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--brand-muted)]">
              {STORE_NAME} focuses on a concise collection that pairs modern
              aesthetics with energy-conscious airflow and everyday ease.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--brand-border)] bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50">
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-bold text-[var(--brand-ink)]">
                      {product.title}
                    </h3>
                    <p className="whitespace-nowrap text-sm font-semibold text-[var(--brand-ink)]">
                      {formatPrice(
                        product.priceRange.minVariantPrice.amount,
                        product.priceRange.minVariantPrice.currencyCode,
                      )}
                    </p>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[var(--brand-muted)]">
                    {product.description}
                  </p>
                  <p className="mt-5 text-sm font-medium text-[var(--brand-accent)]">
                    View details
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <Footer />
    </>
  );
}
