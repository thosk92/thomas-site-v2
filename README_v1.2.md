# Patch v1.2 — White background + Projects section

**Data:** 2025-10-14

### Novità
- **Sfondo bianco candido**: `BackgroundCanvas.tsx` ora dipinge #FFFFFF senza animazioni (zero distrazioni, massime performance).
- **Sezione Projects (3 card)** con layout minimale, hover leggero e testi placeholder (titolo, outcome, ruolo).
- `app/page.tsx` aggiornato per includere `<Projects />` sotto l'Hero.

### Come applicare
Estrarre lo zip **nella root del progetto** e sovrascrivere i file esistenti:

```bash
cd ~/thomas-personal-site-starter-v1.0
unzip -o thomas-personal-site-v1.2-patch.zip
npm run dev
```

### Dove modificare i contenuti
- Testi Hero: `src/components/Hero.tsx`
- Progetti (titoli/outcome/ruolo): dentro l'array `cards` in `src/components/Projects.tsx`
