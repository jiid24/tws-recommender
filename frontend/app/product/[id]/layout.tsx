import type { Metadata } from "next";
import { API_BASE_URL } from "../../../lib/api";
import type { Product } from "../../../lib/types";

type ProductLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

function getImageUrl(product: Product) {
  if (!product.image_url) return undefined;
  return /^(https?:\/\/|\/)/.test(product.image_url)
    ? product.image_url
    : `/${product.image_url}`;
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/tws/${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(1_500),
    });

    if (!response.ok) throw new Error("Produk tidak ditemukan");
    const product = (await response.json()) as Product;
    const description = product.deskripsi || `${product.nama} dari ${product.brand}, tersedia di katalog TWS Recommender.`;
    const image = getImageUrl(product);

    return {
      title: product.nama,
      description,
      openGraph: {
        title: `${product.nama} — ${product.brand}`,
        description,
        images: image ? [{ url: image, alt: product.nama }] : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: product.nama,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      title: "Detail Produk TWS",
      description: "Detail spesifikasi produk TWS dalam katalog TWS Recommender.",
    };
  }
}

export default function ProductDetailLayout({ children }: ProductLayoutProps) {
  return children;
}
