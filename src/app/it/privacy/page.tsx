export default function PrivacyPageIt() {
  return (
    <main className="container mx-auto px-6 sm:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Informativa sulla Privacy</h1>
      <div className="prose max-w-3xl mt-6">
        <p>
          Questa pagina spiega come tratto i dati personali raccolti tramite il modulo di contatto su questo sito web.
        </p>
        <h2>Titolare del trattamento</h2>
        <p>
          Thomas Zanelli — Email: <a href="mailto:thomaszanelli@icloud.com">thomaszanelli@icloud.com</a>
        </p>
        <h2>Finalità e base giuridica</h2>
        <p>
          I tuoi dati vengono trattati esclusivamente per rispondere alla tua richiesta o a proposte relative a opportunità di lavoro. La base giuridica è l’interesse legittimo (art. 6(1)(f) GDPR).
        </p>
        <h2>Dati trattati</h2>
        <p>
          Nome, indirizzo email e contenuto del messaggio. Non sono richieste categorie particolari di dati.
        </p>
        <h2>Destinatari e responsabili</h2>
        <ul>
          <li>Vercel (piattaforma di hosting e serverless).</li>
          <li>Resend (fornitore di invio email).</li>
          <li>Il tuo messaggio verrà recapitato anche alla mia casella di posta.</li>
        </ul>
        <p>
          Questi fornitori possono trattare dati anche fuori dall’UE. Si applicano le Clausole Contrattuali Standard e le adeguate garanzie indicate nella loro documentazione. Sono in essere o disponibili accordi di trattamento dati secondo i rispettivi termini.
        </p>
        <h2>Conservazione</h2>
        <p>
          La corrispondenza viene conservata fino a 12 mesi, salvo periodi più lunghi necessari a gestire la tua richiesta o adempiere a obblighi di legge.
        </p>
        <h2>Sicurezza dei dati</h2>
        <p>
          Gli input vengono validati e non vengono registrati nei log. Le funzioni serverless applicano misure base anti-spam e di rate limiting.
        </p>
        <h2>Diritti</h2>
        <p>
          Puoi richiedere accesso, rettifica, cancellazione, limitazione o opporti al trattamento scrivendo a
          <a href="mailto:thomaszanelli@icloud.com"> thomaszanelli@icloud.com</a>.
        </p>
        <h2>Cookie</h2>
        <p>
          Il modulo di contatto non utilizza cookie. Se verranno aggiunti servizi ulteriori (analytics, captcha), questa informativa sarà aggiornata di conseguenza.
        </p>
        <p className="text-sm text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Ultimo aggiornamento: {new Date().toISOString().slice(0, 10)}</p>
      </div>
    </main>
  );
}
