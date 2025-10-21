# Patch v1.7 — Global Worley (base #FAFAFA) + mount in layout
Data: 2025-10-15

Questa patch rende l'effetto **Worley Caustics** globale e visibile su tutto il sito:
- Canvas full-screen montato in `app/layout.tsx` (sotto ai contenuti)
- Base **#FAFAFA** (bianco ottico) + highlights additivi → si vede senza scurire
- Rispetta `prefers-reduced-motion` (frame statico)

## Applica
```bash
cd ~/thomas-personal-site-starter-v1.0
unzip -o thomas-personal-site-v1.7-global-worley.zip
npm run dev
```
Oppure, se lo ZIP è nei Download:
```bash
unzip -o ~/Downloads/thomas-personal-site-v1.7-global-worley.zip -d .
```
