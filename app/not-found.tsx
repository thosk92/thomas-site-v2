export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Pagina non trovata</h1>
        <p className="mt-2 text-muted-foreground">La risorsa richiesta non esiste o è stata spostata.</p>
        <a href="/" className="mt-6 inline-block rounded-md bg-black text-white px-4 py-2">
          Torna alla home
        </a>
      </div>
    </main>
  );
}
