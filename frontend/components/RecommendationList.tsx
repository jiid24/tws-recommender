import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Battery,
  Shield,
  Gamepad2,
  Droplets,
  ArrowUpRight,
  Headphones,
  BadgeCheck,
} from "lucide-react";

type SpecItem = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  capitalize?: boolean;
};

type Recommendation = {
  id: string;
  nama: string;
  brand: string;
  harga: number;
  image_url?: string;
  skor: number;
  alasan: string[];
  spesifikasi: {
    karakter_suara: string;
    battery_hours: number;
    anc: boolean;
    gaming: boolean;
    water_resistance?: string;
    bluetooth_version?: string;
    codec?: string;
    driver_size?: string;
    mic_count?: number | null;
    charging_port?: string;
  };
};

type RecommendationListProps = {
  recommendations: Recommendation[];
};

function getSuitabilityLabel(score: number) {
  if (score >= 90) {
    return {
      label: "Sangat Sesuai",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 75) {
    return {
      label: "Sesuai",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (score >= 60) {
    return {
      label: "Cukup Sesuai",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Kurang Sesuai",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Headphones className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-xl text-slate-900">Belum Ada Rekomendasi</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Isi preferensi terlebih dahulu untuk melihat hasil rekomendasi TWS terbaik untukmu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((item, index) => {
        const isTop = index === 0;
        const scorePercent = Math.min(Math.round(item.skor), 100);
        const suitability = getSuitabilityLabel(scorePercent);

        const specItems: SpecItem[] = [
          {
            label: "Suara",
            value: item.spesifikasi.karakter_suara,
            icon: null,
            capitalize: true,
          },
          {
            label: "Baterai",
            value: `${item.spesifikasi.battery_hours} Jam`,
            icon: <Battery className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />,
          },
          {
            label: "ANC",
            value: item.spesifikasi.anc ? "Ya" : "Tidak",
            icon: <Shield className="h-3.5 w-3.5 text-blue-500" strokeWidth={1.5} />,
          },
          {
            label: "Gaming",
            value: item.spesifikasi.gaming ? "Ya" : "Tidak",
            icon: <Gamepad2 className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />,
          },
          {
            label: "Tahan Air",
            value: item.spesifikasi.water_resistance || "–",
            icon: <Droplets className="h-3.5 w-3.5 text-cyan-500" strokeWidth={1.5} />,
          },
        ];

        return (
          <div
            key={item.id}
            className={`rounded-3xl border bg-white p-5 ${
              isTop
                ? "border-violet-200 shadow-[0_8px_32px_-8px_rgba(124,58,237,0.15)]"
                : "border-slate-100 shadow-sm"
            }`}
          >
            {/* Header row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <Image
                    src={
                      item.image_url
                        ? /^(https?:\/\/|\/)/.test(item.image_url)
                          ? item.image_url
                          : `/${item.image_url}`
                        : "/images/no-image.svg"
                    }
                    alt={item.nama}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {isTop ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white">
                        <Star className="h-3 w-3 fill-current" />
                        Best Match
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        #{index + 1} Rekomendasi
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl leading-tight text-slate-950">
                    {item.nama}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-400">{item.brand}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    Rp {item.harga.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Label kesesuaian; skor angka tetap dipakai backend untuk urutan hasil. */}
              <div
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 ${suitability.className}`}
              >
                <BadgeCheck className="h-5 w-5" strokeWidth={1.75} />
                <p className="font-display text-base leading-none">{suitability.label}</p>
              </div>
            </div>

            {/* Alasan */}
            {item.alasan.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Alasan Cocok
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.alasan.map((alasan, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                    >
                      {alasan}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specs (primary 5 only — spec lengkap di halaman detail) */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {specItems.map((spec) => (
                <div key={spec.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="mb-1 flex items-center gap-1">
                    {spec.icon}
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {spec.label}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold text-slate-900 ${
                      spec.capitalize ? "capitalize" : ""
                    }`}
                  >
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
              <Link
                href={`/product/${item.id}`}
                className="group inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-all hover:gap-2.5 hover:bg-violet-700"
              >
                Lihat Detail
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
