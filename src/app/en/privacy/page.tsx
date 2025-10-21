export default function PrivacyPageEn() {
  return (
    <main className="container mx-auto px-6 sm:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="prose max-w-3xl mt-6">
        <p>
          This page explains how I process personal data collected through the contact form on this website.
        </p>
        <h2 id="theme-privacy">Site Features and Personalization</h2>
        <p>
          The site offers optional theme features such as time-based dark mode and a “Solar” mode that adapts to sunrise/sunset. These features may request access to your device location and store your theme preference locally on your device.
        </p>
        <h2>Data Controller</h2>
        <p>
          Thomas Zanelli — Email: <a href="mailto:thomaszanelli@icloud.com">thomaszanelli@icloud.com</a>
        </p>
        <h2>Purpose and Legal Basis</h2>
        <p>
          I process your data solely to respond to your inquiry or proposals regarding work opportunities. The legal basis is legitimate interest (Article 6(1)(f) GDPR).
        </p>
        <p>
          For theme personalization:
        </p>
        <ul>
          <li>Geolocation for Solar mode: used to compute sunrise/sunset and apply a dark/light theme accordingly. Legal basis: your consent (Article 6(1)(a) GDPR), requested via the browser’s permission prompt.</li>
          <li>Theme preference and coordinates storage: stored locally on your device via localStorage to remember your choice and location for Solar mode. Legal basis: legitimate interest to provide a consistent user experience (Article 6(1)(f) GDPR).</li>
        </ul>
        <h2>Data Processed</h2>
        <p>
          Name, email address, and message content. No special categories of data are required.
        </p>
        <p>
          When using theme features:
        </p>
        <ul>
          <li>Approximate location (latitude/longitude) if you grant geolocation permission. These coordinates are stored only on your device in localStorage under the keys <code>theme-solar-lat</code> and <code>theme-solar-lng</code>.</li>
          <li>Your theme preference under the key <code>theme-pref</code> (values: <code>light</code>, <code>dark</code>, <code>time</code>, <code>solar</code>, <code>system</code>).</li>
        </ul>
        <p>
          This site does not transmit your geolocation coordinates or theme preferences to the server or third parties.
        </p>
        <h2>Recipients and Processors</h2>
        <ul>
          <li>Vercel (hosting and serverless platform).</li>
          <li>Resend (email delivery provider).</li>
          <li>Your message will also be delivered to my inbox.</li>
        </ul>
        <p>
          These providers may process data outside the EU. Standard Contractual Clauses and appropriate safeguards apply
          per their documentation. Data Processing Agreements are in place or available via their terms.
        </p>
        <h2>Retention</h2>
        <p>
          I keep correspondence for up to 12 months, unless a longer period is necessary to handle your request or comply with legal obligations.
        </p>
        <p>
          Theme-related data (geolocation coordinates and theme preference) are stored only in your browser’s localStorage and remain under your control. You can delete them at any time by clearing site data in your browser.
        </p>
        <h2>Data Security</h2>
        <p>
          Inputs are validated and not logged. Serverless functions apply basic rate-limiting and anti-spam measures.
        </p>
        <h2>User Choices and Controls</h2>
        <ul>
          <li>Geolocation permission can be denied or revoked in your browser settings. If denied, Solar mode falls back to time-based theming.</li>
          <li>You can select a theme manually (Light/Dark/Time/Solar/System) using the theme toggle. The choice is stored locally.</li>
          <li>Clear site data in your browser to remove stored coordinates and preferences.</li>
        </ul>
        <h2>Rights</h2>
        <p>
          You can request access, rectification, erasure, restriction, or object to processing by writing to
          <a href="mailto:thomaszanelli@icloud.com"> thomaszanelli@icloud.com</a>.
        </p>
        <h2>Cookies</h2>
        <p>
          The contact form does not use cookies. Theme features use localStorage only on your device. If additional services (analytics, captcha) are added, this notice will be updated accordingly.
        </p>
        <h2>Change Log</h2>
        <ul>
          <li><strong>{new Date().toISOString().slice(0, 10)}</strong>: Added disclosures for time-based and Solar theme, geolocation consent, and localStorage keys.</li>
        </ul>
        <p className="text-sm text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      </div>
    </main>
  );
}
