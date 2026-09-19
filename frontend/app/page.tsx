"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Headphones,
  AudioWaveform,
  BatteryFull,
  ShieldCheck,
  Gamepad2,
  Droplets,
  ArrowUpRight,
} from "lucide-react";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { API_BASE_URL } from "../lib/api";

const criteria = [
  {
    icon: AudioWaveform,
    title: "Karakter Suara",
    desc: "Pilih preferensi suara Anda — bass yang kuat, treble yang detail, atau seimbang di seluruh frekuensi.",
  },
  {
    icon: BatteryFull,
    title: "Daya Tahan Baterai",
    desc: "Sesuaikan dengan kebutuhan pemakaian harian, perjalanan jauh, hingga penggunaan intensif.",
  },
  {
    icon: ShieldCheck,
    title: "Active Noise Cancellation",
    desc: "Kurangi kebisingan sekitar saat bekerja, berkomuter, atau menikmati musik dengan tenang.",
  },
  {
    icon: Gamepad2,
    title: "Mode Gaming",
    desc: "Latensi rendah agar audio tetap sinkron saat bermain game maupun menonton video.",
  },
  {
    icon: Droplets,
    title: "Ketahanan Air",
    desc: "Pilih tingkat proteksi sesuai aktivitas, dari tahan keringat untuk olahraga hingga tahan cipratan dan semprotan air di luar ruangan.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tentukan Preferensi",
    desc: "Pilih karakter suara, daya tahan baterai, dan fitur pendukung sesuai kebutuhan Anda.",
  },
  {
    number: "02",
    title: "Proses Pencocokan",
    desc: "Sistem menghitung tingkat kecocokan preferensi Anda terhadap spesifikasi tiap produk.",
  },
  {
    number: "03",
    title: "Tinjau Rekomendasi",
    desc: "Telusuri produk paling sesuai beserta ringkasan spesifikasi dan alasan rekomendasinya.",
  },
];

const sampleResults = [
  { name: "Anker Soundcore Liberty 4 NC", tag: "Bass · ANC" },
  { name: "Xiaomi Redmi Buds 6 Lite", tag: "Bass · ANC" },
  { name: "Tecno Sonic 2", tag: "Treble · ANC" },
  { name: "EarFun Air 2", tag: "Treble · Gaming" },
  { name: "Soundcore K20i", tag: "Treble · Gaming" },
];

// ── Animated Counter (counts up when in view) ──
// ── Animation presets ──
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export default function HomePage() {
  // Jumlah produk diambil langsung dari basis data agar tidak basi saat
  // dataset berubah. Fallback null → tampil "—" sampai data termuat.
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Hanya butuh jumlah total (total_data), jadi minta 1 produk saja —
    // payload ~1 KB alih-alih mengunduh seluruh katalog (~50 KB).
    fetch(`${API_BASE_URL}/tws?limit=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        const total =
          typeof json.total_data === "number"
            ? json.total_data
            : Array.isArray(json.products)
              ? json.products.length
              : null;
        if (total !== null) setProductCount(total);
      })
      .catch(() => {
        /* biarkan fallback "—" jika backend tidak tersedia */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="font-body relative bg-white text-slate-900 overflow-hidden">
        {/* ── HERO ── */}
        <section className="relative grid-pattern flex min-h-[calc(100vh-72px)] items-center">
          <div className="absolute inset-0 bg-linear-to-br from-white via-violet-50/40 to-violet-100 pointer-events-none" />
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-violet-200/40 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-10 pb-12 md:grid-cols-2 md:items-center lg:gap-14">
            {/* Left */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
            >
              {/* Badge */}
              <motion.div variants={fadeUp}>
                <SectionEyebrow>Content-Based Filtering</SectionEyebrow>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="font-display mt-5 text-[2.25rem] leading-[1.08] text-slate-950 md:text-[2.75rem] lg:text-[3rem]"
              >
                Temukan TWS yang sesuai dengan preferensi Anda.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-md text-[15px] leading-7 text-slate-600"
              >
                Sistem rekomendasi berbasis preferensi audio dan kebutuhan
                teknis Anda, dicocokkan dengan spesifikasi setiap produk
                dalam basis data.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/recommend"
                  className="group inline-flex items-center gap-2 rounded-full bg-violet-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-800 hover:gap-3"
                >
                  Mulai Rekomendasi
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#cara-kerja"
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-violet-300 hover:text-violet-700 hover:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
                >
                  <span className="underline decoration-violet-300 decoration-2 underline-offset-4 group-hover:decoration-violet-500">
                    Pelajari Cara Kerja
                  </span>
                </Link>
              </motion.div>

              {/* Social proof strip with animated counters */}
              <motion.div
                variants={fadeUp}
                className="mt-7 flex items-center gap-6 border-t border-slate-100 pt-5"
              >
                <div>
                  <p className="font-display text-2xl text-slate-900">
                    {productCount ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Produk TWS</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="font-display text-2xl text-slate-900">
                    Top <span className="text-violet-600">5</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Rekomendasi</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="font-display text-2xl text-violet-700">
                    6
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Parameter Preferensi</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — Hero Visual with stagger */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.18)]">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-500">
                      Hasil rekomendasi
                    </span>
                  </div>
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
                    Top 5
                  </span>
                </div>

                {/* Items with stagger */}
                <motion.ul
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
                  }}
                  className="space-y-2.5"
                >
                  {sampleResults.map((p, i) => (
                    <motion.li
                      key={p.name}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
                      }}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      className={`flex items-center gap-3 rounded-2xl border bg-white p-3 transition-colors hover:border-violet-200 ${
                        i === 0 ? "border-violet-200 shadow-[0_0_0_3px_rgba(139,92,246,0.08)]" : "border-slate-100"
                      }`}
                    >
                      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${
                        i === 0 ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"
                      }`}>
                        <Headphones className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {p.tag}
                        </p>
                      </div>
                      <span className="font-display text-sm text-slate-400">
                        0{i + 1}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-[11px] text-slate-500">
                    Disesuaikan dengan preferensi
                  </p>
                  <span className="text-[11px] font-medium text-violet-700">
                    Berdasarkan kemiripan
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CRITERIA ── */}
        <section className="relative overflow-hidden bg-slate-950 py-24 md:py-28">
          <div className="absolute -top-40 left-1/2 h-72 w-160 -translate-x-1/2 rounded-full bg-violet-600/15 blur-2xl pointer-events-none" />
          <div className="relative mx-auto max-w-6xl px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="mb-12 max-w-2xl"
            >
              <motion.h2
                variants={fadeUp}
                className="font-display text-[1.85rem] leading-tight text-white md:text-[2.25rem]"
              >
                Lima kriteria dalam penilaian rekomendasi.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3 text-sm leading-7 text-slate-400"
              >
                Setiap preferensi dibandingkan dengan spesifikasi tiap produk,
                didukung anggaran sebagai batas penyaringan untuk menyusun
                rekomendasi yang relevan.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5"
            >
              {criteria.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="group relative bg-slate-950 p-6 transition-colors hover:bg-slate-900"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300 shadow-[0_0_24px_-4px_rgba(139,92,246,0.45)] transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── STEPS ── */}
        <section id="cara-kerja" className="relative py-24 md:py-28">
          <div className="relative mx-auto max-w-6xl px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="mb-10 max-w-2xl"
            >
              <motion.h2
                variants={fadeUp}
                className="font-display text-[1.85rem] text-slate-950 md:text-[2.25rem]"
              >
                Tiga langkah menuju rekomendasi terbaik.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3 text-sm leading-7 text-slate-600"
              >
                Alur kerja sistem dari input preferensi hingga hasil
                rekomendasi.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
              className="grid gap-6 md:grid-cols-3"
            >
              {steps.map((item, i) => (
                <motion.div
                  key={item.number}
                  variants={fadeUp}
                  className="relative"
                >
                  {i < steps.length - 1 && (
                    <div className="absolute top-10 left-full z-10 hidden w-6 border-t-2 border-dashed border-violet-200 md:block" />
                  )}
                  <div className="group h-full rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_12px_32px_-12px_rgba(124,58,237,0.3)]">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-4xl font-semibold text-violet-600 transition-colors group-hover:text-violet-700">
                        {item.number}
                      </span>
                      <span className="h-px flex-1 bg-linear-to-r from-violet-300 via-violet-200 to-transparent" />
                    </div>
                    <h3 className="font-display mt-4 text-xl text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
    </div>
  );
}
