export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-neutral-200 mt-16">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-neutral-600">
        <p>
          P. IVA: 01492490451 · Sito prodotto da Thomas Zanelli · Tutti i diritti sono riservati · {year}
        </p>
      </div>
    </footer>
  );
}
