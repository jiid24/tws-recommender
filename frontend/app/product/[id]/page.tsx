"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Battery,
  Shield,
  Gamepad2,
  Bluetooth,
  Droplets,
  Mic,
  Plug,
  CircleDot,
  Disc3,
  Headphones,
  ShieldCheck,
} from "lucide-react";

import { API_BASE_URL } from "../../../lib/api";
import type { Product } from "../../../lib/types";

const ADVANCED_CODEC_REGEX = /(LDAC|LHDC|aptX HD|aptX Adaptive|aptX Lossless|Hi-?Res)/i;
const ADVANCED_CODEC_REGEX_BROAD = /(LDAC|LHDC|aptX|LC3|SSC|L2HC|Hi-?Res)/i;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function getProductImage(p: Product): string {
  if (!p.image_url) return "/images/no-image.svg";
  return /^(https?:\/\/|\/)/.test(p.image_url) ? p.image_url : `/${p.image_url}`;
}

type TargetUser = {
  title: string;
  description: string;
  icon: typeof Bluetooth;
  iconColor: string;
  iconBg: string;
};

function getTargetUsers(product: Product): TargetUser[] {
  const result: TargetUser[] = [];

  if (product.karakter_suara === "bass") {
    result.push({
      title: "Penyuka bass kuat",
      description:
        "Cocok untuk genre EDM, hip-hop, atau RnB yang mengandalkan dentuman low-end yang dalam dan bertenaga.",
      icon: Disc3,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    });
  }
  if (product.karakter_suara === "treble") {
    result.push({
      title: "Pendengar detail dan vokal",
      description:
        "Karakter terang yang ideal untuk pop, akustik, atau podcast — vokal dan instrumen terdengar jelas.",
      icon: Disc3,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    });
  }
  if (product.karakter_suara === "balance") {
    result.push({
      title: "Pendengar serba bisa",
      description:
        "Tuning seimbang yang nyaman untuk berbagai genre — pilihan aman bagi yang mendengarkan musik beragam.",
      icon: Disc3,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    });
  }
  if (product.anc) {
    result.push({
      title: "Pekerja dan komuter",
      description:
        "Active Noise Cancellation membantu meredam bising kantor, kafe, atau transportasi umum agar fokus tetap terjaga.",
      icon: Shield,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    });
  }
  if (product.gaming) {
    result.push({
      title: "Gamer dan penonton film",
      description:
        "Mode latensi rendah membuat audio tetap sinkron dengan visual saat bermain game atau menonton.",
      icon: Gamepad2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    });
  }
  if (product.battery_hours >= 48) {
    result.push({
      title: "Pengguna intensif & perjalanan jauh",
      description: `Total baterai ${product.battery_hours} jam (earbud + case) sangat memadai untuk pemakaian seharian tanpa khawatir kehabisan daya.`,
      icon: Battery,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    });
  } else if (product.battery_hours >= 36) {
    result.push({
      title: "Pemakai harian penuh",
      description: `Daya tahan ${product.battery_hours} jam cukup untuk pemakaian harian intensif dengan sedikit pengisian ulang.`,
      icon: Battery,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    });
  }
  if (product.codec && ADVANCED_CODEC_REGEX.test(product.codec)) {
    result.push({
      title: "Dukungan codec produk",
      description: `Produk ini mencantumkan codec ${product.codec} sebagai bagian dari spesifikasi audio.`,
      icon: Bluetooth,
      iconColor: "text-fuchsia-600",
      iconBg: "bg-fuchsia-50",
    });
  }
  if (product.water_resistance) {
    const wr = product.water_resistance.toUpperCase();
    if (/IPX?[4-9]|IP[5-9]\d?/.test(wr)) {
      result.push({
        title: "Pengguna aktif dan olahraga",
        description: `Rating ${product.water_resistance} tahan keringat dan cipratan air, aman dipakai gym, lari, atau aktivitas outdoor.`,
        icon: Droplets,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-50",
      });
    }
  }
  if (product.mic_count != null && product.mic_count >= 4) {
    result.push({
      title: "Sering rapat dan video call",
      description: `${product.mic_count} mikrofon dengan beamforming menghasilkan suara panggilan yang lebih jernih di lingkungan bising.`,
      icon: Mic,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    });
  }
  if (product.harga <= 300_000) {
    result.push({
      title: "Pencari TWS hemat",
      description:
        "Harga ramah kantong, cocok untuk pelajar atau pengguna yang baru pertama kali mencoba TWS.",
      icon: CircleDot,
      iconColor: "text-slate-500",
      iconBg: "bg-slate-100",
    });
  } else if (product.harga >= 600_000) {
    result.push({
      title: "Pencari kualitas kelas atas",
      description:
        "Berada di tingkat harga teratas pada rentang ini — biasanya menawarkan fitur dan kualitas suara yang lebih matang.",
      icon: CircleDot,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    });
  }

  return result;
}

function ProductDetailSkeleton() {
  return (
    <main className="font-body min-h-screen bg-white" role="status" aria-label="Memuat detail produk">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <div className="h-9 w-40 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-12 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="h-[27rem] animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
      <span className="sr-only">Memuat detail produk…</span>
    </main>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        // Produk terkait dihitung di server (endpoint /related) sehingga
        // halaman detail tidak perlu mengunduh seluruh katalog.
        const [detailRes, relatedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tws/${id}`, { cache: "no-store" }),
          fetch(`${API_BASE_URL}/tws/${id}/related?limit=4`, { cache: "no-store" }),
        ]);
        if (!detailRes.ok) throw new Error("Gagal memuat detail produk");
        const detail: Product = await detailRes.json();
        const relatedJson = relatedRes.ok ? await relatedRes.json() : { products: [] };
        const combined: Product[] = relatedJson.products ?? [];

        if (!cancelled) {
          setProduct(detail);
          setRelated(combined);
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
  }, [id, reloadKey]);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <main className="font-body relative min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <p className="text-sm font-medium text-red-700">
            {error ?? "Produk tidak ditemukan."}
          </p>
          {error && (
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Coba lagi
            </button>
          )}
          <Link
            href="/product"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Katalog
          </Link>
        </div>
      </main>
    );
  }

  const targetUsers = getTargetUsers(product);

  const specs = [
    product.bluetooth_version && {
      label: "Bluetooth",
      value: product.bluetooth_version,
      icon: Bluetooth,
      iconColor: "text-violet-600",
    },
    product.codec && {
      label: "Codec",
      value: product.codec,
      icon: Disc3,
      iconColor: "text-fuchsia-600",
    },
    product.water_resistance && {
      label: "Water Resistance",
      value: product.water_resistance,
      icon: Droplets,
      iconColor: "text-blue-500",
    },
    product.driver_size && {
      label: "Driver Size",
      value: product.driver_size,
      icon: CircleDot,
      iconColor: "text-slate-500",
    },
    product.mic_count != null && {
      label: "Mic Count",
      value: product.mic_count,
      icon: Mic,
      iconColor: "text-emerald-600",
    },
    product.charging_port && {
      label: "Charging Port",
      value: product.charging_port,
      icon: Plug,
      iconColor: "text-amber-600",
    },
  ].filter(Boolean) as {
    label: string;
    value: string | number;
    icon: typeof Bluetooth;
    iconColor: string;
    capitalize?: boolean;
  }[];

  return (
    <main className="font-body relative min-h-screen bg-white text-slate-900">
      {/* ── HERO ── */}
      <section className="relative grid-pattern overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-violet-50/80 pointer-events-none" />
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:pt-10 lg:pb-12">
          {/* Back link */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <Link
              href="/product"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-600 backdrop-blur-sm transition hover:border-violet-300 hover:text-violet-700"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Kembali ke Katalog
            </Link>
          </motion.div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            {/* LEFT — Info */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
            >
              <motion.p
                variants={fadeUp}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700"
              >
                {product.brand}
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="font-display mt-3 text-[2rem] leading-[1.1] text-slate-950 md:text-[2.5rem]"
              >
                {product.nama}
              </motion.h1>

              {/* Highlight spec grid (4 key features) */}
              <motion.div
                variants={fadeUp}
                className="mt-6 grid gap-2.5 sm:grid-cols-2"
              >
                {[
                  {
                    label: "Karakter Suara",
                    value: product.karakter_suara,
                    icon: Disc3,
                    iconColor: "text-violet-600",
                    iconBg: "bg-violet-50",
                    capitalize: true,
                  },
                  {
                    label: "Baterai",
                    value: `${product.battery_hours} jam`,
                    icon: Battery,
                    iconColor: "text-emerald-600",
                    iconBg: "bg-emerald-50",
                  },
                  {
                    label: "ANC",
                    value: product.anc ? "Ya" : "Tidak",
                    icon: Shield,
                    iconColor: "text-blue-600",
                    iconBg: "bg-blue-50",
                  },
                  {
                    label: "Mode Gaming",
                    value: product.gaming ? "Ya" : "Tidak",
                    icon: Gamepad2,
                    iconColor: "text-amber-600",
                    iconBg: "bg-amber-50",
                  },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 backdrop-blur-sm transition-colors hover:border-violet-200"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${spec.iconBg}`}
                    >
                      <spec.icon
                        className={`h-4 w-4 ${spec.iconColor}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {spec.label}
                      </p>
                      <p
                        className={`mt-0.5 text-sm font-semibold text-slate-900 ${
                          spec.capitalize ? "capitalize" : ""
                        }`}
                      >
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Description */}
              <motion.div
                variants={fadeUp}
                className="mt-6 rounded-2xl border border-slate-100 bg-white/70 p-5 backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Deskripsi
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {product.deskripsi || "Belum ada deskripsi untuk produk ini."}
                </p>
              </motion.div>
            </motion.div>

            {/* RIGHT — Image & Price */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.18)] lg:sticky lg:top-24"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-linear-to-br from-slate-50 to-violet-50/30">
                <Image
                  src={getProductImage(product)}
                  alt={product.nama}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 90vw, 40vw"
                />
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Harga
                </p>
                <p className="font-display mt-1 text-2xl text-slate-950">
                  Rp {product.harga.toLocaleString("id-ID")}
                </p>
              </div>

              <Link
                href="/recommend"
                className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-700 hover:gap-3"
              >
                Cari TWS Sesuai Preferensi
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DETAIL SECTION ── */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Cocok untuk */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-violet-200 hover:shadow-[0_8px_24px_-12px_rgba(124,58,237,0.2)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
              Cocok Untuk
            </p>
            <h2 className="font-display mt-2 text-xl text-slate-950">
              Siapa yang cocok pakai ini?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Berdasarkan karakter suara, fitur, dan spesifikasi produk, TWS ini
              paling pas untuk profil pengguna berikut:
            </p>

            {targetUsers.length > 0 ? (
              <motion.ul
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                }}
                className="mt-5 grid gap-3 sm:grid-cols-2"
              >
                {targetUsers.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={fadeUp}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-violet-200 hover:bg-white"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${item.iconColor}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Belum ada informasi tambahan mengenai target pengguna.
              </p>
            )}
          </motion.div>

          {/* Detail Spesifikasi */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-violet-200 hover:shadow-[0_8px_24px_-12px_rgba(124,58,237,0.2)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
              Spesifikasi
            </p>
            <h2 className="font-display mt-2 text-xl text-slate-950">
              Detail teknis
            </h2>

            {specs.length > 0 ? (
              <div className="mt-5 divide-y divide-slate-100">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <spec.icon
                        className={`h-4 w-4 ${spec.iconColor}`}
                        strokeWidth={1.75}
                      />
                      <span className="text-sm text-slate-500">
                        {spec.label}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold text-slate-900 ${
                        spec.capitalize ? "capitalize" : ""
                      }`}
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Belum ada detail spesifikasi tambahan.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="mb-8"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                Produk Terkait
              </p>
              <h2 className="font-display mt-2 text-xl text-slate-950 md:text-2xl">
                TWS lain yang mungkin Anda sukai
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pilihan dari brand yang sama atau berada di tier harga serupa.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {related.map((p) => {
                const pid = p._id ?? p.id ?? "";
                const hasAdvancedCodec = p.codec ? ADVANCED_CODEC_REGEX_BROAD.test(p.codec) : false;
                return (
                  <motion.div key={pid || p.nama} variants={fadeUp}>
                    <Link
                      href={`/product/${pid}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_12px_32px_-12px_rgba(124,58,237,0.3)]"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-linear-to-br from-slate-50 to-violet-50/30">
                        <Image
                          src={getProductImage(p)}
                          alt={p.nama}
                          fill
                          className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <span className="absolute left-3 top-3 rounded-full border border-violet-100 bg-white/90 px-2.5 py-1 text-[10px] font-semibold capitalize tracking-wide text-violet-700 backdrop-blur-sm">
                          {p.karakter_suara}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-500">
                          {p.brand}
                        </p>
                        <h3 className="font-display mt-1.5 line-clamp-2 text-[14px] leading-snug text-slate-950">
                          {p.nama}
                        </h3>
                        <div className="mt-3 flex items-center gap-1.5">
                          {p.anc && (
                            <span
                              title="ANC"
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-500"
                            >
                              <ShieldCheck className="h-3 w-3" strokeWidth={1.75} />
                            </span>
                          )}
                          {p.gaming && (
                            <span
                              title="Gaming"
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600"
                            >
                              <Gamepad2 className="h-3 w-3" strokeWidth={1.75} />
                            </span>
                          )}
                          {hasAdvancedCodec && (
                            <span
                              title="Codec produk"
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-fuchsia-50 text-fuchsia-600"
                            >
                              <Bluetooth className="h-3 w-3" strokeWidth={1.75} />
                            </span>
                          )}
                          {!p.anc && !p.gaming && !hasAdvancedCodec && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-50 text-slate-400">
                              <Headphones className="h-3 w-3" strokeWidth={1.75} />
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex-1" />
                        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Harga
                            </p>
                            <p className="font-display mt-0.5 text-sm text-slate-950">
                              Rp {p.harga.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-violet-600 group-hover:text-white">
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}
    </main>
  );
}
