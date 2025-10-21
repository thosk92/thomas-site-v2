"use client";
import { motion } from "framer-motion";
import BackgroundCanvas from "@/components/BackgroundCanvas";

const theme = { bg: "#FFFFFF", text: "#0F0F10", textMuted: "#3A3A3A", accent: "#667302" };

const fadeIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

export default function Hero() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden" style={{ background: theme.bg, color: theme.text }}>
      <BackgroundCanvas />
      <main className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-start justify-center px-6 py-20 bg-transparent">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />
          <span className="text-sm text-neutral-700">Thomas Zanelli • Designer & Dev</span>
        </div>
        <h1 className="font-semibold leading-[0.95] tracking-[-0.02em] text-[clamp(48px,8vw,120px)]">
          I like when things feel clear and move with intention.
        </h1>
        <motion.p variants={fadeIn} initial="hidden" animate="show" className="mt-6 max-w-2xl text-[clamp(18px,2vw,22px)] text-neutral-700" style={{ color: theme.textMuted }}>
          Designer & developer exploring simplicity, motion, and human connection through interfaces.
        </motion.p>
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#projects" className="rounded-2xl px-6 py-3 text-base font-medium shadow-sm transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-black/10" style={{ background: theme.text, color: theme.bg }}>
            See projects
          </a>
          <a className="group inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-6 py-3 text-base font-medium backdrop-blur-sm transition-colors hover:bg-white" href="#about">
            About me
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </main>
    </div>
  );
}
