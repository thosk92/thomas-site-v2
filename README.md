# Thomas Personal Site Starter (v1.0)

Starter Next.js (App Router) + Tailwind + Framer Motion con Hero XXL e sfondo 3D‑ish leggero (Canvas 2D).

**Data:** 2025-10-14

## Requisiti
- Node.js 18+
- npm o pnpm

## Avvio rapido
```bash
npm install
npm run dev
# poi apri http://localhost:3000
```

## Struttura
- `app/` — Next App Router (layout + page)
- `src/components/Hero.tsx` — Hero con tipografia XXL e CTA
- `src/components/BackgroundCanvas.tsx` — background animato leggero, motion-safe
- Tailwind già pronto (`tailwind.config.js`, `postcss.config.js`, `app/globals.css`)

## Note
- Palette chiara, testo #0F0F10, accento #667302 (verde Thomas)
- Animazioni morbide (Framer Motion)
- Rispetto `prefers-reduced-motion`

## Prossimi step suggeriti
- Aggiungere sezione `Projects` con 3 card
- Toggle visibile “Riduci animazioni”
- SEO (metadati OG, sitemap) e deploy su Vercel
