import type { Metadata } from "next";
// PLACEHOLDER FONTS — swap these two imports for the exact Canva fonts later.
//  - Heading: an elegant serif (placeholder: Playfair Display)
//  - Body:    a clean sans-serif (placeholder: Inter)
// If the real fonts aren't on Google Fonts, we switch to next/font/local
// and drop the .woff2 files in src/app/fonts/. Only this file changes.
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const heading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
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
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
