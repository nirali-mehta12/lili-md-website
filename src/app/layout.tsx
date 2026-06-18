import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Lora, Jost, Poppins } from "next/font/google";
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
        "font-sans antialiased",
      )}
    >
      <body>{children}</body>
    </html>
  );
}
