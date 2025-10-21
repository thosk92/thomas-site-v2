"use client";
import { motion } from "framer-motion";

type Card = { title: string; outcome: string; role: string; };

const cards: Card[] = [
  { title: "Parchi e Riserve — Event Map", outcome: "+23% session depth", role: "Design • Front-end" },
  { title: "EuropaLINK — Directory", outcome: "-18% TTFB", role: "UX • Dev" },
  { title: "Facile-PC — Personal Site", outcome: "Clearer onboarding", role: "Design • Build" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

export default function Projects() {
  return (
    <section id="projects" className="relative mx-auto max-w-7xl px-6 py-24 bg-white">
      <header className="mb-10">
        <h2 className="text-[clamp(28px,4vw,48px)] font-semibold tracking-[-0.02em]">Selected projects</h2>
        <p className="mt-2 text-neutral-600">Three focused case studies. Minimal presentation, real outcomes.</p>
      </header>
      <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.li key={i} variants={item}>
            <a href={`/case/${i+1}`} className="group block rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-black/10 bg-neutral-100" />
              <div className="mt-4 flex items-center justify-between">
                <h3 className="text-lg font-medium tracking-[-0.01em]">{c.title}</h3>
                <span className="text-xs rounded-full border border-black/10 px-2 py-0.5 text-neutral-600">{c.role}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{c.outcome}</p>
            </a>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
