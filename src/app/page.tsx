import PrinciplesCarousel from "@/components/PrinciplesCarousel";
import ContactForm from "@/components/ContactForm";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
    <main className="relative min-h-[100vh] flex items-center">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="mb-6 text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-foreground">Thomas Zanelli</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.015em] max-w-6xl">
          Progetto spazi digitali che sentono umani.
        </h1>
        <p className="mt-8 max-w-3xl text-base sm:text-lg md:text-xl text-foreground/80">
          Design consapevole, codice pulito e uno scopo chiaro — perché la tecnologia dovrebbe sembrare connessione, non complessità.
        </p>
        <section id="about" className="mt-10 max-w-3xl">
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed">
            Thomas Zanelli progetta con uno scopo e scrive codice con cura.
          </p>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-foreground/80">
            Ogni progetto è un dialogo tra logica ed emozione — pensato per risultare naturale, senza tempo e umano.
          </p>
        </section>
        <div className="mt-10 flex gap-4">
          <a
            href="#contact"
            className="inline-flex items-center rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Contattami
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
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Metodo</h2>
      <p className="mt-4 max-w-2xl text-foreground/70">Un percorso semplice verso risultati significativi.</p>
      <ol className="mt-12 grid gap-8 sm:grid-cols-2">
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">01</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Discover</h3>
          <p className="mt-2 text-foreground/80">Obiettivi, utenti, vincoli. Allineiamo ciò che conta davvero.</p>
        </li>
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">02</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Design</h3>
          <p className="mt-2 text-foreground/80">Sistemi, flussi e interfacce che risultano naturali.</p>
        </li>
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">03</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Build</h3>
          <p className="mt-2 text-foreground/80">Codice pulito, performance prima di tutto, accessibile per impostazione predefinita.</p>
        </li>
        <li className="group border border-foreground/10 rounded-xl p-6 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
          <div className="text-sm text-foreground/60">04</div>
          <h3 className="mt-2 text-xl sm:text-2xl font-medium">Polish</h3>
          <p className="mt-2 text-foreground/80">Dettagli e motion che elevano senza distrarre.</p>
        </li>
      </ol>
      <div className="mt-10">
        <a href="#contact" data-hoverable className="text-sm font-medium underline underline-offset-4 hover:opacity-80">Inizia un progetto →</a>
      </div>
    </section>

    <PrinciplesCarousel />

    {/* Contact */}
    <section id="contact" className="container mx-auto px-6 sm:px-8 py-24">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Contatti</h2>
      <p className="mt-4 max-w-2xl text-foreground/70">Parlami del tuo progetto o opportunità. Ti risponderò a breve.</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
    </>
  );
}
