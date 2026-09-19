import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MotionProvider from "../components/MotionProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "TWS Recommender",
    template: "%s | TWS Recommender",
  },
  description: "Sistem rekomendasi TWS berdasarkan preferensi audio pengguna",
  applicationName: "TWS Recommender",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "TWS Recommender",
    title: "TWS Recommender",
    description: "Temukan TWS berdasarkan preferensi audio dan kebutuhan Anda.",
  },
  twitter: {
    card: "summary",
    title: "TWS Recommender",
    description: "Temukan TWS berdasarkan preferensi audio dan kebutuhan Anda.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${inter.variable} ${interTight.variable}`}>
      <body className="bg-white text-[#1f1f1f] antialiased">
        <MotionProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}
