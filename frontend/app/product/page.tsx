"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  Headphones,
  ShieldCheck,
  Gamepad2,
  Bluetooth,
  ArrowUpRight,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { API_BASE_URL } from "../../lib/api";
import type { Product } from "../../lib/types";
import SectionEyebrow from "../../components/ui/SectionEyebrow";

type SortKey = "price-asc" | "price-desc" | "name-asc";
type PriceTierKey = "all" | "low" | "mid" | "high";

const ADVANCED_CODEC_REGEX = /(LDAC|LHDC|aptX|LC3|SSC|L2HC|Hi-?Res)/i;
const PRODUCTS_PER_PAGE = 12;

// Rentang harga menyesuaikan ruang lingkup penelitian (produk TWS di bawah
// Rp1.000.000). Batas atas tiap tingkat memakai perbandingan < (eksklusif),
// sehingga tidak ada produk yang terhitung dua kali antar tingkat.
const PRICE_TIERS: {
  key: PriceTierKey;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "all", label: "Semua", min: 0, max: Infinity },
  { key: "low", label: "< Rp300rb", min: 0, max: 300_000 },
  { key: "mid", label: "Rp300–600rb", min: 300_000, max: 600_000 },
  { key: "high", label: "≥ Rp600rb", min: 600_000, max: Infinity },
];

function getProductImage(p: Product): string {
  if (!p.image_url) return "/images/no-image.svg";
  return /^(https?:\/\/|\/)/.test(p.image_url) ? p.image_url : `/${p.image_url}`;
}

function getProductId(p: Product): string {
  return p._id ?? p.id ?? "";
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function CatalogSkeleton() {
  return (
    <div aria-label="Memuat katalog produk" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="status">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="aspect-square animate-pulse bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-7 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 h-px bg-slate-100" />
            <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
      <span className="sr-only">Memuat katalog produk…</span>
    </div>
  );
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("price-asc");
  const [priceTier, setPriceTier] = useState<PriceTierKey>("all");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const toggleBrand = (brand: string) => {
    setPage(1);
    setBrandFilter((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const clearAllFilters = () => {
    setQuery("");
    setPriceTier("all");
    setBrandFilter(new Set());
    setPage(1);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateSort = (value: SortKey) => {
    setSortKey(value);
    setPage(1);
  };

  const updatePriceTier = (value: PriceTierKey) => {
    setPriceTier(value);
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/tws`);
        if (!res.ok) throw new Error("Gagal memuat data produk");
        const json = await res.json();
        if (!cancelled) {
          setProducts(json.products ?? []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const topBrands = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) =>
      counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1),
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name]) => name);
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;
    if (q) {
      list = list.filter(
        (p) =>
          p.nama.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q),
      );
    }
    if (priceTier !== "all") {
      const tier = PRICE_TIERS.find((t) => t.key === priceTier)!;
      list = list.filter((p) => p.harga >= tier.min && p.harga < tier.max);
    }
    if (brandFilter.size > 0) {
      list = list.filter((p) => brandFilter.has(p.brand));
    }
    const sorted = [...list];
    switch (sortKey) {
      case "price-asc":
        sorted.sort((a, b) => a.harga - b.harga);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.harga - a.harga);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.nama.localeCompare(b.nama));
        break;
    }
    return sorted;
  }, [products, query, sortKey, priceTier, brandFilter]);

  const hasActiveFilter =
    query.trim() !== "" || priceTier !== "all" || brandFilter.size > 0;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const firstProductIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filtered.slice(
    firstProductIndex,
    firstProductIndex + PRODUCTS_PER_PAGE,
  );

  return (
    <main className="font-body relative min-h-screen bg-white text-slate-900">
      {/* ── HEADER ── */}
      <section className="relative grid-pattern overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-violet-50/80 pointer-events-none" />
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp}>
              <SectionEyebrow>Katalog Produk</SectionEyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display mt-5 text-[2rem] leading-[1.1] text-slate-950 md:text-[2.5rem]"
            >
              Telusuri seluruh koleksi TWS dalam basis data.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600"
            >
              Jelajahi katalog produk TWS yang tersedia, lengkap dengan ringkasan
              spesifikasi dan rentang harga.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex items-center gap-6 border-t border-slate-100 pt-5"
            >
              <div>
                <p className="font-display text-2xl text-slate-900">
                  {products.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Produk Tersedia</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="font-display text-2xl text-slate-900">
                  {filtered.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Hasil Sesuai Filter</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="sticky top-[65px] z-20 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={1.75}
            />
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Cari berdasarkan nama atau brand…"
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
            />
            <label htmlFor="catalog-search" className="sr-only">
              Cari produk berdasarkan nama atau brand
            </label>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown
              className="h-4 w-4 text-slate-400"
              strokeWidth={1.75}
            />
            <label htmlFor="catalog-sort" className="text-xs font-medium text-slate-500">
              Urutkan:
            </label>
            <select
              id="catalog-sort"
              value={sortKey}
              onChange={(e) => updateSort(e.target.value as SortKey)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-violet-300 focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-100"
            >
              <option value="price-asc">Harga termurah</option>
              <option value="price-desc">Harga termahal</option>
              <option value="name-asc">Nama (A–Z)</option>
            </select>
          </div>
          <button
            type="button"
            aria-controls="mobile-catalog-filters"
            aria-expanded={filterPanelOpen}
            onClick={() => setFilterPanelOpen((open) => !open)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
            Filter{hasActiveFilter ? " aktif" : ""}
          </button>
        </div>
      </section>

      {/* ── FILTER CHIPS ── */}
      {!loading && !error && products.length > 0 && (
        <section
          id="mobile-catalog-filters"
          className={`overflow-hidden border-b border-slate-100 bg-white transition-[max-height,opacity] duration-300 lg:max-h-none lg:opacity-100 ${
            filterPanelOpen ? "max-h-[44rem] opacity-100" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
            {/* Price tier chips */}
            <div role="group" aria-label="Filter harga" className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Harga
              </span>
              {PRICE_TIERS.map((tier) => {
                const active = priceTier === tier.key;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updatePriceTier(tier.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "border-violet-300 bg-violet-50 text-violet-700 shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>

            {/* Brand chips */}
            {topBrands.length > 0 && (
              <div role="group" aria-label="Filter brand" className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Brand
                </span>
                {topBrands.map((brand) => {
                  const active = brandFilter.has(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleBrand(brand)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "border-violet-300 bg-violet-50 text-violet-700 shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active filter indicator */}
            {hasActiveFilter && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  Filter aktif:
                </span>
                {query.trim() && (
                  <button
                    type="button"
                    aria-label={`Hapus filter pencarian ${query.trim()}`}
                    onClick={() => updateQuery("")}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-violet-700"
                  >
                    “{query.trim()}”
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                )}
                {priceTier !== "all" && (
                  <button
                    type="button"
                    aria-label="Hapus filter harga"
                    onClick={() => updatePriceTier("all")}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-violet-700"
                  >
                    {PRICE_TIERS.find((t) => t.key === priceTier)?.label}
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                )}
                {Array.from(brandFilter).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    aria-label={`Hapus filter brand ${brand}`}
                    onClick={() => toggleBrand(brand)}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-violet-700"
                  >
                    {brand}
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="ml-1 text-xs font-medium text-violet-700 underline-offset-2 hover:underline"
                >
                  Hapus semua
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── GRID ── */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {loading && <CatalogSkeleton />}

        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <p className="mt-1 text-xs text-red-500">
              Pastikan server backend berjalan di {API_BASE_URL}.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <Search className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Tidak ada produk yang cocok
            </p>
            <p className="text-xs text-slate-500">
              Coba ubah kata kunci pencarian.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="mb-5 text-sm text-slate-500" aria-live="polite" aria-atomic="true">
              Menampilkan {firstProductIndex + 1}–{Math.min(firstProductIndex + PRODUCTS_PER_PAGE, filtered.length)} dari {filtered.length} produk
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((p, idx) => {
              const id = getProductId(p);
              const hasAdvancedCodec = p.codec ? ADVANCED_CODEC_REGEX.test(p.codec) : false;
              return (
                <div key={id || p.nama}>
                  <Link
                    href={`/product/${id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_12px_32px_-12px_rgba(124,58,237,0.3)]"
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-linear-to-br from-slate-50 to-violet-50/30">
                      <Image
                        src={getProductImage(p)}
                        alt={p.nama}
                        fill
                        loading={idx < 8 ? "eager" : "lazy"}
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Badge top-left: karakter suara */}
                      <span className="absolute left-3 top-3 rounded-full border border-violet-100 bg-white/90 px-2.5 py-1 text-[10px] font-semibold capitalize tracking-wide text-violet-700 backdrop-blur-sm">
                        {p.karakter_suara}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-500">
                        {p.brand}
                      </p>
                      <h3 className="font-display mt-1.5 line-clamp-2 text-[15px] leading-snug text-slate-950">
                        {p.nama}
                      </h3>

                      {/* Feature icons */}
                      <div className="mt-3 flex items-center gap-1.5 text-slate-400">
                        {p.anc && (
                          <span
                            title="Active Noise Cancellation"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                        )}
                        {p.gaming && (
                          <span
                            title="Mode Gaming"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
                          >
                            <Gamepad2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                        )}
                        {hasAdvancedCodec && (
                          <span
                            title="Codec produk"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600"
                          >
                            <Bluetooth className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                        )}
                        {!p.anc && !p.gaming && !hasAdvancedCodec && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                            <Headphones className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                        )}
                      </div>

                      {/* Spacer */}
                      <div className="mt-4 flex-1" />

                      {/* Price + arrow */}
                      <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Harga
                          </p>
                          <p className="font-display mt-0.5 text-base text-slate-950">
                            Rp {p.harga.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-violet-600 group-hover:text-white">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
            </div>
            {totalPages > 1 && (
              <nav aria-label="Navigasi halaman katalog" className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-current={currentPage === pageNumber ? "page" : undefined}
                      aria-label={`Halaman ${pageNumber}`}
                      className={`h-10 min-w-10 rounded-full border px-3 text-sm font-semibold transition ${
                        currentPage === pageNumber
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
