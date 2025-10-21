# Patch v1.4 — Specular Paper (safe white animated background)
Data: 2025-10-15

Questa patch sostituisce `src/components/BackgroundCanvas.tsx` con una versione super-sicura:
- solo highlights su bianco (nessuna ombra), impossibile scurire lo schermo;
- canvas opaco bianco ad ogni frame;
- DPR-aware, FPS cap 45, rispetta motion off/reduced.

## Applicazione
Da dentro la root del progetto:
```bash
cd ~/thomas-personal-site-starter-v1.0
unzip -o thomas-personal-site-v1.4-specular-paper.zip
npm run dev
```
Se lo ZIP è nei Download:
```bash
unzip -o ~/Downloads/thomas-personal-site-v1.4-specular-paper.zip -d .
```
