"use client";

import { MotionConfig } from "framer-motion";

/**
 * Membungkus seluruh aplikasi agar animasi framer-motion menghormati
 * preferensi sistem "reduce motion". Media query CSS di globals.css hanya
 * mematikan animasi CSS; framer-motion beranimasi lewat JS sehingga perlu
 * MotionConfig ini. Dengan reducedMotion="user", animasi transform/layout
 * dinonaktifkan bagi pengguna yang memilih reduce motion (opacity tetap),
 * tanpa memengaruhi pengguna lain.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
