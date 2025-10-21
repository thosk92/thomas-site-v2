export default function PrivacyPageIt() {
  return (
    <main className="container mx-auto px-6 sm:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Informativa sulla Privacy</h1>
      <div className="prose max-w-3xl mt-6">
        <p>
          Questa pagina spiega come tratto i dati personali raccolti tramite il modulo di contatto su questo sito web.
        </p>
        <h2 id="theme-privacy">Funzionalità del sito e personalizzazione</h2>
        <p>
          Il sito offre funzionalità opzionali di tema, come la dark mode basata sull’orario e la modalità “Solare” che si adatta ad alba/tramonto. Queste funzioni possono richiedere l’accesso alla posizione del dispositivo e memorizzano la tua preferenza di tema localmente sul tuo dispositivo.
        </p>
        <h2>Titolare del trattamento</h2>
        <p>
          Thomas Zanelli — Email: <a href="mailto:thomaszanelli@icloud.com">thomaszanelli@icloud.com</a>
        </p>
        <h2>Finalità e base giuridica</h2>
        <p>
          I tuoi dati vengono trattati esclusivamente per rispondere alla tua richiesta o a proposte relative a opportunità di lavoro. La base giuridica è l’interesse legittimo (art. 6(1)(f) GDPR).
        </p>
        <p>Per la personalizzazione del tema:</p>
        <ul>
          <li>Geolocalizzazione per la modalità Solare: usata per calcolare alba/tramonto e applicare di conseguenza il tema chiaro/scuro. Base giuridica: il tuo consenso (art. 6(1)(a) GDPR), richiesto tramite il prompt del browser.</li>
          <li>Memorizzazione preferenza tema e coordinate: conservate localmente sul tuo dispositivo via localStorage per ricordare la scelta e la posizione per la modalità Solare. Base giuridica: interesse legittimo a fornire un’esperienza coerente (art. 6(1)(f) GDPR).</li>
        </ul>
        <h2>Dati trattati</h2>
        <p>
          Nome, indirizzo email e contenuto del messaggio. Non sono richieste categorie particolari di dati.
        </p>
        <p>Quando utilizzi le funzioni di tema:</p>
        <ul>
          <li>Posizione approssimativa (latitudine/longitudine) se concedi il permesso di geolocalizzazione. Queste coordinate sono memorizzate solo sul tuo dispositivo in localStorage con le chiavi <code>theme-solar-lat</code> e <code>theme-solar-lng</code>.</li>
          <li>La tua preferenza di tema con la chiave <code>theme-pref</code> (valori: <code>light</code>, <code>dark</code>, <code>time</code>, <code>solar</code>, <code>system</code>).</li>
        </ul>
        <p>Il sito non trasmette le tue coordinate di geolocalizzazione o le preferenze di tema al server o a terze parti.</p>
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
        <p>I dati relativi al tema (coordinate e preferenza) sono memorizzati solo nel localStorage del tuo browser e restano sotto il tuo controllo. Puoi eliminarli in qualsiasi momento cancellando i dati del sito nel browser.</p>
        <h2>Sicurezza dei dati</h2>
        <p>
          Gli input vengono validati e non vengono registrati nei log. Le funzioni serverless applicano misure base anti-spam e di rate limiting.
        </p>
        <h2>Scelte e controlli dell’utente</h2>
        <ul>
          <li>Il permesso di geolocalizzazione può essere negato o revocato dalle impostazioni del browser. In tal caso, la modalità Solare ripiega sul tema basato sull’orario.</li>
          <li>Puoi selezionare manualmente un tema (Light/Dark/Time/Solar/System) tramite il toggle. La scelta è memorizzata localmente.</li>
          <li>Pulendo i dati del sito nel browser rimuoverai coordinate e preferenze salvate.</li>
        </ul>
        <h2>Diritti</h2>
        <p>
          Puoi richiedere accesso, rettifica, cancellazione, limitazione o opporti al trattamento scrivendo a
          <a href="mailto:thomaszanelli@icloud.com"> thomaszanelli@icloud.com</a>.
        </p>
        <h2>Cookie</h2>
        <p>
          Il modulo di contatto non utilizza cookie. Le funzioni di tema usano il localStorage solo sul tuo dispositivo. Se verranno aggiunti servizi ulteriori (analytics, captcha), questa informativa sarà aggiornata di conseguenza.
        </p>
        <h2>Change Log</h2>
        <ul>
          <li><strong>{new Date().toISOString().slice(0, 10)}</strong>: Aggiunte note su tema a orario e Solare, consenso geolocalizzazione e chiavi localStorage.</li>
        </ul>
        <p className="text-sm text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Ultimo aggiornamento: {new Date().toISOString().slice(0, 10)}</p>
      </div>
    </main>
  );
}
