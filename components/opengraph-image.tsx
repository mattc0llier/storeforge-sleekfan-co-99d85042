import { BUSINESS_IDEA, STORE_NAME, TAGLINE } from "lib/shopify/fallback-data";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import LogoIcon from "./icons/logo";

export type Props = {
  title?: string;
};

export default async function OpengraphImage(
  props?: Props,
): Promise<ImageResponse> {
  const { title } = {
    ...{
      title: STORE_NAME,
    },
    ...props,
  };

  const file = await readFile(join(process.cwd(), "./fonts/Inter-Bold.ttf"));
  const font = Uint8Array.from(file).buffer;

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col justify-between px-16 py-14"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div tw="flex items-center">
          <div
            tw="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ backgroundColor: "#111827" }}
          >
            <LogoIcon width="40" height="36" fill="#F9FAFB" />
          </div>
          <div tw="ml-6 flex flex-col">
            <p tw="text-xl font-bold" style={{ color: "#111827" }}>
              {STORE_NAME}
            </p>
            <p tw="text-lg" style={{ color: "#6B7280" }}>
              {TAGLINE}
            </p>
          </div>
        </div>
        <div tw="flex flex-col">
          <p
            tw="text-6xl font-bold leading-tight"
            style={{ color: "#111827", maxWidth: 920 }}
          >
            {title}
          </p>
          <p
            tw="mt-6 leading-snug"
            style={{ color: "#6B7280", fontSize: 28, maxWidth: 860 }}
          >
            {BUSINESS_IDEA}
          </p>
        </div>
        <div tw="flex items-center justify-between">
          <div
            tw="h-2 w-72 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          />
          <p tw="text-xl" style={{ color: "#6B7280" }}>
            Modern Comfort for UK Interiors
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
