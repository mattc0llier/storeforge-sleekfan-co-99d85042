import Link from "next/link";

import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { STORE_NAME, TAGLINE } from "lib/shopify/fallback-data";
import { getMenu } from "lib/shopify";
import { Suspense } from "react";

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : "");
  const skeleton = "h-6 w-full animate-pulse rounded-sm bg-neutral-200";
  const menu = await getMenu("next-js-frontend-footer-menu");

  return (
    <footer className="mt-12 border-t border-[var(--brand-border)] bg-white/70 text-sm text-[var(--brand-muted)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 text-sm md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-4 min-[1320px]:px-0">
        <div className="max-w-sm">
          <Link className="flex items-center gap-2 md:pt-1" href="/">
            <LogoSquare size="sm" />
            <span className="font-display text-sm font-bold tracking-wide text-[var(--brand-ink)]">
              {STORE_NAME}
            </span>
          </Link>
          <p className="mt-4 font-display text-lg font-semibold text-[var(--brand-ink)]">
            {TAGLINE}
          </p>
          <p className="mt-3 leading-6">
            Quiet airflow, efficient lighting, and sculpted finishes for
            design-conscious homes, compact flats, and modern open-plan spaces.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex h-[188px] w-[200px] flex-col gap-2">
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>
        <div className="md:ml-auto md:max-w-xs">
          <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-ink)]">
            Modern Comfort
          </p>
          <p className="mt-3 leading-6">
            A compact collection built around whisper-quiet motors, smart
            control, and finishes that sit cleanly in contemporary interiors.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--brand-border)] py-6 text-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 md:flex-row md:items-center md:px-4 min-[1320px]:px-0">
          <p>
            &copy; {copyrightDate} {STORE_NAME}. All rights reserved.
          </p>
          <p className="md:ml-auto">
            Curated ceiling fans for calm bedrooms, living rooms, and compact UK
            interiors.
          </p>
        </div>
      </div>
    </footer>
  );
}
