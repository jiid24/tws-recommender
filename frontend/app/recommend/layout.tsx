import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rekomendasi TWS",
  description: "Temukan rekomendasi TWS berdasarkan karakter suara, baterai, ANC, gaming, anggaran, dan ketahanan air.",
  openGraph: {
    title: "Rekomendasi TWS",
    description: "Temukan TWS yang paling sesuai dengan preferensi Anda.",
  },
};

export default function RecommendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
