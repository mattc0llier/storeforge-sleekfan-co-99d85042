import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { Syne, DM_Sans } from "next/font/google";
import { BUSINESS_IDEA, STORE_NAME, TAGLINE } from "lib/shopify/fallback-data";
import { getCart } from "lib/shopify";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: STORE_NAME,
    template: `%s | ${STORE_NAME}`,
  },
  description: `${TAGLINE} ${BUSINESS_IDEA}`,
  openGraph: {
    description: `${TAGLINE} ${BUSINESS_IDEA}`,
    locale: "en_GB",
    siteName: STORE_NAME,
    title: STORE_NAME,
    type: "website",
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="en-GB" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-[var(--brand-bg)] font-sans text-[var(--brand-ink)] antialiased selection:bg-[var(--brand-accent)] selection:text-white">
        <CartProvider cartPromise={cart}>
          <Navbar />
          <main className="min-h-screen">
            {children}
            <Toaster closeButton />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
