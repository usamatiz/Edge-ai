import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";
import { Footer } from "@/components/ui";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdgeAi Realty - AI-Powered Real Estate Solutions",
  description: "Transform your real estate business with cutting-edge AI technology. Discover properties, analyze markets, and make smarter decisions.",
  keywords: ["real estate", "AI", "property", "market analysis", "EdgeAi"],
  authors: [{ name: "EdgeAi Realty" }],
  openGraph: {
    title: "EdgeAi Realty - AI-Powered Real Estate Solutions",
    description: "Transform your real estate business with cutting-edge AI technology.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdgeAi Realty - AI-Powered Real Estate Solutions",
    description: "Transform your real estate business with cutting-edge AI technology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50`}
      >
        <ErrorBoundary>
          <Header />
          <main className="pt-16 lg:pt-20">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
