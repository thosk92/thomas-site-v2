export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0b1024] text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[720px] rounded-3xl bg-white/5 px-6 py-7 sm:px-10 sm:py-10 shadow-[0_18px_60px_rgba(15,23,42,0.55)] backdrop-blur-md border border-white/10">
        <div className="mb-3 flex items-center justify-between text-[12px] text-slate-200/80">
          <a href="/emma" className="underline-offset-2 hover:underline">
            ← EMMA home
          </a>
          <span className="uppercase tracking-[0.18em] text-indigo-200/90">EMMA</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-white">
            Privacy &amp; Data Use
          </h1>
          <p className="mt-2 text-[13px] text-slate-200/80">
            Come EMMA gestisce i tuoi dati, spiegato in modo semplice.
          </p>
        </div>

        <div className="space-y-8 text-[14px] leading-relaxed">
          {/* ITALIANO */}
          <section className="space-y-2">
            <p className="text-[13px] font-semibold text-indigo-200/90">IT · Privacy &amp; data use</p>
            <h2 className="text-[15px] font-semibold text-white">Privacy &amp; Data Use</h2>
            <p className="text-slate-100/85">
              Come EMMA gestisce i tuoi dati, spiegato in modo semplice.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">1. Cos’è EMMA e come funziona</h3>
            <p className="text-slate-100/85">
              EMMA è uno spazio digitale pensato per aiutarti a mettere in parole ciò che provi. Le sue risposte vengono
              generate da un modello di intelligenza artificiale, con l’obiettivo di offrirti supporto emotivo e una
              nuova prospettiva. EMMA non è una professionista sanitaria, non effettua diagnosi e non sostituisce un
              percorso terapeutico.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">2. Quali dati raccogliamo</h3>
            <p className="text-slate-100/85">
              Per utilizzare EMMA non è necessario creare un account. Non chiediamo:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>nome o cognome</li>
              <li>email</li>
              <li>indirizzo</li>
              <li>dati di pagamento</li>
              <li>documenti identificativi</li>
            </ul>
            <p className="text-slate-100/85">
              Quando scrivi nella chat:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>il testo viene inviato ai server del nostro fornitore AI (OpenAI) per generare la risposta</li>
              <li>non utilizziamo questi dati per identificarti</li>
              <li>non colleghiamo le conversazioni a un profilo personale</li>
            </ul>
            <p className="text-slate-100/80">
              Per proteggerti, ti invitiamo a non inserire dati altamente sensibili, come indirizzi esatti, codici
              fiscali, numeri di documenti o informazioni che possano identificare altre persone.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">3. Come utilizziamo i dati</h3>
            <p className="text-slate-100/85">
              I dati inseriti vengono utilizzati esclusivamente per:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>generare le risposte della chat</li>
              <li>migliorare la qualità del servizio in forma aggregata e anonima</li>
            </ul>
            <p className="text-slate-100/85">
              Non vendiamo i tuoi dati a terze parti e non li utilizziamo per finalità pubblicitarie o di marketing.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">4. Dati tecnici</h3>
            <p className="text-slate-100/85">
              Come molti servizi online, EMMA raccoglie automaticamente alcuni dati tecnici necessari al funzionamento
              della piattaforma, tra cui:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>tipo di dispositivo</li>
              <li>lingua del browser</li>
              <li>orario di utilizzo</li>
              <li>eventuali errori tecnici</li>
            </ul>
            <p className="text-slate-100/85">
              Queste informazioni vengono utilizzate solo per garantire stabilità e corretto funzionamento del
              servizio.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">5. Sicurezza</h3>
            <p className="text-slate-100/85">
              Facciamo del nostro meglio per mantenere EMMA uno spazio sicuro:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>connessione protetta tramite HTTPS</li>
              <li>utilizzo di fornitori tecnologici affidabili</li>
              <li>nessun accesso manuale al contenuto delle conversazioni</li>
              <li>dati usati solo per le finalità dichiarate</li>
            </ul>
            <p className="text-slate-100/85">
              Nessun sistema è perfetto, ma facciamo il massimo per proteggere ciò che condividi.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">6. I tuoi diritti</h3>
            <p className="text-slate-100/85">
              Puoi contattarci in qualsiasi momento per:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>richiedere informazioni sull’uso dei tuoi dati</li>
              <li>richiedere la cancellazione di eventuali dati gestiti dal sistema</li>
              <li>ottenere chiarimenti su sicurezza e privacy</li>
            </ul>
            <p className="text-slate-100/85">📩 Email di contatto privacy: privacy@emmapp.io</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">7. Aggiornamenti</h3>
            <p className="text-slate-100/85">
              Questa pagina può essere aggiornata nel tempo per garantire maggiore trasparenza.
            </p>
            <p className="text-slate-100/85">Ultimo aggiornamento: 28/11/2025</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">8. Un messaggio da EMMA</h3>
            <p className="text-slate-100/85">
              La tua privacy conta. Sei al sicuro qui. Quello che condividi serve solo a permettermi di aiutarti con
              calma, rispetto e gentilezza.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">9. Ringraziamento</h3>
            <p className="text-slate-100/85">
              Thomas ringrazia per la fiducia che stai dando a questo progetto. La tua presenza qui significa molto e
              ci permette di rendere EMMA uno spazio sempre più sicuro, gentile e utile per tutti.
            </p>
          </section>

          {/* ENGLISH */}
          <section className="space-y-2 pt-4 border-t border-white/10">
            <p className="text-[13px] font-semibold text-indigo-200/90">EN · Privacy &amp; data use</p>
            <h2 className="text-[15px] font-semibold text-white">Privacy &amp; Data Use</h2>
            <p className="text-slate-100/85">
              How EMMA handles your data, explained simply.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">1. What EMMA is and how it works</h3>
            <p className="text-slate-100/85">
              EMMA is a digital space designed to help you put your thoughts and emotions into words. Her responses are
              generated by an artificial intelligence model, with the goal of offering emotional support and a fresh
              perspective. EMMA is not a healthcare professional, does not provide diagnoses, and does not replace
              therapy.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">2. What data we collect</h3>
            <p className="text-slate-100/85">
              To use EMMA, you do not need to create an account. We do not ask for:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>first or last name</li>
              <li>email</li>
              <li>address</li>
              <li>payment information</li>
              <li>identification documents</li>
            </ul>
            <p className="text-slate-100/85">
              When you write in the chat:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>your text is sent to our AI provider (OpenAI) to generate EMMA’s responses</li>
              <li>we do not use this data to identify you</li>
              <li>we do not link conversations to personal profiles</li>
            </ul>
            <p className="text-slate-100/80">
              For your safety, please avoid entering highly sensitive information such as full addresses, tax or
              document numbers, or details that could identify other people.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">3. How we use your data</h3>
            <p className="text-slate-100/85">
              Your input is used only for:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>generating chat responses</li>
              <li>improving the service in an aggregated and anonymous form</li>
            </ul>
            <p className="text-slate-100/85">
              We do not sell your data to third parties and we do not use it for advertising or marketing purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">4. Technical data</h3>
            <p className="text-slate-100/85">
              Like many online services, EMMA automatically collects some technical information required for the
              platform to function, such as:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>device type</li>
              <li>browser language</li>
              <li>time of use</li>
              <li>technical errors</li>
            </ul>
            <p className="text-slate-100/85">
              These data are used only to ensure stability and proper functionality.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">5. Security</h3>
            <p className="text-slate-100/85">
              We do our best to keep EMMA a safe space:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>secure HTTPS connection</li>
              <li>reliable technology providers</li>
              <li>no manual access to the content of conversations</li>
              <li>data used only for the purposes described</li>
            </ul>
            <p className="text-slate-100/85">
              No system is perfect, but we take your privacy seriously and work to protect what you share.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">6. Your rights</h3>
            <p className="text-slate-100/85">
              You can contact us at any time to:
            </p>
            <ul className="list-disc list-inside text-slate-100/85 space-y-1">
              <li>request information about how your data is used</li>
              <li>request deletion of any data handled by the system</li>
              <li>ask for clarification about security and privacy</li>
            </ul>
            <p className="text-slate-100/85">📩 Privacy contact email: privacy@emmapp.io</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">7. Updates</h3>
            <p className="text-slate-100/85">
              This page may be updated over time to ensure greater transparency.
            </p>
            <p className="text-slate-100/85">Last update: 28/11/2025</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">8. A message from EMMA</h3>
            <p className="text-slate-100/85">
              Your privacy matters. You’re safe here. What you share is used only to help me support you with calm,
              respect, and kindness.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-white">9. Gratitude</h3>
            <p className="text-slate-100/85">
              Thomas thanks you for the trust you are giving to this project. Your presence here means a lot and helps
              us make EMMA a safer, kinder, and more supportive space for everyone.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
