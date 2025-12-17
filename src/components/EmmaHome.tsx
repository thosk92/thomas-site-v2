"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createConversation, updateConversationTitle } from "@/lib/supabase/conversations";
import { getMessages, saveMessage } from "@/lib/supabase/messages";
import {
  LANG_OPTIONS,
  detectLanguage,
  isSupportedLang,
  mapLocaleToLang,
  type Lang,
} from "@/lib/languageDetection";

type Message = { role: "user" | "assistant"; content: string };

type Copy = {
  sessionTitle: string;
  sessionSubtitle: string;
  textareaPlaceholder: string;
  askCta: string;
  loadingLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
  examples: string[];
  dataTitle: string;
  dataBody: string;
  usingAs: string;
  usingAsGuest: string;
  dataCta: string;
  errorEmptyReply: string;
  errorAi: string;
  closeLabel: string;
};

const COPIES: Record<Lang, Copy> = {
  "en-US": {
    sessionTitle: "Tell EMMA what's happening",
    sessionSubtitle: "She helps you unpack what you feel, find the right words, and choose what to do next.",
    textareaPlaceholder: "Write what’s on your mind…",
    askCta: "Send to EMMA",
    loadingLabel: "EMMA is thinking…",
    emptyTitle: "Start a new chat with EMMA",
    emptySubtitle:
      "Describe a thought, a situation, or how you feel. EMMA explains what’s happening and suggests calm, practical ways forward.",
    examples: [
      "I feel overwhelmed",
      "I don’t know how to handle something",
      "Something is making me anxious",
      "I feel left out",
    ],
    dataTitle: "How we use your data",
    dataBody:
      "EMMA stores only what is necessary to respond to your message. Your conversations are not used to profile you or show advertising. You can close this app at any time and your current session will end.",
    usingAs: "You are using EMMA as ",
    usingAsGuest: "You are using EMMA as a guest",
    dataCta: "How we use your data",
    errorEmptyReply: "EMMA's reply is empty. Please try again.",
    errorAi: "An error occurred while calling the AI.",
    closeLabel: "Close",
  },
  "en-GB": {
    sessionTitle: "Tell EMMA what's happening",
    sessionSubtitle: "She helps you unpack what you feel, find the right words, and choose what to do next.",
    textareaPlaceholder: "Write what’s on your mind…",
    askCta: "Send to EMMA",
    loadingLabel: "EMMA is thinking…",
    emptyTitle: "Start a new chat with EMMA",
    emptySubtitle:
      "Describe a thought, a situation, or how you feel. EMMA explains what’s happening and suggests calm, practical ways forward.",
    examples: [
      "I feel overwhelmed",
      "I don’t know how to handle something",
      "Something is making me anxious",
      "I feel left out",
    ],
    dataTitle: "How we use your data",
    dataBody:
      "EMMA stores only what is necessary to respond to your message. Your conversations are not used to profile you or show advertising. You can close this app at any time and your current session will end.",
    usingAs: "You are using EMMA as ",
    usingAsGuest: "You are using EMMA as a guest",
    dataCta: "How we use your data",
    errorEmptyReply: "EMMA's reply is empty. Please try again.",
    errorAi: "An error occurred while calling the AI.",
    closeLabel: "Close",
  },
  it: {
    sessionTitle: "Racconta a EMMA cosa sta succedendo",
    sessionSubtitle:
      "Ti aiuta a dare un nome a quello che provi, trovare le parole giuste e decidere cosa fare dopo.",
    textareaPlaceholder: "Scrivi cosa ti passa per la mente…",
    askCta: "Invia a EMMA",
    loadingLabel: "EMMA sta pensando…",
    emptyTitle: "Inizia una nuova chat con EMMA",
    emptySubtitle:
      "Descrivi un pensiero, una situazione o come ti senti. EMMA spiega cosa sta succedendo e ti suggerisce modi calmi e pratici per andare avanti.",
    examples: [
      "Mi sento sopraffatto",
      "Non so come gestire una situazione",
      "Qualcosa mi fa stare male",
      "Mi sento escluso",
    ],
    dataTitle: "Come usiamo i tuoi dati",
    dataBody:
      "EMMA conserva solo ciò che serve per rispondere al tuo messaggio. Le tue conversazioni non vengono usate per profilarti o mostrarti pubblicità. Puoi chiudere l’app in qualsiasi momento e la tua sessione attuale terminerà.",
    usingAs: "Stai usando EMMA come ",
    usingAsGuest: "Stai usando EMMA come ospite",
    dataCta: "Come usiamo i tuoi dati",
    errorEmptyReply: "La risposta di EMMA è vuota. Riprova.",
    errorAi: "Si è verificato un errore chiamando l'AI.",
    closeLabel: "Chiudi",
  },
  es: {
    sessionTitle: "Cuéntale a EMMA qué está pasando",
    sessionSubtitle:
      "Te ayuda a poner nombre a lo que sientes, encontrar las palabras adecuadas y decidir qué hacer después.",
    textareaPlaceholder: "Escribe lo que tienes en mente…",
    askCta: "Enviar a EMMA",
    loadingLabel: "EMMA está pensando…",
    emptyTitle: "Empieza un nuevo chat con EMMA",
    emptySubtitle:
      "Describe un pensamiento, una situación o cómo te sientes. EMMA explica qué está pasando y sugiere caminos prácticos y tranquilos.",
    examples: [
      "Me siento abrumado/a",
      "No sé cómo manejar algo",
      "Algo me da ansiedad",
      "Me siento excluido/a",
    ],
    dataTitle: "Cómo usamos tus datos",
    dataBody:
      "EMMA guarda solo lo necesario para responder a tu mensaje. No usamos tus conversaciones para perfilarte ni mostrar publicidad. Puedes cerrar la app cuando quieras y tu sesión terminará.",
    usingAs: "Estás usando EMMA como ",
    usingAsGuest: "Estás usando EMMA como invitado/a",
    dataCta: "Cómo usamos tus datos",
    errorEmptyReply: "La respuesta de EMMA está vacía. Inténtalo de nuevo.",
    errorAi: "Ocurrió un error al llamar a la IA.",
    closeLabel: "Cerrar",
  },
  fr: {
    sessionTitle: "Dis à EMMA ce qui se passe",
    sessionSubtitle:
      "Elle t’aide à mettre des mots sur ce que tu ressens, à trouver la bonne formulation et à décider quoi faire ensuite.",
    textareaPlaceholder: "Écris ce que tu as en tête…",
    askCta: "Envoyer à EMMA",
    loadingLabel: "EMMA réfléchit…",
    emptyTitle: "Commence un nouveau chat avec EMMA",
    emptySubtitle:
      "Décris une pensée, une situation ou ce que tu ressens. EMMA t’explique ce qui se passe et propose des pistes calmes et concrètes.",
    examples: [
      "Je me sens dépassé(e)",
      "Je ne sais pas gérer quelque chose",
      "Quelque chose m’angoisse",
      "Je me sens exclu(e)",
    ],
    dataTitle: "Comment nous utilisons vos données",
    dataBody:
      "EMMA ne conserve que ce qui est nécessaire pour répondre à ton message. Tes conversations ne servent pas à te profiler ni à afficher de la publicité. Tu peux fermer l’app quand tu veux et ta session se termine.",
    usingAs: "Tu utilises EMMA en tant que ",
    usingAsGuest: "Tu utilises EMMA en invité",
    dataCta: "Comment nous utilisons vos données",
    errorEmptyReply: "La réponse d’EMMA est vide. Réessaie.",
    errorAi: "Une erreur est survenue lors de l’appel à l’IA.",
    closeLabel: "Fermer",
  },
  de: {
    sessionTitle: "Erzähl EMMA, was passiert",
    sessionSubtitle:
      "Sie hilft dir zu verstehen, was du fühlst, die richtigen Worte zu finden und den nächsten Schritt zu wählen.",
    textareaPlaceholder: "Schreib, was dir durch den Kopf geht…",
    askCta: "An EMMA senden",
    loadingLabel: "EMMA denkt nach…",
    emptyTitle: "Starte einen neuen Chat mit EMMA",
    emptySubtitle:
      "Beschreibe einen Gedanken, eine Situation oder wie du dich fühlst. EMMA erklärt, was passiert, und schlägt ruhige, praktische Wege vor.",
    examples: [
      "Ich fühle mich überfordert",
      "Ich weiß nicht, wie ich etwas handhaben soll",
      "Etwas macht mich nervös",
      "Ich fühle mich ausgeschlossen",
    ],
    dataTitle: "So nutzen wir deine Daten",
    dataBody:
      "EMMA speichert nur das Nötige, um auf deine Nachricht zu antworten. Deine Gespräche werden nicht für Profile oder Werbung genutzt. Du kannst die App jederzeit schließen und deine Sitzung endet.",
    usingAs: "Du nutzt EMMA als ",
    usingAsGuest: "Du nutzt EMMA als Gast",
    dataCta: "So nutzen wir deine Daten",
    errorEmptyReply: "Die Antwort von EMMA ist leer. Bitte versuche es erneut.",
    errorAi: "Beim Aufruf der KI ist ein Fehler aufgetreten.",
    closeLabel: "Schließen",
  },
  "pt-PT": {
    sessionTitle: "Conta à EMMA o que está a acontecer",
    sessionSubtitle:
      "Ela ajuda-te a dar nome ao que sentes, encontrar as palavras certas e decidir o que fazer a seguir.",
    textareaPlaceholder: "Escreve o que te vai na cabeça…",
    askCta: "Enviar para a EMMA",
    loadingLabel: "A EMMA está a pensar…",
    emptyTitle: "Inicia um novo chat com a EMMA",
    emptySubtitle:
      "Descreve um pensamento, uma situação ou como te sentes. A EMMA explica o que se passa e sugere caminhos calmos e práticos.",
    examples: [
      "Sinto-me sobrecarregado/a",
      "Não sei como lidar com algo",
      "Algo deixa-me ansioso/a",
      "Sinto-me excluído/a",
    ],
    dataTitle: "Como usamos os teus dados",
    dataBody:
      "A EMMA guarda apenas o necessário para responder à tua mensagem. Não usamos as conversas para te perfilar nem para publicidade. Podes fechar a app a qualquer momento e a tua sessão termina.",
    usingAs: "Estás a usar a EMMA como ",
    usingAsGuest: "Estás a usar a EMMA como convidado/a",
    dataCta: "Como usamos os teus dados",
    errorEmptyReply: "A resposta da EMMA está vazia. Tenta de novo.",
    errorAi: "Ocorreu um erro ao chamar a IA.",
    closeLabel: "Fechar",
  },
  "pt-BR": {
    sessionTitle: "Conte para a EMMA o que está acontecendo",
    sessionSubtitle:
      "Ela ajuda você a dar nome ao que sente, encontrar as palavras certas e decidir o que fazer depois.",
    textareaPlaceholder: "Escreva o que está na sua mente…",
    askCta: "Enviar para a EMMA",
    loadingLabel: "A EMMA está pensando…",
    emptyTitle: "Comece um novo chat com a EMMA",
    emptySubtitle:
      "Descreva um pensamento, uma situação ou como você se sente. A EMMA explica o que está acontecendo e sugere caminhos calmos e práticos.",
    examples: [
      "Estou me sentindo sobrecarregado(a)",
      "Não sei como lidar com algo",
      "Algo está me deixando ansioso(a)",
      "Estou me sentindo excluído(a)",
    ],
    dataTitle: "Como usamos seus dados",
    dataBody:
      "A EMMA guarda apenas o necessário para responder à sua mensagem. Suas conversas não são usadas para perfil ou publicidade. Você pode fechar o app a qualquer momento e sua sessão termina.",
    usingAs: "Você está usando a EMMA como ",
    usingAsGuest: "Você está usando a EMMA como convidado(a)",
    dataCta: "Como usamos seus dados",
    errorEmptyReply: "A resposta da EMMA está vazia. Tente novamente.",
    errorAi: "Ocorreu um erro ao chamar a IA.",
    closeLabel: "Fechar",
  },
  nl: {
    sessionTitle: "Vertel EMMA wat er gebeurt",
    sessionSubtitle:
      "Ze helpt je te begrijpen wat je voelt, de juiste woorden te vinden en de volgende stap te kiezen.",
    textareaPlaceholder: "Schrijf wat er in je opkomt…",
    askCta: "Stuur naar EMMA",
    loadingLabel: "EMMA denkt na…",
    emptyTitle: "Start een nieuwe chat met EMMA",
    emptySubtitle:
      "Beschrijf een gedachte, een situatie of hoe je je voelt. EMMA legt uit wat er gebeurt en stelt rustige, praktische stappen voor.",
    examples: [
      "Ik voel me overweldigd",
      "Ik weet niet hoe ik iets moet aanpakken",
      "Iets maakt me angstig",
      "Ik voel me buitengesloten",
    ],
    dataTitle: "Hoe we je gegevens gebruiken",
    dataBody:
      "EMMA bewaart alleen wat nodig is om op je bericht te reageren. Je gesprekken worden niet gebruikt voor profilering of advertenties. Je kunt de app altijd sluiten en je sessie stopt.",
    usingAs: "Je gebruikt EMMA als ",
    usingAsGuest: "Je gebruikt EMMA als gast",
    dataCta: "Hoe we je gegevens gebruiken",
    errorEmptyReply: "Het antwoord van EMMA is leeg. Probeer het opnieuw.",
    errorAi: "Er is een fout opgetreden bij het aanroepen van de AI.",
    closeLabel: "Sluiten",
  },
  sv: {
    sessionTitle: "Berätta för EMMA vad som händer",
    sessionSubtitle:
      "Hon hjälper dig att förstå vad du känner, hitta rätt ord och välja vad du ska göra härnäst.",
    textareaPlaceholder: "Skriv vad du tänker på…",
    askCta: "Skicka till EMMA",
    loadingLabel: "EMMA funderar…",
    emptyTitle: "Starta en ny chatt med EMMA",
    emptySubtitle:
      "Beskriv en tanke, en situation eller hur du mår. EMMA förklarar vad som händer och föreslår lugna, praktiska steg.",
    examples: [
      "Jag känner mig överväldigad",
      "Jag vet inte hur jag ska hantera något",
      "Något gör mig orolig",
      "Jag känner mig utanför",
    ],
    dataTitle: "Hur vi använder dina uppgifter",
    dataBody:
      "EMMA sparar bara det som behövs för att svara på ditt meddelande. Dina konversationer används inte för profilering eller annonser. Du kan stänga appen när som helst och din session avslutas.",
    usingAs: "Du använder EMMA som ",
    usingAsGuest: "Du använder EMMA som gäst",
    dataCta: "Hur vi använder dina uppgifter",
    errorEmptyReply: "EMMAs svar är tomt. Försök igen.",
    errorAi: "Ett fel uppstod när AI:n kallades.",
    closeLabel: "Stäng",
  },
  no: {
    sessionTitle: "Fortell EMMA hva som skjer",
    sessionSubtitle:
      "Hun hjelper deg å forstå hva du føler, finne de riktige ordene og velge hva du skal gjøre videre.",
    textareaPlaceholder: "Skriv det du tenker på…",
    askCta: "Send til EMMA",
    loadingLabel: "EMMA tenker…",
    emptyTitle: "Start en ny chat med EMMA",
    emptySubtitle:
      "Beskriv en tanke, en situasjon eller hvordan du har det. EMMA forklarer hva som skjer og foreslår rolige, praktiske steg.",
    examples: [
      "Jeg føler meg overveldet",
      "Jeg vet ikke hvordan jeg skal håndtere noe",
      "Noe gjør meg engstelig",
      "Jeg føler meg utenfor",
    ],
    dataTitle: "Hvordan vi bruker dataene dine",
    dataBody:
      "EMMA lagrer bare det som er nødvendig for å svare på meldingen din. Samtalene dine brukes ikke til profilering eller reklame. Du kan lukke appen når som helst, så avsluttes økten.",
    usingAs: "Du bruker EMMA som ",
    usingAsGuest: "Du bruker EMMA som gjest",
    dataCta: "Hvordan vi bruker dataene dine",
    errorEmptyReply: "Svaret fra EMMA er tomt. Prøv igjen.",
    errorAi: "Det oppsto en feil under kall til AI-en.",
    closeLabel: "Lukk",
  },
  da: {
    sessionTitle: "Fortæl EMMA, hvad der sker",
    sessionSubtitle:
      "Hun hjælper dig med at forstå, hvad du føler, finde de rigtige ord og vælge det næste skridt.",
    textareaPlaceholder: "Skriv, hvad du tænker på…",
    askCta: "Send til EMMA",
    loadingLabel: "EMMA tænker…",
    emptyTitle: "Start en ny chat med EMMA",
    emptySubtitle:
      "Beskriv en tanke, en situation eller hvordan du har det. EMMA forklarer, hvad der sker, og foreslår rolige, praktiske skridt.",
    examples: [
      "Jeg føler mig overvældet",
      "Jeg ved ikke, hvordan jeg skal håndtere noget",
      "Noget gør mig urolig",
      "Jeg føler mig udenfor",
    ],
    dataTitle: "Sådan bruger vi dine data",
    dataBody:
      "EMMA gemmer kun det, der er nødvendigt for at svare på din besked. Dine samtaler bruges ikke til profilering eller reklame. Du kan lukke appen når som helst, og din session afsluttes.",
    usingAs: "Du bruger EMMA som ",
    usingAsGuest: "Du bruger EMMA som gæst",
    dataCta: "Sådan bruger vi dine data",
    errorEmptyReply: "EMMAs svar er tomt. Prøv igen.",
    errorAi: "Der opstod en fejl ved kald til AI'en.",
    closeLabel: "Luk",
  },
  fi: {
    sessionTitle: "Kerro EMMAlle, mitä tapahtuu",
    sessionSubtitle:
      "Hän auttaa ymmärtämään tunteitasi, löytämään oikeat sanat ja valitsemaan seuraavan askeleen.",
    textareaPlaceholder: "Kirjoita, mitä mielessäsi on…",
    askCta: "Lähetä EMMAlle",
    loadingLabel: "EMMA ajattelee…",
    emptyTitle: "Aloita uusi keskustelu EMMAn kanssa",
    emptySubtitle:
      "Kuvaile ajatus, tilanne tai miltä sinusta tuntuu. EMMA selittää, mitä tapahtuu, ja ehdottaa rauhallisia, käytännöllisiä askelia.",
    examples: [
      "Tunnen oloni ylivoimaiseksi",
      "En tiedä, miten käsitellä jotain",
      "Jokin tekee minut levottomaksi",
      "Tunnen itseni ulkopuoliseksi",
    ],
    dataTitle: "Kuinka käytämme tietojasi",
    dataBody:
      "EMMA tallentaa vain sen, mikä on tarpeen vastatakseen viestiisi. Keskusteluja ei käytetä profilointiin tai mainontaan. Voit sulkea sovelluksen milloin tahansa ja istuntosi päättyy.",
    usingAs: "Käytät EMMAa käyttäjänä ",
    usingAsGuest: "Käytät EMMAa vieraana",
    dataCta: "Kuinka käytämme tietojasi",
    errorEmptyReply: "EMMAn vastaus on tyhjä. Yritä uudelleen.",
    errorAi: "Tapahtui virhe kutsuttaessa tekoälyä.",
    closeLabel: "Sulje",
  },
  pl: {
    sessionTitle: "Powiedz EMMA, co się dzieje",
    sessionSubtitle:
      "Pomaga zrozumieć, co czujesz, znaleźć właściwe słowa i wybrać kolejny krok.",
    textareaPlaceholder: "Napisz, co masz na myśli…",
    askCta: "Wyślij do EMMA",
    loadingLabel: "EMMA myśli…",
    emptyTitle: "Rozpocznij nowy czat z EMMA",
    emptySubtitle:
      "Opisz myśl, sytuację lub to, co czujesz. EMMA wyjaśni, co się dzieje, i zaproponuje spokojne, praktyczne rozwiązania.",
    examples: [
      "Czuję się przytłoczony/a",
      "Nie wiem, jak coś ogarnąć",
      "Coś wywołuje u mnie lęk",
      "Czuję się wykluczony/a",
    ],
    dataTitle: "Jak wykorzystujemy Twoje dane",
    dataBody:
      "EMMA przechowuje tylko to, co konieczne, by odpowiedzieć na Twoją wiadomość. Rozmowy nie są używane do profilowania ani reklam. Możesz zamknąć aplikację w każdej chwili, a sesja się zakończy.",
    usingAs: "Korzystasz z EMMA jako ",
    usingAsGuest: "Korzystasz z EMMA jako gość",
    dataCta: "Jak wykorzystujemy Twoje dane",
    errorEmptyReply: "Odpowiedź EMMA jest pusta. Spróbuj ponownie.",
    errorAi: "Wystąpił błąd podczas wywołania AI.",
    closeLabel: "Zamknij",
  },
  cs: {
    sessionTitle: "Řekni EMMĚ, co se děje",
    sessionSubtitle:
      "Pomůže ti porozumět tomu, co cítíš, najít správná slova a zvolit další krok.",
    textareaPlaceholder: "Napiš, co máš na mysli…",
    askCta: "Poslat EMMĚ",
    loadingLabel: "EMMA přemýšlí…",
    emptyTitle: "Začni nový chat s EMMOU",
    emptySubtitle:
      "Popiš myšlenku, situaci nebo jak se cítíš. EMMA vysvětlí, co se děje, a navrhne klidné, praktické kroky.",
    examples: [
      "Cítím se zahlcený/á",
      "Nevím, jak něco zvládnout",
      "Něco mě znepokojuje",
      "Cítím se vyřazený/á",
    ],
    dataTitle: "Jak používáme tvá data",
    dataBody:
      "EMMA ukládá jen to nejnutnější pro odpověď na tvou zprávu. Rozhovory nepoužíváme k profilování ani reklamě. Aplikaci můžeš kdykoli zavřít a sezení skončí.",
    usingAs: "Používáš EMMU jako ",
    usingAsGuest: "Používáš EMMU jako host",
    dataCta: "Jak používáme tvá data",
    errorEmptyReply: "Odpověď EMMA je prázdná. Zkus to znovu.",
    errorAi: "Při volání AI došlo k chybě.",
    closeLabel: "Zavřít",
  },
  sk: {
    sessionTitle: "Povedz EMMA, čo sa deje",
    sessionSubtitle:
      "Pomôže ti pochopiť, čo cítiš, nájsť správne slová a zvoliť ďalší krok.",
    textareaPlaceholder: "Napíš, čo máš na mysli…",
    askCta: "Poslať EMMA",
    loadingLabel: "EMMA premýšľa…",
    emptyTitle: "Začni nový chat s EMMA",
    emptySubtitle:
      "Opíš myšlienku, situáciu alebo to, ako sa cítiš. EMMA vysvetlí, čo sa deje, a navrhne pokojné, praktické kroky.",
    examples: [
      "Cítim sa preťažený/á",
      "Neviem, ako niečo zvládnuť",
      "Niečo ma znepokojuje",
      "Cítim sa vyčlenený/á",
    ],
    dataTitle: "Ako používame tvoje údaje",
    dataBody:
      "EMMA uchováva len to, čo je potrebné na odpoveď na tvoju správu. Rozhovory nepoužívame na profilovanie ani reklamu. Aplikáciu môžeš kedykoľvek zatvoriť a sedenie sa ukončí.",
    usingAs: "Používaš EMMA ako ",
    usingAsGuest: "Používaš EMMA ako hosť",
    dataCta: "Ako používame tvoje údaje",
    errorEmptyReply: "Odpoveď EMMA je prázdna. Skús znova.",
    errorAi: "Pri volaní AI došlo k chybe.",
    closeLabel: "Zavrieť",
  },
  sl: {
    sessionTitle: "Povej EMMI, kaj se dogaja",
    sessionSubtitle:
      "Pomaga ti razumeti, kaj čutiš, najti prave besede in izbrati naslednji korak.",
    textareaPlaceholder: "Napiši, kar imaš v mislih…",
    askCta: "Pošlji EMMI",
    loadingLabel: "EMMA razmišlja…",
    emptyTitle: "Začni nov klepet z EMMO",
    emptySubtitle:
      "Opiši misel, situacijo ali kako se počutiš. EMMA razloži, kaj se dogaja, in predlaga mirne, praktične korake.",
    examples: [
      "Počutim se preobremenjeno",
      "Ne vem, kako kaj obvladati",
      "Nekaj me spravlja v tesnobo",
      "Počutim se izključeno",
    ],
    dataTitle: "Kako uporabljamo tvoje podatke",
    dataBody:
      "EMMA shrani le, kar je potrebno za odgovor na tvoje sporočilo. Pogovorov ne uporabljamo za profiliranje ali oglaševanje. Aplikacijo lahko kadarkoli zapreš in seja se konča.",
    usingAs: "Uporabljaš EMMO kot ",
    usingAsGuest: "Uporabljaš EMMO kot gost",
    dataCta: "Kako uporabljamo tvoje podatke",
    errorEmptyReply: "EMMIN odgovor je prazen. Poskusi znova.",
    errorAi: "Pri klicu AI je prišlo do napake.",
    closeLabel: "Zapri",
  },
  hu: {
    sessionTitle: "Mondd el EMMÁnak, mi történik",
    sessionSubtitle:
      "Segít megérteni, mit érzel, megtalálni a megfelelő szavakat és kiválasztani a következő lépést.",
    textareaPlaceholder: "Írd le, ami a fejedben van…",
    askCta: "Küldés EMMÁnak",
    loadingLabel: "EMMA gondolkodik…",
    emptyTitle: "Kezdj új beszélgetést EMMÁval",
    emptySubtitle:
      "Írj le egy gondolatot, helyzetet vagy azt, hogyan érzed magad. EMMA elmagyarázza, mi történik, és nyugodt, gyakorlati lépéseket javasol.",
    examples: [
      "Túlterheltnek érzem magam",
      "Nem tudom, hogyan kezeljek valamit",
      "Valami szorongást kelt bennem",
      "Kirekesztettnek érzem magam",
    ],
    dataTitle: "Hogyan használjuk az adataidat",
    dataBody:
      "Az EMMA csak a válaszhoz szükséges adatokat tárolja. A beszélgetéseket nem használjuk profilalkotáshoz vagy reklámhoz. Bármikor bezárhatod az appot, és a munkamenet véget ér.",
    usingAs: "Az EMMÁT így használod: ",
    usingAsGuest: "Az EMMÁT vendégként használod",
    dataCta: "Hogyan használjuk az adataidat",
    errorEmptyReply: "EMMA válasza üres. Próbáld újra.",
    errorAi: "Hiba történt az AI hívása közben.",
    closeLabel: "Bezár",
  },
  ro: {
    sessionTitle: "Spune-i EMMA ce se întâmplă",
    sessionSubtitle:
      "Te ajută să înțelegi ce simți, să găsești cuvintele potrivite și să alegi ce să faci mai departe.",
    textareaPlaceholder: "Scrie ce ai pe suflet…",
    askCta: "Trimite către EMMA",
    loadingLabel: "EMMA se gândește…",
    emptyTitle: "Începe un chat nou cu EMMA",
    emptySubtitle:
      "Descrie un gând, o situație sau cum te simți. EMMA explică ce se întâmplă și sugerează pași liniștiți și practici.",
    examples: [
      "Mă simt copleșit/ă",
      "Nu știu cum să gestionez ceva",
      "Ceva îmi provoacă anxietate",
      "Mă simt exclus/ă",
    ],
    dataTitle: "Cum îți folosim datele",
    dataBody:
      "EMMA păstrează doar ce este necesar pentru a răspunde mesajului tău. Conversațiile tale nu sunt folosite pentru profilare sau publicitate. Poți închide aplicația oricând, iar sesiunea se încheie.",
    usingAs: "Folosești EMMA ca ",
    usingAsGuest: "Folosești EMMA ca invitat",
    dataCta: "Cum îți folosim datele",
    errorEmptyReply: "Răspunsul EMMA este gol. Încearcă din nou.",
    errorAi: "A apărut o eroare la apelarea AI.",
    closeLabel: "Închide",
  },
  bg: {
    sessionTitle: "Кажи на EMMA какво се случва",
    sessionSubtitle:
      "Тя ти помага да разбереш какво чувстваш, да намериш точните думи и да избереш следващата стъпка.",
    textareaPlaceholder: "Напиши какво ти е на ума…",
    askCta: "Изпрати до EMMA",
    loadingLabel: "EMMA мисли…",
    emptyTitle: "Започни нов чат с EMMA",
    emptySubtitle:
      "Опиши мисъл, ситуация или как се чувстваш. EMMA обяснява какво се случва и предлага спокойни, практични стъпки.",
    examples: [
      "Чувствам се претоварен/а",
      "Не знам как да се справя с нещо",
      "Нещо ме тревожи",
      "Чувствам се изключен/а",
    ],
    dataTitle: "Как използваме данните ти",
    dataBody:
      "EMMA пази само необходимото, за да отговори на съобщението ти. Разговорите ти не се използват за профилиране или реклама. Можеш да затвориш приложението по всяко време и сесията приключва.",
    usingAs: "Използваш EMMA като ",
    usingAsGuest: "Използваш EMMA като гост",
    dataCta: "Как използваме данните ти",
    errorEmptyReply: "Отговорът на EMMA е празен. Опитай отново.",
    errorAi: "Възникна грешка при извикване на AI.",
    closeLabel: "Затвори",
  },
  hr: {
    sessionTitle: "Reci EMMI što se događa",
    sessionSubtitle:
      "Pomaže ti razumjeti što osjećaš, pronaći prave riječi i odlučiti što dalje.",
    textareaPlaceholder: "Napiši što ti je na umu…",
    askCta: "Pošalji EMMI",
    loadingLabel: "EMMA razmišlja…",
    emptyTitle: "Započni novi chat s EMMOM",
    emptySubtitle:
      "Opiši misao, situaciju ili kako se osjećaš. EMMA objašnjava što se događa i predlaže mirne, praktične korake.",
    examples: [
      "Osjećam se preopterećeno",
      "Ne znam kako nešto riješiti",
      "Nešto mi stvara tjeskobu",
      "Osjećam se isključeno",
    ],
    dataTitle: "Kako koristimo tvoje podatke",
    dataBody:
      "EMMA čuva samo ono što je potrebno da odgovori na tvoju poruku. Razgovori se ne koriste za profiliranje ili oglase. Aplikaciju možeš zatvoriti u bilo kojem trenutku i sesija završava.",
    usingAs: "Koristiš EMMU kao ",
    usingAsGuest: "Koristiš EMMU kao gost",
    dataCta: "Kako koristimo tvoje podatke",
    errorEmptyReply: "Odgovor EMMA je prazan. Pokušaj ponovo.",
    errorAi: "Došlo je do pogreške pri pozivu AI-ja.",
    closeLabel: "Zatvori",
  },
  sr: {
    sessionTitle: "Reci EMMI šta se dešava",
    sessionSubtitle:
      "Pomaže ti da razumeš šta osećaš, nađeš prave reči i odlučiš šta dalje.",
    textareaPlaceholder: "Napiši šta ti je na umu…",
    askCta: "Pošalji EMMI",
    loadingLabel: "EMMA razmišlja…",
    emptyTitle: "Započni novi čat sa EMMOM",
    emptySubtitle:
      "Opiši misao, situaciju ili kako se osećaš. EMMA objašnjava šta se dešava i predlaže mirne, praktične korake.",
    examples: [
      "Osećam se preopterećeno",
      "Ne znam kako da se nosim s nečim",
      "Nešto me čini anksioznim",
      "Osećam se isključeno",
    ],
    dataTitle: "Kako koristimo tvoje podatke",
    dataBody:
      "EMMA čuva samo ono što je potrebno da odgovori na tvoju poruku. Razgovori se ne koriste za profilisanje ili reklame. Možeš zatvoriti aplikaciju kad god želiš i sesija se završava.",
    usingAs: "Koristiš EMMU kao ",
    usingAsGuest: "Koristiš EMMU kao gost",
    dataCta: "Kako koristimo tvoje podatke",
    errorEmptyReply: "Odgovor EMMA je prazan. Pokušaj ponovo.",
    errorAi: "Došlo je do greške pri pozivu AI-ja.",
    closeLabel: "Zatvori",
  },
  ru: {
    sessionTitle: "Расскажи EMMA, что происходит",
    sessionSubtitle:
      "Она помогает понять, что ты чувствуешь, найти правильные слова и выбрать следующий шаг.",
    textareaPlaceholder: "Напиши, о чем ты думаешь…",
    askCta: "Отправить EMMA",
    loadingLabel: "EMMA думает…",
    emptyTitle: "Начни новый чат с EMMA",
    emptySubtitle:
      "Опиши мысль, ситуацию или то, что чувствуешь. EMMA объяснит, что происходит, и предложит спокойные, практичные шаги.",
    examples: [
      "Я чувствую себя перегруженным",
      "Не знаю, как справиться с чем-то",
      "Что-то вызывает у меня тревогу",
      "Чувствую себя исключенным",
    ],
    dataTitle: "Как мы используем твои данные",
    dataBody:
      "EMMA хранит только то, что нужно для ответа на твое сообщение. Разговоры не используются для профилирования или рекламы. Ты можешь закрыть приложение в любой момент, и сессия завершится.",
    usingAs: "Ты используешь EMMA как ",
    usingAsGuest: "Ты используешь EMMA как гость",
    dataCta: "Как мы используем твои данные",
    errorEmptyReply: "Ответ EMMA пуст. Попробуй еще раз.",
    errorAi: "Произошла ошибка при обращении к ИИ.",
    closeLabel: "Закрыть",
  },
  uk: {
    sessionTitle: "Розкажи EMMA, що відбувається",
    sessionSubtitle:
      "Вона допоможе зрозуміти, що ти відчуваєш, підібрати правильні слова й обрати наступний крок.",
    textareaPlaceholder: "Напиши, що в тебе на думці…",
    askCta: "Надіслати EMMA",
    loadingLabel: "EMMA думає…",
    emptyTitle: "Почни новий чат з EMMA",
    emptySubtitle:
      "Опиши думку, ситуацію чи свої відчуття. EMMA пояснить, що відбувається, і запропонує спокійні, практичні кроки.",
    examples: [
      "Я відчуваю перевтому",
      "Не знаю, як упоратися з чимось",
      "Щось викликає в мене тривогу",
      "Я почуваюся відстороненим",
    ],
    dataTitle: "Як ми використовуємо твої дані",
    dataBody:
      "EMMA зберігає лише необхідне, щоб відповісти на твоє повідомлення. Розмови не використовуються для профілювання чи реклами. Ти можеш закрити застосунок у будь-який момент — сесія завершиться.",
    usingAs: "Ти використовуєш EMMA як ",
    usingAsGuest: "Ти використовуєш EMMA як гість",
    dataCta: "Як ми використовуємо твої дані",
    errorEmptyReply: "Відповідь EMMA порожня. Спробуй ще раз.",
    errorAi: "Сталася помилка під час виклику AI.",
    closeLabel: "Закрити",
  },
  tr: {
    sessionTitle: "EMMA'ya neler olduğunu anlat",
    sessionSubtitle:
      "Ne hissettiğini anlamana, doğru kelimeleri bulmana ve sonraki adımı seçmene yardım eder.",
    textareaPlaceholder: "Aklından geçenleri yaz…",
    askCta: "EMMA'ya gönder",
    loadingLabel: "EMMA düşünüyor…",
    emptyTitle: "EMMA ile yeni bir sohbet başlat",
    emptySubtitle:
      "Bir düşünceyi, durumu veya nasıl hissettiğini anlat. EMMA neler olduğunu açıklar ve sakin, pratik adımlar önerir.",
    examples: [
      "Kendimi bunalmış hissediyorum",
      "Bir şeyi nasıl yapacağımı bilmiyorum",
      "Bir şey beni kaygılandırıyor",
      "Kendimi dışlanmış hissediyorum",
    ],
    dataTitle: "Verilerini nasıl kullanıyoruz",
    dataBody:
      "EMMA yalnızca mesajına yanıt vermek için gerekenleri saklar. Sohbetlerin profil çıkarma veya reklam için kullanılmaz. Uygulamayı istediğin zaman kapatabilir ve oturumu bitirebilirsin.",
    usingAs: "EMMA'yı şu şekilde kullanıyorsun: ",
    usingAsGuest: "EMMA'yı misafir olarak kullanıyorsun",
    dataCta: "Verilerini nasıl kullanıyoruz",
    errorEmptyReply: "EMMA'nın cevabı boş. Lütfen tekrar dene.",
    errorAi: "AI çağrılırken bir hata oluştu.",
    closeLabel: "Kapat",
  },
  el: {
    sessionTitle: "Πες στην EMMA τι συμβαίνει",
    sessionSubtitle:
      "Σε βοηθά να καταλάβεις τι νιώθεις, να βρεις τις σωστές λέξεις και να διαλέξεις το επόμενο βήμα.",
    textareaPlaceholder: "Γράψε τι σκέφτεσαι…",
    askCta: "Στείλε στην EMMA",
    loadingLabel: "Η EMMA σκέφτεται…",
    emptyTitle: "Ξεκίνα ένα νέο chat με την EMMA",
    emptySubtitle:
      "Περιέγραψε μια σκέψη, μια κατάσταση ή πώς αισθάνεσαι. Η EMMA εξηγεί τι συμβαίνει και προτείνει ήρεμα, πρακτικά βήματα.",
    examples: [
      "Νιώθω υπερβολική πίεση",
      "Δεν ξέρω πώς να χειριστώ κάτι",
      "Κάτι με αγχώνει",
      "Νιώθω αποκλεισμένος/η",
    ],
    dataTitle: "Πώς χρησιμοποιούμε τα δεδομένα σου",
    dataBody:
      "Η EMMA κρατά μόνο όσα χρειάζονται για να απαντήσει στο μήνυμά σου. Οι συνομιλίες σου δεν χρησιμοποιούνται για προφίλ ή διαφημίσεις. Μπορείς να κλείσεις την εφαρμογή οποιαδήποτε στιγμή και η συνεδρία θα τερματιστεί.",
    usingAs: "Χρησιμοποιείς την EMMA ως ",
    usingAsGuest: "Χρησιμοποιείς την EMMA ως επισκέπτης",
    dataCta: "Πώς χρησιμοποιούμε τα δεδομένα σου",
    errorEmptyReply: "Η απάντηση της EMMA είναι κενή. Δοκίμασε ξανά.",
    errorAi: "Παρουσιάστηκε σφάλμα κατά την κλήση της AI.",
    closeLabel: "Κλείσιμο",
  },
  hi: {
    sessionTitle: "EMMA को बताएं क्या हो रहा है",
    sessionSubtitle:
      "वह आपको महसूस करने वाली बात समझने, सही शब्द खोजने और अगला कदम चुनने में मदद करती है.",
    textareaPlaceholder: "अपने मन की बात लिखें…",
    askCta: "EMMA को भेजें",
    loadingLabel: "EMMA सोच रही है…",
    emptyTitle: "EMMA के साथ नई चैट शुरू करें",
    emptySubtitle:
      "कोई विचार, स्थिति या अपनी भावना लिखें. EMMA बताएगी क्या हो रहा है और शांत, व्यावहारिक कदम सुझाएगी.",
    examples: [
      "मैं बहुत बोझिल महसूस कर रहा/रही हूँ",
      "मुझे नहीं पता किसी चीज़ को कैसे संभालूँ",
      "कुछ मुझे चिंतित कर रहा है",
      "मैं खुद को अलग-थलग महसूस कर रहा/रही हूँ",
    ],
    dataTitle: "हम आपके डेटा का कैसे उपयोग करते हैं",
    dataBody:
      "EMMA सिर्फ इतना रखती है जितना आपके संदेश का उत्तर देने के लिए जरूरी है. आपकी बातचीत प्रोफाइलिंग या विज्ञापन के लिए उपयोग नहीं होती. आप किसी भी समय ऐप बंद कर सकते हैं और सत्र समाप्त हो जाएगा.",
    usingAs: "आप EMMA का उपयोग कर रहे हैं: ",
    usingAsGuest: "आप EMMA का उपयोग अतिथि के रूप में कर रहे हैं",
    dataCta: "हम आपके डेटा का कैसे उपयोग करते हैं",
    errorEmptyReply: "EMMA का उत्तर खाली है. कृपया फिर से कोशिश करें.",
    errorAi: "AI को कॉल करते समय एक त्रुटि हुई.",
    closeLabel: "बंद करें",
  },
  ja: {
    sessionTitle: "EMMAに今の状況を教えてください",
    sessionSubtitle:
      "感じていることを整理し、適切な言葉を見つけ、次に何をするか決める手助けをします。",
    textareaPlaceholder: "今の気持ちを書いてください…",
    askCta: "EMMA に送信",
    loadingLabel: "EMMA が考えています…",
    emptyTitle: "EMMA と新しいチャットを始めましょう",
    emptySubtitle:
      "考えていること、状況、気持ちを教えてください。EMMA が何が起きているか説明し、落ち着いた実践的なステップを提案します。",
    examples: [
      "圧倒されています",
      "どう対処すべきかわかりません",
      "何かが不安です",
      "仲間外れにされた気がします",
    ],
    dataTitle: "データの利用について",
    dataBody:
      "EMMA はあなたのメッセージに返信するために必要な内容だけを保存します。会話はプロファイリングや広告に使われません。いつでもアプリを閉じてセッションを終了できます。",
    usingAs: "あなたは EMMA を次のユーザーとして利用中: ",
    usingAsGuest: "あなたは EMMA をゲストとして利用しています",
    dataCta: "データの利用について",
    errorEmptyReply: "EMMA の返信が空です。もう一度お試しください。",
    errorAi: "AI の呼び出し中にエラーが発生しました。",
    closeLabel: "閉じる",
  },
  "zh-CN": {
    sessionTitle: "告诉 EMMA 发生了什么",
    sessionSubtitle: "她会帮你理解自己的感受、找到合适的表达，并选择下一步要做什么。",
    textareaPlaceholder: "写下你在想什么…",
    askCta: "发送给 EMMA",
    loadingLabel: "EMMA 正在思考…",
    emptyTitle: "开始与 EMMA 的新聊天",
    emptySubtitle:
      "描述一个想法、一个情况或你的感受。EMMA 会解释发生了什么，并给出冷静、实用的建议。",
    examples: [
      "我感到压力很大",
      "我不知道该如何处理",
      "有件事让我很焦虑",
      "我觉得自己被排斥",
    ],
    dataTitle: "我们如何使用你的数据",
    dataBody:
      "EMMA 只保存回复你消息所需的信息。你的对话不会用于画像或广告。你可以随时关闭应用并结束会话。",
    usingAs: "你正在以此身份使用 EMMA：",
    usingAsGuest: "你正在以访客身份使用 EMMA",
    dataCta: "我们如何使用你的数据",
    errorEmptyReply: "EMMA 的回复为空。请重试。",
    errorAi: "调用 AI 时发生错误。",
    closeLabel: "关闭",
  },
  "zh-TW": {
    sessionTitle: "告訴 EMMA 發生了什麼",
    sessionSubtitle: "她會幫助你理解自己的感受，找到合適的話語，並選擇下一步要做什麼。",
    textareaPlaceholder: "寫下你在想什麼…",
    askCta: "傳送給 EMMA",
    loadingLabel: "EMMA 正在思考…",
    emptyTitle: "開始與 EMMA 的新聊天",
    emptySubtitle:
      "描述一個想法、一個情況或你的感受。EMMA 會解釋發生了什麼，並提出冷靜、實用的建議。",
    examples: [
      "我感到壓力很大",
      "我不知道該如何處理",
      "有件事讓我很焦慮",
      "我覺得自己被排斥",
    ],
    dataTitle: "我們如何使用你的資料",
    dataBody:
      "EMMA 只會保留回覆你訊息所需的資訊。你的對話不會用於個人化分析或廣告。你可以隨時關閉應用程式並結束工作階段。",
    usingAs: "你正在以此身分使用 EMMA：",
    usingAsGuest: "你正在以訪客身分使用 EMMA",
    dataCta: "我們如何使用你的資料",
    errorEmptyReply: "EMMA 的回覆為空。請再試一次。",
    errorAi: "呼叫 AI 時發生錯誤。",
    closeLabel: "關閉",
  },
};

const getCopy = (lang: Lang): Copy => COPIES[lang] ?? COPIES["en-US"];

export default function EmmaHome({
  initialConversationId,
}: {
  initialConversationId?: string | null;
} = {}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("emma:lang");
      if (isSupportedLang(stored)) return stored;
      const navLang = mapLocaleToLang(navigator.language || navigator.languages?.[0]);
      return navLang;
    }
    return "en-US";
  });
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDataSheet, setShowDataSheet] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const [profileLangLoaded, setProfileLangLoaded] = useState(false);
  const lastPersistedLang = useRef<Lang | null>(null);
  const sessionSynced = useRef(false);
  const historyConversationId = useRef<string | null>(initialConversationId ?? null);
  const skipNextHistoryFetch = useRef(false);
  const pendingUrlConversationId = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    let active = true;

    const applyLangFromSession = (sessionUser: User | null, hasLangAlready: boolean) => {
      if (hasLangAlready) return true;
      const metaLang = sessionUser?.user_metadata?.lang as string | undefined;
      if (isSupportedLang(metaLang)) {
        setLang(metaLang);
        return true;
      }
      if (metaLang?.startsWith("en")) {
        setLang("en-US");
        return true;
      }
      return false;
    };

    const applyLangFromBrowser = (hasLangAlready: boolean) => {
      if (hasLangAlready) return true;
      if (typeof navigator !== "undefined") {
        const navLang = mapLocaleToLang(navigator.language || navigator.languages?.[0]);
        setLang(navLang);
        return true;
      }
      return false;
    };

    const syncSession = async (session: Session | null) => {
      if (!session?.access_token || !session?.refresh_token) return;
      try {
        await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      } catch (err) {
        console.error("[emma] failed to sync session", err);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      let langSet = false;
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("emma:lang");
        if (isSupportedLang(stored)) {
          setLang(stored);
          langSet = true;
        }
      }

      langSet = applyLangFromSession(sessionUser, langSet) || langSet;
      applyLangFromBrowser(langSet);

      if (data.session && !sessionSynced.current) {
        sessionSynced.current = true;
        syncSession(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);

      let langSet = false;
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("emma:lang");
        if (isSupportedLang(stored)) {
          setLang(stored);
          langSet = true;
        }
      }

      langSet = applyLangFromSession(session?.user ?? null, langSet) || langSet;
      applyLangFromBrowser(langSet);
      if (session) {
        sessionSynced.current = true;
        syncSession(session);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (initialConversationId === conversationId) {
      return () => {
        cancelled = true;
      };
    }

    setConversationId(initialConversationId ?? null);

    return () => {
      cancelled = true;
    };
  }, [initialConversationId, conversationId]);

  useEffect(() => {
    let cancelled = false;

    if (!conversationId) {
      setHistoryLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (skipNextHistoryFetch.current) {
      skipNextHistoryFetch.current = false;
      historyConversationId.current = conversationId;
      setHistoryLoading(false);
      return () => {
        cancelled = true;
      };
    }

    // Evitiamo di cancellare i messaggi quando creiamo una nuova conversazione dal client (passaggio da null -> id)
    if (historyConversationId.current && historyConversationId.current !== conversationId) {
      setMessages([]);
    }

    historyConversationId.current = conversationId;
    setHistoryLoading(true);

    (async () => {
      try {
        const dbMessages = await getMessages(conversationId);
        if (cancelled) return;

        setMessages(
          dbMessages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content ?? "",
          })),
        );
      } catch (err) {
        console.error("[emma] failed to load conversation messages", err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!user || profileLangLoaded) return;
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("language_preference")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled || error) return;
        const pref = data?.language_preference as string | undefined;
        if (isSupportedLang(pref)) {
          setLang(pref);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("emma:lang", pref);
          }
        } else if (pref) {
          const mapped = mapLocaleToLang(pref);
          setLang(mapped);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("emma:lang", mapped);
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setProfileLangLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileLangLoaded, user]);

  const copy = getCopy(lang);
  useEffect(() => {
    const onLangChange = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: Lang }>).detail;
      if (detail?.lang && detail.lang !== lang) {
        setLang(detail.lang);
        if (typeof window !== "undefined" && isSupportedLang(detail.lang)) {
          window.localStorage.setItem("emma:lang", detail.lang);
        }
      }
    };
    const onDataSheet = () => setShowDataSheet(true);
    window.addEventListener("emma:lang-change", onLangChange);
    window.addEventListener("emma:open-data-sheet", onDataSheet);
    return () => {
      window.removeEventListener("emma:lang-change", onLangChange);
      window.removeEventListener("emma:open-data-sheet", onDataSheet);
    };
  }, [lang]);

  const ensureServerSession = useCallback(async () => {
    if (sessionSynced.current) return;
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.access_token || !session?.refresh_token) return;
      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });
      sessionSynced.current = true;
    } catch (err) {
      console.error("[emma] failed to ensure server session", err);
    }
  }, []);
  useEffect(() => {
    if (!user) return;
    if (lastPersistedLang.current === lang) return;

    lastPersistedLang.current = lang;

    // Persist on session and profile so the preference is reused
    (async () => {
      try {
        await supabase.auth.updateUser({ data: { lang } });
      } catch (err) {
        console.error("[emma] failed to persist auth lang", err);
      }

      try {
        await supabase.from("profiles").upsert(
          { id: user.id, language_preference: lang },
          { onConflict: "id" },
        );
      } catch (err) {
        console.error("[emma] failed to persist profile lang", err);
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("emma:lang", lang);
      }
    })();
  }, [lang, user]);

  const examplePills = copy.examples;

  const handleSelectExample = (value: string) => {
    setText(value);
    textareaRef.current?.focus();
  };

  const makeConversationTitle = (input: string) => {
    const raw = input.replace(/\s+/g, " ").trim();
    if (!raw) return "Conversazione";
    const firstLine = raw.split("\n")[0] ?? raw;
    const match = firstLine.match(/^(.{12,}?[.!?])\s/);
    const base = (match?.[1] ?? firstLine).trim();
    return base.length > 80 ? `${base.slice(0, 77)}...` : base;
  };

  async function handleAskAdvice(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    const wasEmpty = messages.length === 0;

    const hasExplicitLang =
      typeof window !== "undefined" && isSupportedLang(window.localStorage.getItem("emma:lang"));

    // Auto-detect only when the user hasn't explicitly selected a language.
    if (wasEmpty && !hasExplicitLang) {
      const guessed = detectLanguage(value);
      setLang(guessed);
    }

    setText("");

    setError(null);
    setLoading(true);

    await ensureServerSession();
    let accessToken: string | undefined;
    try {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token ?? undefined;
    } catch {
      // ignore
    }

    // Show the user's message in the chat immediately and prepare an empty assistant bubble
    setMessages((prev) => [
      ...prev,
      { role: "user", content: value },
      { role: "assistant", content: "" },
    ]);

    try {
      let convId = conversationId || initialConversationId || null;
      const shouldAutotitleExisting =
        !convId
          ? false
          : wasEmpty &&
            typeof window !== "undefined" &&
            window.sessionStorage.getItem("emma:pending-title-conversation-id") === convId;

      // Crea una conversazione se non ne esiste ancora una per questa sessione
      if (!convId) {
        try {
          const title = makeConversationTitle(value);
          const conv = await createConversation(user?.id ?? "", title);
          convId = conv.id;
          setConversationId(conv.id);
          skipNextHistoryFetch.current = true;
          pendingUrlConversationId.current = conv.id;

          // Aggiorna la URL per preservare la conversazione al refresh e notifica la sidebar
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("conversationId", conv.id);
            window.dispatchEvent(new CustomEvent("emma:conversation-created", { detail: { id: conv.id } }));
          }
        } catch (err) {
          console.error("[emma] failed to create conversation", err);
        }
      }

      // Se la conversazione è stata creata dalla sidebar con titolo placeholder, aggiorniamolo con il primo messaggio
      if (convId && shouldAutotitleExisting) {
        try {
          const nextTitle = makeConversationTitle(value);
          await updateConversationTitle(convId, nextTitle);
          window.sessionStorage.removeItem("emma:pending-title-conversation-id");
          window.dispatchEvent(new CustomEvent("emma:conversation-created", { detail: { id: convId } }));
        } catch (err) {
          console.error("[emma] failed to auto-title conversation", err);
        }
      }

      // Salva il messaggio dell'utente se abbiamo una conversazione
      if (convId) {
        try {
          await saveMessage(convId, "user", value);
        } catch (err) {
          console.error("[emma] failed to save user message", err);
        }
      }

      const res = await fetch("/api/emma/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ userInput: value, conversationId: convId, lang }),
      });

      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        console.error("[emma advice] error", res.status, t);
        setError(copy.errorAi);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Buffer per il rendering progressivo
      let assistantText = "";
      let renderText = "";
      const buffer: string[] = [];
      let isRendering = false;

      const startRenderLoop = () => {
        if (isRendering) return;
        isRendering = true;

        const loop = () => {
          const batch: string[] = [];
          let take = Math.min(4, buffer.length);
          while (take-- > 0) {
            const chunk = buffer.shift();
            if (chunk) batch.push(chunk);
          }

          if (batch.length) {
            renderText += batch.join("");
            const current = renderText;
            setMessages((prev) => {
              if (!prev.length) return prev;
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === "assistant") {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: current,
                };
              }
              return updated;
            });
          }

          if (buffer.length > 0) {
            requestAnimationFrame(loop);
          } else {
            isRendering = false;
          }
        };

        requestAnimationFrame(loop);
      };

      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        const decoded = decoder.decode(chunk, { stream: true });
        if (!decoded) continue;
        assistantText += decoded;
        buffer.push(decoded);
        startRenderLoop();
      }

      // flush finale del decoder
      const flushed = decoder.decode();
      if (flushed) {
        assistantText += flushed;
        buffer.push(flushed);
        startRenderLoop();
      }

      if (!assistantText.trim()) {
        setError(copy.errorEmptyReply);
        return;
      }

      // Salva il messaggio di EMMA a fine stream
      if (convId) {
        try {
          await saveMessage(convId, "assistant", assistantText);
        } catch (err) {
          console.error("[emma] failed to save assistant message", err);
        }
      }
    } catch (err) {
      console.error("[emma advice] exception", err);
      setError(copy.errorAi);
    } finally {
      setLoading(false);
      if (pendingUrlConversationId.current && typeof window !== "undefined") {
        const id = pendingUrlConversationId.current;
        pendingUrlConversationId.current = null;
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("conversationId", id);
          router.replace(url.pathname + url.search);
        } catch (err) {
          console.error("[emma] failed to update url with conversation id", err);
        }
      }
    }
  }

  const sessionTitle = copy.sessionTitle;
  const sessionSubtitle = copy.sessionSubtitle;
  const textareaPlaceholder = copy.textareaPlaceholder;
  const askCta = copy.askCta;
  const loadingLabel = copy.loadingLabel;
  const emptyTitle = copy.emptyTitle;
  const emptySubtitle = copy.emptySubtitle;

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:px-8 gap-5">
        <div className="flex flex-1 flex-col overflow-hidden px-2 py-4 sm:px-6 sm:py-6">
          <div className="flex-1 overflow-y-auto">
            {historyLoading ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-sm text-slate-200/85">
                  {lang.startsWith("it") ? "Caricamento conversazione…" : "Loading conversation…"}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="max-w-3xl space-y-4 text-slate-100/90">
                  <p className="text-lg font-semibold sm:text-xl">{emptyTitle}</p>
                  <p className="text-sm sm:text-base text-slate-200/85">{emptySubtitle}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {examplePills.map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => handleSelectExample(pill)}
                        className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur hover:bg-white/20"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-[15px] text-slate-800">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={
                      "flex " +
                      (m.role === "user" ? "justify-end" : "justify-start")
                    }
                  >
                    <div
                      className={
                        "max-w-[85%] rounded-[18px] px-4 py-3 whitespace-pre-line emma-bubble " +
                        (m.role === "user"
                          ? "bg-[#dfe8ff] text-slate-900"
                          : "bg-[#F2EDFF] text-slate-900")
                      }
                    >
                      {m.content}
                      {m.role === "assistant" && idx === messages.length - 1 && loading && (
                        <div className="mt-1 emma-typing">
                          <span className="emma-typing-dot" />
                          <span className="emma-typing-dot" />
                          <span className="emma-typing-dot" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="flex w-full justify-center">
            <form
              onSubmit={handleAskAdvice}
              className="mt-4 flex w-full max-w-4xl items-center gap-3 rounded-full bg-white/10 px-4 py-3 backdrop-blur"
            >
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={1}
                disabled={historyLoading}
                className="h-11 flex-1 resize-none bg-transparent py-3 text-left text-sm leading-5 text-white placeholder:text-white/70 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (form) {
                      form.requestSubmit();
                    }
                  }
                }}
                placeholder={textareaPlaceholder}
              />
              <button
                type="submit"
                disabled={loading || historyLoading}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f46e5] text-white shadow-lg shadow-indigo-900/40 transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <div className="emma-typing">
                    <span className="emma-typing-dot" />
                    <span className="emma-typing-dot" />
                    <span className="emma-typing-dot" />
                  </div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
          {error && <p className="mt-2 text-center text-sm text-red-300">{error}</p>}
        </div>
      </div>

      {showDataSheet && (
        <div className="emma-bottom-sheet-overlay" onClick={() => setShowDataSheet(false)}>
          <div
            className="emma-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between text-[12px] text-slate-200/80">
              <button
                type="button"
                onClick={() => setShowDataSheet(false)}
                className="text-sm text-white/70 hover:text-white"
              >
                {copy.closeLabel}
              </button>
              <span className="uppercase tracking-[0.18em] text-indigo-200/90">EMMA</span>
            </div>
            <h2 className="mb-2 text-[18px] font-semibold text-white">
              {copy.dataTitle}
            </h2>
            <p className="text-[14px] leading-relaxed text-slate-100/90">
              {copy.dataBody}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
