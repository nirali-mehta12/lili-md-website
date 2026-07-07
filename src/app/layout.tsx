import type { Metadata } from "next";
import "./globals.css";
import {
  Cormorant_Garamond,
  Jost,
  Lora,
  Montserrat,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import { cn } from "@/lib/utils";

// Fonts from the V5 design.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
// Fonts specific to the /apply access-gate page (per designer spec).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LiLi M.D. — The Private Club",
  description:
    "Run your practice AI-natively while retaining full ownership. Ten founding physicians. By invitation only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        playfair.variable,
        lora.variable,
        jost.variable,
        poppins.variable,
        cormorant.variable,
        montserrat.variable,
        "font-sans antialiased",
      )}
    >
      <body>{children}</body>
    </html>
  );
}
