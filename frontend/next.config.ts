import type { NextConfig } from "next";

// Host gambar eksternal yang diizinkan next/image, dibaca dari env
// IMAGE_REMOTE_HOSTS (daftar hostname dipisah koma, mis.
// "images.example.com,cdn.example.com"). Default kosong karena seluruh
// gambar produk disajikan lokal dari /public/images — ini menutup celah
// wildcard "**" sebelumnya yang mengizinkan optimasi gambar dari host mana
// pun. Tambahkan host di sini hanya jika memang memakai gambar remote.
const remoteImageHosts = (process.env.IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImageHosts.flatMap((hostname) => [
      { protocol: "https" as const, hostname },
      { protocol: "http" as const, hostname },
    ]),
  },
};

export default nextConfig;
