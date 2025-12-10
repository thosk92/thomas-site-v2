import jwt from "jsonwebtoken";
import fs from "fs";

// INSERISCI QUI I TUOI DATI REALI PRIMA DI LANCIARE LO SCRIPT
// Puoi ottenere questi valori da Apple Developer.

// Team ID del tuo account Apple (Membership)
const TEAM_ID = "SXGGYC232G";

// Services ID usato per il login web (deve coincidere con quello in Supabase e in Apple)
const CLIENT_ID = "io.emma.web";

// Key ID della chiave usata per Sign in with Apple (sezione Keys)
const KEY_ID = "3WGNA2NNHM";

// Nome del file .p8 scaricato da Apple (stessa cartella di questo script)
const PRIVATE_KEY = fs.readFileSync("AuthKey_3WGNA2NNHM.p8", "utf8");

const now = Math.floor(Date.now() / 1000);

// Payload della client secret (validità max ~6 mesi)
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + 15778800, // ~6 mesi
  aud: "https://appleid.apple.com",
  sub: CLIENT_ID,
};

const token = jwt.sign(payload, PRIVATE_KEY, {
  algorithm: "ES256",
  keyid: KEY_ID,
});

console.log("\n=== APPLE CLIENT SECRET (JWT) ===\n");
console.log(token);
console.log("\n=================================\n");
