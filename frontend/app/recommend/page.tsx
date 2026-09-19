"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  AudioWaveform,
  ChevronRight,
  SearchX,
  Pencil,
  RotateCcw,
} from "lucide-react";
import PreferenceForm from "../../components/PreferenceForm";
import RecommendationList from "../../components/RecommendationList";
import SectionEyebrow from "../../components/ui/SectionEyebrow";
import { API_BASE_URL } from "../../lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type Recommendation = {
  id: string;
  nama: string;
  brand: string;
  harga: number;
  skor: number;
  alasan: string[];
  spesifikasi: {
    karakter_suara: string;
    battery_hours: number;
    anc: boolean;
    gaming: boolean;
    bluetooth_version?: string;
    codec?: string;
    water_resistance?: string;
    driver_size?: string;
    mic_count?: number;
    charging_port?: string;
    deskripsi?: string;
  };
};

type RecommendationResponse = {
  recommendations?: Recommendation[];
  pesan?: string;
  detail?: string;
};

type PreferenceData = {
  karakter_suara: "bass" | "treble" | "balance";
  min_battery_hours: number;
  anc: boolean;
  gaming: boolean;
  budget: number;
  water_resistance: "none" | "basic" | "sport";
};

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [lastPreference, setLastPreference] = useState<PreferenceData | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const preferencePanelRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (formData: PreferenceData) => {
    try {
      setLoading(true);
      setError("");
      setHasSubmitted(true);
      setEmptyMessage("");
      setRecommendations([]);
      setLastPreference(formData);

      const response = await fetch(`${API_BASE_URL}/recommend?top_n=5`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as RecommendationResponse;

      if (!response.ok) {
        throw new Error(data.detail || "Gagal mengambil rekomendasi");
      }

      const nextRecommendations = data.recommendations ?? [];
      setRecommendations(nextRecommendations);
      setEmptyMessage(
        nextRecommendations.length === 0
          ? data.pesan || "Tidak ada produk yang sesuai dengan kriteria Anda."
          : ""
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil rekomendasi."
      );
      setEmptyMessage("");
    } finally {
      setLoading(false);
    }
  };

  const focusPreferenceForm = () => {
    preferencePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    preferencePanelRef.current?.focus({ preventScroll: true });
  };

  const resetPreferenceForm = () => {
    setFormVersion((version) => version + 1);
    setRecommendations([]);
    setError("");
    setEmptyMessage("");
    setHasSubmitted(false);
    setLastPreference(null);
    requestAnimationFrame(focusPreferenceForm);
  };

  return (
    <main className="font-body relative min-h-screen bg-white text-slate-900">
      {/* ── HERO ── */}
      <section className="relative grid-pattern overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-violet-50/80 pointer-events-none" />
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-12">
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
              <SectionEyebrow>Halaman Rekomendasi</SectionEyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display mt-5 text-[2rem] leading-[1.1] text-slate-950 md:text-[2.5rem]"
            >
              Temukan TWS yang tepat{" "}
              <span className="bg-linear-to-r from-violet-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                untuk Anda
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600"
            >
              Isi preferensi sesuai kebutuhan Anda, lalu sistem akan
              menganalisis dan menampilkan rekomendasi TWS terbaik berdasarkan
              kecocokan fitur dan spesifikasi produk.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
          {/* Left panel — Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            ref={preferencePanelRef}
            tabIndex={-1}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(124,58,237,0.15)] lg:sticky lg:top-24 lg:self-start"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                  Langkah 1
                </p>
                <h2 className="font-display mt-1 text-lg text-slate-950">
                  Input Preferensi
                </h2>
              </div>
            </div>

            <div className="mt-6">
              <PreferenceForm key={formVersion} onSubmit={handleSubmit} loading={loading} />
            </div>
          </motion.div>

          {/* Right panel — Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="space-y-4"
          >
            <p
              className="sr-only"
              role={error ? "alert" : "status"}
              aria-live={error ? "assertive" : "polite"}
              aria-atomic="true"
            >
              {loading
                ? "Sedang memproses rekomendasi."
                : error
                  ? `Terjadi kesalahan: ${error}`
                  : recommendations.length > 0
                    ? `${recommendations.length} produk rekomendasi ditemukan.`
                    : hasSubmitted
                      ? emptyMessage || "Tidak ada produk yang sesuai."
                      : "Belum ada rekomendasi."}
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(124,58,237,0.15)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <AudioWaveform className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                      Langkah 2
                    </p>
                    <h2 className="font-display mt-1 text-lg text-slate-950">
                      Hasil Rekomendasi
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Menampilkan produk TWS terbaik berdasarkan preferensi
                      yang dimasukkan.
                    </p>
                  </div>
                </div>

                {!loading && recommendations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
                      {recommendations.length} produk ditampilkan
                    </span>
                    <button
                      type="button"
                      onClick={focusPreferenceForm}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Ubah preferensi
                    </button>
                    <button
                      type="button"
                      onClick={resetPreferenceForm}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="space-y-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-slate-100" />
                      <div className="flex-1 space-y-2.5 py-1">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                      </div>
                      <div className="hidden h-10 w-28 animate-pulse rounded-xl bg-slate-100 sm:block" />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="h-14 animate-pulse rounded-xl bg-slate-50"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-display text-base text-red-700">
                  Terjadi Kesalahan
                </h3>
                <p className="mt-1 text-sm leading-6 text-red-600">{error}</p>
                {lastPreference && (
                  <button
                    type="button"
                    onClick={() => handleSubmit(lastPreference)}
                    className="mt-4 inline-flex min-h-11 items-center rounded-full bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
                  >
                    Coba lagi
                  </button>
                )}
              </div>
            )}

            {!loading && !error && recommendations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  {hasSubmitted ? (
                    <SearchX className="h-6 w-6" strokeWidth={1.75} />
                  ) : (
                    <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
                  )}
                </div>
                <h3 className="font-display mt-4 text-lg text-slate-950">
                  {hasSubmitted
                    ? "Tidak ada produk yang sesuai"
                    : "Belum ada rekomendasi"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {hasSubmitted
                    ? emptyMessage ||
                      "Tidak ada produk yang sesuai dengan kriteria Anda."
                    : "Silakan isi form preferensi terlebih dahulu untuk melihat hasil rekomendasi TWS yang paling sesuai."}
                </p>
              </div>
            )}

            {!loading && !error && recommendations.length > 0 && (
              <RecommendationList recommendations={recommendations} />
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
