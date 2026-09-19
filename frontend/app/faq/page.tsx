"use client";

import { Fragment, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import SectionEyebrow from "../../components/ui/SectionEyebrow";

type FaqItem = {
  q: string;
  a: string;
  category: string;
};

const faqs: FaqItem[] = [
  {
    category: "Dasar & Audio",
    q: "Apa itu TWS?",
    a: "TWS merupakan singkatan dari True Wireless Stereo — earphone tanpa kabel apa pun, termasuk antara earbud kiri dan kanan. Bentuk ini berbeda dengan earphone bluetooth generasi sebelumnya yang masih memiliki kabel penghubung di belakang leher.",
  },
  {
    category: "Dasar & Audio",
    q: "Apa perbedaan karakter suara bass, treble, dan balance?",
    a: "Ketiganya menunjukkan kecenderungan tonal yang berbeda:\n\n• Bass — menonjolkan nada rendah, cocok untuk genre EDM, hip-hop, atau RnB yang banyak mengandalkan dentuman.\n• Treble — menonjolkan nada tinggi sehingga vokal dan instrumen terdengar lebih terang dan detail.\n• Balance — menempatkan ketiga frekuensi (low, mid, high) pada porsi seimbang; pilihan paling fleksibel untuk berbagai genre.",
  },
  {
    category: "Dasar & Audio",
    q: "Apa itu codec SBC, AAC, LDAC, LHDC, aptX, dan LC3?",
    a: "Codec adalah metode kompresi yang digunakan saat data audio dikirim melalui bluetooth. Beberapa codec yang umum dijumpai pada spesifikasi:\n\n• SBC — codec dasar yang didukung seluruh TWS.\n• AAC — lebih efisien dan bekerja paling optimal pada iPhone.\n• LDAC, LHDC, aptX Adaptive, aptX Lossless — codec audio lanjutan dengan bitrate atau efisiensi kompresi lebih baik.\n• LC3 — codec generasi baru yang lebih hemat daya.\n• SSC — codec milik Samsung untuk lini Galaxy Buds.\n\nPerbedaan codec lanjutan baru terasa apabila sumber musik dan perangkat pemutar juga mendukung kualitas audio yang sesuai. Pada layanan streaming biasa, perbedaannya cenderung tidak signifikan.",
  },
  {
    category: "Fitur & Teknologi",
    q: "Apa fungsi ANC pada TWS?",
    a: "ANC adalah singkatan dari Active Noise Cancellation. Fitur ini meredam kebisingan lingkungan — misalnya suara mesin pesawat, AC kantor, atau lalu lintas jalan — dengan memanfaatkan mikrofon dan gelombang suara berlawanan fase.\n\nManfaatnya paling terasa ketika menggunakan transportasi umum, bekerja di tempat ramai, atau bepergian dengan pesawat.",
  },
  {
    category: "Fitur & Teknologi",
    q: "Apakah mode Gaming atau Low Latency memberi dampak nyata?",
    a: "Berpengaruh, terutama saat bermain game atau menonton film. Mode ini menurunkan jeda antara suara dan gambar sehingga keduanya tetap sinkron.\n\nLatensi bluetooth umumnya berada di kisaran 200ms, yang cukup mengganggu ketika bermain game. Dengan mode gaming, latensi dapat ditekan hingga 60–80ms.",
  },
  {
    category: "Fitur & Teknologi",
    q: "Apakah perbedaan bluetooth versi 5.0, 5.3, dan 6.0 signifikan?",
    a: "Versi yang lebih baru menawarkan jangkauan lebih jauh, konsumsi daya yang lebih hemat, serta dukungan fitur baru seperti LE Audio (tersedia mulai versi 5.2).\n\nNamun untuk pemakaian sehari-hari, perbedaan antara 5.0 dan 5.3 cenderung kecil. Yang lebih perlu diperhatikan adalah memastikan versi bluetooth TWS sama atau lebih tinggi dibandingkan perangkat yang digunakan.",
  },
  {
    category: "Ketahanan & Daya",
    q: "Apa arti rating IPX4, IP54, dan IP68?",
    a: "Format penulisan rating adalah IP[debu][air]. Angka pertama menunjukkan tingkat ketahanan terhadap debu (0–6), angka kedua ketahanan terhadap air (0–8). Huruf 'X' berarti aspek tersebut tidak diuji.\n\n• IPX4 — tahan keringat dan cipratan, memadai untuk olahraga ringan.\n• IP54 / IP55 — tahan debu ringan serta cipratan dan semprotan air.\n• IP57 — dapat direndam sebentar pada kedalaman 1 meter selama 30 menit.\n• IP68 — tahan debu sepenuhnya dan dapat direndam lebih dalam dalam waktu lebih lama.",
  },
  {
    category: "Ketahanan & Daya",
    q: "Apakah klaim baterai pada spesifikasi mencakup case?",
    a: "Angka besar yang dicantumkan pada spesifikasi umumnya merupakan total pemakaian, termasuk pengisian ulang dari case.\n\nEarbud itu sendiri biasanya bertahan 5–10 jam. Sisa daya berasal dari case yang berfungsi sebagai baterai cadangan dan mampu mengisi ulang earbud sebanyak 2–4 kali sebelum case perlu diisi ulang.",
  },
  {
    category: "Sistem Rekomendasi",
    q: "Bagaimana cara kerja sistem rekomendasi ini?",
    a: "Rekomendasi disusun melalui dua tahap.\n\n• Penyaringan — produk yang harganya melebihi anggaran, daya tahan baterainya kurang dari batas minimal, atau ketahanan airnya tidak memenuhi pilihanmu akan disingkirkan lebih dulu.\n• Penilaian kemiripan — produk yang lolos kemudian dibandingkan dengan preferensimu menggunakan metode Content-Based Filtering. Karakter suara, ANC, mode gaming, daya tahan baterai, dan ketahanan air diubah menjadi angka, lalu tingkat kemiripannya dihitung dengan Cosine Similarity.\n\nHasilnya diurutkan dari yang paling cocok, dan lima produk teratas ditampilkan beserta alasan singkat mengapa produk tersebut direkomendasikan.",
  },
  {
    category: "Sistem Rekomendasi",
    q: "Apa arti label kesesuaian pada hasil rekomendasi?",
    a: "Label kesesuaian menunjukkan tingkat kecocokan produk dengan preferensi yang kamu isi. Label Sangat Sesuai diberikan untuk skor minimal 90, Sesuai untuk skor 75 sampai 89, Cukup Sesuai untuk skor 60 sampai 74, dan Kurang Sesuai untuk skor di bawah 60.\n\nSkor dihitung dari preferensi yang kamu pilih. Fitur yang tidak kamu minta tidak akan menurunkan skor, sedangkan versi Bluetooth dan codec hanya ditampilkan sebagai informasi tambahan.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function FaqPage() {
  return (
    <main className="font-body relative min-h-screen bg-white text-slate-900">
      {/* ── HERO ── */}
      <section className="relative grid-pattern overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-violet-50/80 pointer-events-none" />
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-12">
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
              <SectionEyebrow>Pertanyaan Umum</SectionEyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display mt-5 text-[2rem] leading-[1.1] text-slate-950 md:text-[2.5rem]"
            >
              Hal-hal yang sering ditanyakan saat memilih TWS.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600"
            >
              Halaman ini merangkum istilah teknis yang sering muncul pada
              spesifikasi produk, dijelaskan secara ringkas agar mudah
              dipahami tanpa harus mendalami audio terlebih dahulu.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── LIST ── */}
      <section className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="space-y-3"
        >
          {faqs.map((item, i) => {
            const showHeader = i === 0 || faqs[i - 1].category !== item.category;
            return (
              <Fragment key={item.q}>
                {showHeader && (
                  <motion.li
                    variants={fadeUp}
                    className={`flex items-center gap-3 ${i === 0 ? "mb-3" : "mt-8 mb-3"}`}
                    aria-hidden
                  >
                    <span className="h-px w-6 bg-violet-300" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-700">
                      {item.category}
                    </span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </motion.li>
                )}
                <motion.li variants={fadeUp}>
                  <FaqRow item={item} index={i} />
                </motion.li>
              </Fragment>
            );
          })}
        </motion.ul>

      </section>
    </main>
  );
}

// ── Smooth accordion row ──────────────────────────────────────
function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const panelId = useId();

  return (
    <div
      className={`group overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
        open
          ? "border-violet-300 shadow-[0_8px_24px_-12px_rgba(124,58,237,0.2)]"
          : "border-slate-200 hover:border-violet-200"
      }`}
    >
      <button
        type="button"
        id={buttonId}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left md:px-6"
      >
        {/* Number */}
        <span
          className={`font-display text-sm tabular-nums transition-colors duration-300 ${
            open ? "text-violet-600" : "text-slate-400"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className={`h-7 w-px transition-colors duration-300 ${
            open ? "bg-violet-300" : "bg-slate-200"
          }`}
        />

        {/* Question */}
        <span className="font-display flex-1 text-[15px] leading-snug text-slate-900 md:text-base">
          {item.q}
        </span>

        {/* Toggle */}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            open
              ? "rotate-45 border-violet-300 bg-violet-50 text-violet-700"
              : "border-slate-200 bg-white text-slate-500 group-hover:border-violet-200"
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </span>
      </button>

      {/* Smooth answer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={panelId}
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 md:px-6">
              <div className="ml-[3rem] max-w-2xl border-l-2 border-violet-100 pl-5">
                {item.a.split("\n\n").map((para, idx) => (
                  <p
                    key={idx}
                    className="whitespace-pre-line text-sm leading-7 text-slate-600 [&:not(:first-child)]:mt-3"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
