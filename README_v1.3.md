# Patch v1.3 — Liquid Light background + Motion toggle

**Data:** 2025-10-14

### Novità
- **Liquid Light**: sfondo bianco con luce fluida e caustiche morbidissime (Canvas 2D), reattivo al mouse.
- **Motion toggle**: pulsante fisso in basso a destra per attivare/disattivare l'animazione (salvato in localStorage).
- **Config**: `src/config/effects.ts` per intensità/velocità/parallax/scale/FPS.
- Hero rimane su **#FFFFFF** (coerente col tuo stile).

### Come applicare
Estrarre lo zip **nella root del progetto** e sovrascrivere i file esistenti:

```bash
cd ~/thomas-personal-site-starter-v1.0
unzip -o thomas-personal-site-v1.3-patch.zip
npm run dev
```

### Dove regolare l'effetto
- `src/config/effects.ts` — modifica `intensity`, `speed`, `parallax`, `scale`, `fps`.
