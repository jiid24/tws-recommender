import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ TWS",
  description: "Penjelasan istilah, fitur, dan cara kerja rekomendasi TWS.",
  openGraph: {
    title: "FAQ TWS",
    description: "Pahami istilah dan fitur TWS sebelum memilih produk.",
  },
};

export default function FaqLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
