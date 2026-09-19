# TWS Recommender — Frontend

UI sistem rekomendasi True Wireless Stereo (TWS) berbasis preferensi pengguna. Dibangun dengan **Next.js 16 (App Router)**, **React 19**, dan **Tailwind CSS v4**.

## Tech Stack

- **Next.js 16** — App Router + Turbopack
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **lucide-react** — icon set
- **Inter** & **Inter Tight** — Google Fonts

## Struktur Folder

```
frontend/
├── app/
│   ├── layout.tsx            # Root layout (Navbar + Footer)
│   ├── page.tsx              # Landing page
│   ├── globals.css           # Tailwind + custom utilities
│   ├── faq/                  # FAQ istilah TWS & cara kerja rekomendasi
│   ├── recommend/            # Form preferensi + hasil rekomendasi
│   └── product/[id]/         # Detail produk
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PreferenceForm.tsx
│   └── RecommendationList.tsx
├── lib/
│   └── api.ts                # Konstanta API_BASE_URL
└── public/images/            # Gambar statis (fallback no-image, dll)
```

## Menjalankan

Pastikan **backend** sudah jalan di `http://localhost:8000` (lihat `../backend/README` jika ada, atau `../README.md`).

```bash
npm install
npm run dev
```

App akan jalan di [http://localhost:3000](http://localhost:3000).

## Environment Variables

Buat file `.env.local` di folder ini (opsional — ada fallback ke `localhost:8000`):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Saat deploy ke production, ganti dengan URL API publik:

```
NEXT_PUBLIC_API_URL=https://api.tws-recommender.com
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.example
```

> Variabel **wajib** berawalan `NEXT_PUBLIC_` agar bisa diakses dari browser.

`NEXT_PUBLIC_SITE_URL` dipakai untuk membentuk URL absolut pada metadata dan preview saat link dibagikan.

## Scripts

| Command | Keterangan |
|---|---|
| `npm run dev` | Jalankan development server (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build production |
| `npm run lint` | ESLint check |
| `python scripts/visual_qa.py` | Cek layout utama pada 375, 768, 1024, dan 1440 px |

## Halaman

| Route | Deskripsi |
|---|---|
| `/` | Landing page dengan hero & overview fitur |
| `/recommend` | Form input preferensi → hasil rekomendasi top 5 |
| `/product/[id]` | Detail spesifikasi produk TWS |
| `/faq` | FAQ istilah TWS & penjelasan cara kerja rekomendasi |
