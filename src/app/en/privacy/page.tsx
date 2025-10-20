export default function PrivacyPageEn() {
  return (
    <main className="container mx-auto px-6 sm:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="prose max-w-3xl mt-6">
        <p>
          This page explains how I process personal data collected through the contact form on this website.
        </p>
        <h2>Data Controller</h2>
        <p>
          Thomas Zanelli — Email: <a href="mailto:thomaszanelli@icloud.com">thomaszanelli@icloud.com</a>
        </p>
        <h2>Purpose and Legal Basis</h2>
        <p>
          I process your data solely to respond to your inquiry or proposals regarding work opportunities. The legal basis is
          legitimate interest (Article 6(1)(f) GDPR).
        </p>
        <h2>Data Processed</h2>
        <p>
          Name, email address, and message content. No special categories of data are required.
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
          I keep correspondence for up to 12 months, unless a longer period is necessary to handle your request or comply with
          legal obligations.
        </p>
        <h2>Data Security</h2>
        <p>
          Inputs are validated and not logged. Serverless functions apply basic rate-limiting and anti-spam measures.
        </p>
        <h2>Rights</h2>
        <p>
          You can request access, rectification, erasure, restriction, or object to processing by writing to
          <a href="mailto:thomaszanelli@icloud.com"> thomaszanelli@icloud.com</a>.
        </p>
        <h2>Cookies</h2>
        <p>
          The contact form does not use cookies. If additional services (analytics, captcha) are added, this notice will be
          updated accordingly.
        </p>
        <p className="text-sm text-foreground/70">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      </div>
    </main>
  );
}
