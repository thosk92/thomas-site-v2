import PrinciplesCarousel from "@/components/PrinciplesCarousel";
import ContactForm from "@/components/ContactForm";
import HeroMonogram from "@/components/HeroMonogram";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function PageEn() {
  return (
    <>
      <HeroMonogram letters={["T","Z"]} />
      <main className="relative min-h-[100vh] flex items-center">
        <div className="container mx-auto px-6 sm:px-8">
          <div data-reveal className="mb-6 text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[var(--foreground)]">Thomas Zanelli</div>
          <h1 data-reveal className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.015em] max-w-6xl">
            I design digital spaces that feel human.
          </h1>
          <p data-reveal style={{ transitionDelay: "120ms" }} className="mt-8 max-w-3xl text-base sm:text-lg md:text-xl text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">
            Thoughtful design, clean code, and a clear purpose — technology should feel like connection, not complexity.
          </p>
          <section id="about" className="mt-10 max-w-3xl">
            <p data-reveal style={{ transitionDelay: "180ms" }} className="text-lg sm:text-xl md:text-2xl leading-relaxed">
              I design with intent and code with care.
            </p>
            <p data-reveal style={{ transitionDelay: "240ms" }} className="mt-3 text-base sm:text-lg md:text-xl text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">
              Every project balances logic and emotion — shaped to be clear, timeless, and genuinely human.
            </p>
          </section>
          <div data-reveal style={{ transitionDelay: "300ms" }} className="mt-10 flex gap-4">
            <a
              href="#contact"
              className="inline-flex items-center rounded-full px-5 py-3 text-sm font-medium hover:opacity-90 transition"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              Get in touch
            </a>
            <a
              href="https://www.linkedin.com/in/thomas-zanelli-a8b1a8130/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium transition hover:bg-[color-mix(in oklab,var(--foreground) 5%, transparent)]"
              style={{ borderColor: "color-mix(in oklab,var(--foreground) 20%, transparent)" }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </main>

      <section id="process" className="container mx-auto px-6 sm:px-8 py-24">
        <h2 data-reveal className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Process</h2>
        <p data-reveal style={{ transitionDelay: "120ms" }} className="mt-4 max-w-2xl text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">A simple path to meaningful results.</p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2">
          <li data-reveal className="group border rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20" style={{ borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
            <div className="text-sm text-[color-mix(in oklab,var(--foreground) 60%, transparent)]">01</div>
            <h3 className="mt-2 text-xl sm:text-2xl font-medium">Discover</h3>
            <p className="mt-2 text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">Goals, users, constraints. We align on what matters.</p>
          </li>
          <li data-reveal className="group border rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20" style={{ transitionDelay: "80ms", borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
            <div className="text-sm text-[color-mix(in oklab,var(--foreground) 60%, transparent)]">02</div>
            <h3 className="mt-2 text-xl sm:text-2xl font-medium">Design</h3>
            <p className="mt-2 text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">Systems, flows, and interfaces that feel natural.</p>
          </li>
          <li data-reveal className="group border rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20" style={{ transitionDelay: "160ms", borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
            <div className="text-sm text-[color-mix(in oklab,var(--foreground) 60%, transparent)]">03</div>
            <h3 className="mt-2 text-xl sm:text-2xl font-medium">Build</h3>
            <p className="mt-2 text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">Clean code, performance-first, accessible by default.</p>
          </li>
          <li data-reveal className="group border rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20" style={{ transitionDelay: "240ms", borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
            <div className="text-sm text-[color-mix(in oklab,var(--foreground) 60%, transparent)]">04</div>
            <h3 className="mt-2 text-xl sm:text-2xl font-medium">Polish</h3>
            <p className="mt-2 text-[color-mix(in oklab,var(--foreground) 80%, transparent)]">Details and motion that elevate without distracting.</p>
          </li>
        </ol>
        <div className="mt-10">
          <a data-reveal style={{ transitionDelay: "300ms" }} href="#contact" data-hoverable className="text-sm font-medium underline underline-offset-4 hover:opacity-80">Start a project →</a>
        </div>
      </section>

      <PrinciplesCarousel />

      <section id="contact" className="container mx-auto px-6 sm:px-8 py-24">
        <h2 data-reveal className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Contact</h2>
        <p data-reveal style={{ transitionDelay: "120ms" }} className="mt-4 max-w-2xl text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Tell me about your project or opportunity. I’ll reply soon.</p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
