import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Radhaan — Bridal Wear Rental & Purchase",
    template: "%s | Radhaan",
  },
  description:
    "Rent or purchase premium Lehengas and Jewellery for weddings, receptions, and festive occasions. Luxury bridal fashion, made affordable.",
  keywords: ["bridal lehenga rental", "jewellery rental", "wedding outfit", "Radhaan", "bridal fashion India"],
  openGraph: {
    title: "Radhaan — Bridal Wear Rental & Purchase",
    description: "Premium bridal lehengas and jewellery — rent or buy.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[var(--surface-bg)] text-[var(--text-primary)]`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
