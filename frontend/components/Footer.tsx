import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/recommend", label: "Rekomendasi" },
  { href: "/product", label: "Katalog" },
  { href: "/faq", label: "FAQ" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      {/* Decorative violet glow */}
      <div className="pointer-events-none absolute -top-24 left-1/3 h-64 w-144 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-violet-700/10 blur-3xl" />
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Main row: brand · nav · socials ───────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-6 pt-7 pb-5">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          {/* Tagline block */}
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Audio Match Engine
            </p>
            <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-300">
              Membantu Anda memilih TWS yang paling sesuai dengan preferensi audio.
            </p>
          </div>

          {/* Nav inline */}
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-slate-300 transition-colors duration-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex max-w-sm items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-5 text-slate-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" strokeWidth={1.75} />
            <p>Data produk digunakan untuk kebutuhan sistem rekomendasi. Harga dan spesifikasi dapat berubah.</p>
          </div>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-6">
        <span className="block h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-6 py-3.5">
        <p className="text-center font-mono text-xs uppercase tracking-[0.16em] text-slate-400 md:text-left">
          © {year} TWS Recommender
        </p>
      </div>
    </footer>
  );
}
