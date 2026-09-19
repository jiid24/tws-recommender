"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Headphones, ArrowUpRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/recommend", label: "Rekomendasi" },
  { href: "/product", label: "Katalog" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.12)] backdrop-blur-md"
          : "border-b border-transparent bg-white/80"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm transition-all group-hover:bg-violet-700 group-hover:shadow-md group-hover:shadow-violet-200">
            <Headphones className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <p className="text-[15px] font-semibold tracking-tight text-slate-900">
            TWS Recommender
          </p>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-violet-700"
                    : "font-medium text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 -z-0 rounded-full bg-violet-50"
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-violet-600"
                  />
                )}
              </Link>
            );
          })}

          <Link
            href="/recommend"
            className="group ml-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-[13px] font-medium text-white shadow-sm ring-1 ring-slate-950/10 transition-all hover:bg-violet-700 hover:gap-2.5 hover:shadow-md hover:shadow-violet-200/60 hover:ring-violet-700/20"
          >
            Mulai
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/recommend"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            Mulai
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            ref={menuButtonRef}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        aria-hidden={!open}
        inert={!open}
        className={`md:hidden overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="Navigasi utama (mobile)" id="mobile-navigation" className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-violet-50 font-semibold text-violet-700"
                    : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
