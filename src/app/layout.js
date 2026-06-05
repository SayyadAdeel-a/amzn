import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "../components/SmoothScroll";
import GlobalSpotlight from "../components/GlobalSpotlight";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://fifa26-lake.vercel.app"),
  title: "FIFA 2026 Gear | Trending Football Jerseys & Streetwear",
  description: "Shop trending football gear, official jerseys, and exclusive streetwear drops for the upcoming FIFA 2026 World Cup. Curated collection of top-rated Amazon finds.",
  keywords: ["FIFA 2026", "football gear", "soccer jerseys", "streetwear", "world cup apparel"],
  openGraph: {
    title: "FIFA 2026 Gear & Streetwear Drops",
    description: "Explore trending football fashion and official gear.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA 2026 Gear & Streetwear Drops",
    description: "Explore trending football fashion and official gear.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <SmoothScroll>
          <GlobalSpotlight />
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
