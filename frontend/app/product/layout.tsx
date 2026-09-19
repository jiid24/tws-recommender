import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Produk TWS",
  description: "Jelajahi katalog TWS lengkap dengan harga dan ringkasan spesifikasi.",
  openGraph: {
    title: "Katalog Produk TWS",
    description: "Jelajahi katalog TWS berdasarkan brand, harga, dan fitur.",
  },
};

export default function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
