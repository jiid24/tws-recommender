"use client";

import { useState } from "react";
import {
  Music,
  Battery,
  Shield,
  Gamepad2,
  Wallet,
  Droplets,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

type PreferenceFormProps = {
  onSubmit: (data: {
    karakter_suara: "bass" | "treble" | "balance";
    min_battery_hours: number;
    anc: boolean;
    gaming: boolean;
    budget: number;
    water_resistance: "none" | "basic" | "sport";
  }) => void;
  loading?: boolean;
};

const sectionClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

const SectionHeader = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-3.5 flex items-center gap-3">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
      <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-[11px] text-slate-400">{subtitle}</p>
    </div>
  </div>
);

const OptionButton = ({
  isActive,
  activeClass,
  onClick,
  label,
  desc,
}: {
  isActive: boolean;
  activeClass: string;
  onClick: () => void;
  label: string;
  desc?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm transition-all ${
      desc ? "min-h-[4.5rem]" : ""
    } ${
      isActive
        ? activeClass
        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div className="font-medium">{label}</div>
    {desc && <div className="mt-0.5 text-[11px] leading-tight opacity-70">{desc}</div>}
  </button>
);

export default function PreferenceForm({ onSubmit, loading = false }: PreferenceFormProps) {
  const [karakterSuara, setKarakterSuara] = useState<"bass" | "treble" | "balance">("balance");
  const [minBatteryHours, setMinBatteryHours] = useState(15);
  const [anc, setAnc] = useState(false);
  const [gaming, setGaming] = useState(false);
  const [budget, setBudget] = useState(300000);
  const [waterResistance, setWaterResistance] = useState<"none" | "basic" | "sport">("none");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      karakter_suara: karakterSuara,
      min_battery_hours: Number(minBatteryHours),
      anc,
      gaming,
      budget: Number(budget),
      water_resistance: waterResistance,
    });
  };

  const BUDGET_MIN = 100000;
  const BUDGET_MAX = 1000000;
  const budgetPercent = ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  const getBudgetCategory = (value: number) => {
    if (value <= 250000) return { label: "Entry", color: "text-emerald-600" };
    if (value <= 500000) return { label: "Budget", color: "text-blue-600" };
    if (value <= 750000) return { label: "Menengah", color: "text-violet-600" };
    return { label: "Premium", color: "text-amber-600" };
  };
  const budgetCategory = getBudgetCategory(budget);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Karakter Suara */}
      <div className={sectionClass}>
        <SectionHeader
          icon={Music}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          title="Karakter Suara"
          subtitle="Pilih preferensi suara Anda"
        />
        <div role="group" aria-label="Karakter suara" className="grid grid-cols-3 gap-2">
          {[
            { value: "bass", label: "Bass", desc: "Nada rendah dominan" },
            { value: "balance", label: "Balance", desc: "Seimbang" },
            { value: "treble", label: "Treble", desc: "Detail nada tinggi" },
          ].map((item) => (
            <OptionButton
              key={item.value}
              isActive={karakterSuara === item.value}
              activeClass="border-violet-400 bg-violet-50 text-violet-700"
              onClick={() => setKarakterSuara(item.value as "bass" | "treble" | "balance")}
              label={item.label}
              desc={item.desc}
            />
          ))}
        </div>
      </div>

      {/* Baterai */}
      <div className={sectionClass}>
        <SectionHeader
          icon={Battery}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          title="Daya Tahan Baterai"
          subtitle="Minimal durasi pemakaian"
        />
        <div role="group" aria-label="Daya tahan baterai" className="grid grid-cols-3 gap-2">
          {[
            { value: 15, label: "15+ Jam", desc: "Standar" },
            { value: 30, label: "30+ Jam", desc: "Tahan Lama" },
            { value: 40, label: "40+ Jam", desc: "Maksimal" },
          ].map((item) => (
            <OptionButton
              key={item.label}
              isActive={minBatteryHours === item.value}
              activeClass="border-emerald-400 bg-emerald-50 text-emerald-700"
              onClick={() => setMinBatteryHours(item.value)}
              label={item.label}
              desc={item.desc}
            />
          ))}
        </div>
      </div>

      {/* ANC & Gaming */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={sectionClass}>
          <SectionHeader
            icon={Shield}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            title="Active Noise Cancellation"
            subtitle="Peredam suara bising sekitar"
          />
          <div role="group" aria-label="Active Noise Cancellation" className="grid grid-cols-2 gap-2">
            {[{ value: true, label: "Ya" }, { value: false, label: "Tidak" }].map((item) => (
              <OptionButton
                key={String(item.value)}
                isActive={anc === item.value}
                activeClass="border-blue-400 bg-blue-50 text-blue-700"
                onClick={() => setAnc(item.value)}
                label={item.label}
              />
            ))}
          </div>
        </div>

        <div className={sectionClass}>
          <SectionHeader
            icon={Gamepad2}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            title="Mode Gaming"
            subtitle="Latensi rendah untuk game & video"
          />
          <div role="group" aria-label="Mode Gaming" className="grid grid-cols-2 gap-2">
            {[{ value: true, label: "Ya" }, { value: false, label: "Tidak" }].map((item) => (
              <OptionButton
                key={String(item.value)}
                isActive={gaming === item.value}
                activeClass="border-amber-400 bg-amber-50 text-amber-700"
                onClick={() => setGaming(item.value)}
                label={item.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Water Resistance */}
      <div className={sectionClass}>
        <SectionHeader
          icon={Droplets}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          title="Ketahanan Air"
          subtitle="Tingkat proteksi air & debu"
        />
        <div role="group" aria-label="Ketahanan air" className="grid grid-cols-3 gap-2">
          {[
            { value: "none", label: "Tidak Perlu", desc: "Pemakaian indoor" },
            { value: "basic", label: "Basic", desc: "Tahan keringat" },
            { value: "sport", label: "Sport", desc: "Olahraga & outdoor" },
          ].map((item) => (
            <OptionButton
              key={item.value}
              isActive={waterResistance === item.value}
              activeClass="border-cyan-400 bg-cyan-50 text-cyan-700"
              onClick={() => setWaterResistance(item.value as "none" | "basic" | "sport")}
              label={item.label}
              desc={item.desc}
            />
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className={sectionClass}>
        <SectionHeader
          icon={Wallet}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          title="Anggaran"
          subtitle="Batas harga maksimal"
        />

        {/* Budget display */}
        <div className="mb-3 flex items-baseline justify-between">
          <span className={`text-xs font-medium ${budgetCategory.color}`}>
            {budgetCategory.label}
          </span>
          <span className="font-display text-lg font-normal text-slate-900">
            Rp {budget.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Custom slider track */}
        <div className="relative h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${budgetPercent}%` }}
          />
          {/* Thumb terlihat (dekoratif; input di bawahnya yang menangkap geser) */}
          <div
            className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-600 bg-white shadow-sm transition-all"
            style={{ left: `${budgetPercent}%` }}
          />
          <input
            id="budget"
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={20000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Anggaran maksimal"
            aria-valuetext={`Rp ${budget.toLocaleString("id-ID")}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>Rp 100.000</span>
          <span>Rp 1.000.000</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 hover:gap-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            Dapatkan Rekomendasi
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
