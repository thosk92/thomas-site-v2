import PrinciplesCarousel from "@/components/PrinciplesCarousel";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <>
    <main className="relative min-h-[100vh] flex items-center">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="mb-6 text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-foreground">Thomas Zanelli</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.015em] max-w-6xl">
          I design digital spaces that feel human.
        </h1>
        <p className="mt-8 max-w-3xl text-base sm:text-lg md:text-xl text-foreground/80">
          Thoughtful design, clean code, and a clear purpose — because technology should feel like connection, not complexity.
        </p>
        <section id="about" className="mt-10 max-w-3xl">
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed">
            Thomas Zanelli designs with purpose and codes with care.
          </p>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-foreground/80">
            Every project is a dialogue between logic and emotion — shaped to feel natural, timeless, and human.
          </p>
        </section>
        <div className="mt-10 flex gap-4">
          <a
            href="#contact"
            className="inline-flex items-center rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Get in touch
          </a>
          <a
            href="https://www.linkedin.com/in/thomas-zanelli-a8b1a8130/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-foreground/20 px-5 py-3 text-sm font-medium hover:bg-foreground/5 transition"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </main>

    {/* Process — transparent, clear steps */}
    <section id="process" className="container mx-auto px-6 sm:px-8 py-24">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Process</h2>
      <p className="mt-4 max-w-2xl text-foreground/70">A simple path to meaningful results.</p>
      <ol className="mt-12 grid gap-8 sm:grid-cols-2">
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">01</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Discover</h3>
          <p className="mt-2 text-foreground/80">Goals, users, constraints. We align on what matters.</p>
        </li>
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">02</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Design</h3>
          <p className="mt-2 text-foreground/80">Systems, flows, and interfaces that feel natural.</p>
        </li>
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">03</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Build</h3>
          <p className="mt-2 text-foreground/80">Clean code, performance-first, accessible by default.</p>
        </li>
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">04</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Polish</h3>
          <p className="mt-2 text-foreground/80">Details and motion that elevate without distracting.</p>
        </li>
      </ol>
      <div className="mt-10">
        <a href="#contact" data-hoverable className="text-sm font-medium underline underline-offset-4 hover:opacity-80">Start a project →</a>
      </div>
    </section>

    <PrinciplesCarousel />

    {/* Contact */}
    <section id="contact" className="container mx-auto px-6 sm:px-8 py-24">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Contact</h2>
      <p className="mt-4 max-w-2xl text-foreground/70">Tell me about your project or opportunity. I’ll reply soon.</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
    </>
  );
}
