# Patch v1.5 — Worley Caustics (white, visible)
Data: 2025-10-15

Sostituisce `src/components/BackgroundCanvas.tsx` con un effetto **Worley caustics** molto visibile ma pulito su **sfondo bianco**.
- Solo highlights additivi (blend `lighter`) — impossibile scurire.
- Parametri conservativi ma chiari (INTENSITY, CELL, POWER).
- DPR-aware, FPS 45, rispetta motion off/reduced.

## Applicazione
Da dentro la root del progetto:
```bash
cd ~/thomas-personal-site-starter-v1.0
unzip -o thomas-personal-site-v1.5-worley-caustics.zip
npm run dev
```
Se lo ZIP è nei Download:
```bash
unzip -o ~/Downloads/thomas-personal-site-v1.5-worley-caustics.zip -d .
```
