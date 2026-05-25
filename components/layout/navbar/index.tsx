import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { NAVBAR_WORDMARK } from "lib/shopify/fallback-data";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <nav className="relative z-40 flex items-center justify-between border-b border-[var(--brand-border)] bg-white/80 p-4 backdrop-blur lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center gap-4">
        <div className="flex w-full items-center md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-8"
          >
            <LogoSquare />
            <div className="ml-2 max-w-[120px] flex-none font-display text-sm font-bold tracking-wide text-[var(--brand-ink)] md:hidden lg:block">
              {NAVBAR_WORDMARK}
            </div>
          </Link>
          {menu.length ? (
            <ul className="hidden gap-5 text-sm md:flex md:items-center">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-[var(--brand-muted)] underline-offset-4 transition-colors hover:text-[var(--brand-ink)] hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
