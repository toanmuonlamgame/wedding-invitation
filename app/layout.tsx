import type { Metadata } from "next";
import {
  Be_Vietnam_Pro,
  Cormorant_Garamond,
  Dancing_Script,
  Lora,
  Manrope,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const loraFont = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const playfairFont = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const montserratFont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  display: "swap",
  preload: false,
});

const manropeFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  display: "swap",
  preload: false,
});

const scriptFont = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Thiệp cưới Vũ Bình & Thành Long",
  description: "Thiệp cưới trực tuyến cá nhân hóa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={[
        bodyFont.variable,
        displayFont.variable,
        loraFont.variable,
        playfairFont.variable,
        montserratFont.variable,
        manropeFont.variable,
        scriptFont.variable,
      ].join(" ")}
    >
      <body>{children}</body>
    </html>
  );
}
