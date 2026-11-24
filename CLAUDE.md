# Coffee Companion

PWA per preparare il caffè filtro e non solo: calcolatore di dosi, ricette con passaggi, timer guidato e diario delle estrazioni.

Pubblicata su GitHub Pages: https://FLYMAN-ONE.github.io/coffee-companion/

## Utente e contesto d'uso

- **App personale**, un solo utente, non pubblica: niente onboarding, marketing o branding oltre a un'icona che dica chiaramente "caffè".
- **Dispositivo unico: iPad in orizzontale**, installato come PWA e fisso sul coffee corner. È il layout di riferimento per ogni scelta di design; il layout telefono (tab bar) è secondario.
- **Flusso principale**: prima di preparare si impostano metodo, dosi e ricetta, poi Play. Da lì si segue solo il timer, letto a distanza con le mani occupate; al massimo si mette in pausa. Il timer deve essere leggibile da lontano e richiedere zero interazioni.
- **Gusto di design**: moderno, fluido, minimale ma riconoscibile; angoli arrotondati; animazioni presenti e piacevoli ma mai eccessive.
- **Priorità attuale**: nessuna funzione nuova. Prima solidificare struttura e codice, poi refresh UI/UX.

## Comandi

- `npm run dev` — server di sviluppo Vite
- `npm run build` — type check (`tsc -b`) + build in `dist/`
- `npm run preview` — anteprima della build
- `npm run deploy` — build e pubblicazione su GitHub Pages (`gh-pages -d dist`)

Non ci sono test né linter: `npm run build` è l'unico controllo, va eseguito dopo ogni modifica.

## Stack

React 19 + TypeScript (strict) + Vite 8 + Tailwind CSS 4 (plugin `@tailwindcss/vite`, nessun `tailwind.config`). Nessuna libreria di routing, stato, icone o animazioni: tutto è fatto a mano.

## Struttura

```
src/
  main.tsx              entry, registra il service worker solo in produzione
  App.tsx               LanguageProvider > AppProvider > AppShell
  app/
    AppShell.tsx        layout: Sidebar (md+) / TabBar (mobile), pagina attiva, toast
    navigation.ts       elenco tab (brew, recipes, timer, log) e relative icone
    store.tsx           stato globale in un unico Context (useApp)
  features/             una cartella per schermata
    brew-calculator/    calcolatore (hook, logica pura in logic/, tipi)
    recipes/            lista, card, editor
    timer/              Timer.tsx + useTimer (passaggi, chime, wake lock)
    log/                diario e editor delle voci
  components/
    ui/                 Button, Chip, GlassCard, Modal, Icon (SVG inline), Stars…
    inputs/             NumberField (+/- con ripetizione), Slider
    layout/             Sidebar, TabBar
  data/                 methods.ts (default per metodo), defaultRecipes.ts (ricette seed)
  i18n/                 en.ts (definisce il tipo Dict), it.ts, provider useI18n
  lib/                  storage (useLocalStorage, export JSON), audio, format, useMediaQuery
  styles/theme.css      token di design (@theme di Tailwind)
  index.css             stili globali, .input, .slider
public/                 manifest, sw.js, icone
```

## Concetti chiave

- **Dose in g/L**: il calcolatore lavora con dose (g di caffè per litro), acqua (ml) e caffè (g). Cambiando un valore si ricalcola l'altro (`logic/calculations.ts`). Il rapporto 1:N è derivato. Cambiare metodo mantiene i grammi di caffè e adatta l'acqua alla dose tipica del metodo.
- **Ricette**: `steps[].waterPct` è l'acqua cumulativa a fine passaggio (0–100 % del totale), `seconds` la durata del passaggio. Una ricetta senza passaggi non compare tra quelle selezionabili nel timer.
- **Ricette seed**: hanno id `builtin-*`. Se si modificano in `defaultRecipes.ts`, incrementare `SEED_VERSION`: all'avvio vengono aggiornate una volta, mantenendo i preferiti e lasciando intatte le ricette dell'utente. Le fonti (The World Atlas of Coffee, video di James Hoffmann) sono citate nelle note.
- **Persistenza**: solo `localStorage`, chiavi versionate `cc:<nome>:v1` (`recipes`, `logs`, `calc`, `seed`, `lang`). Cambiare la forma dei dati richiede una migrazione o una nuova chiave. Backup/ripristino via file JSON dallo store.
- **Timer**: basato su `Date.now()` (non su contatori), quindi resta preciso in pausa/background. L'audio va sbloccato da un gesto dell'utente (`unlockAudio` nel tasto Start) per iPadOS.
- **Navigazione**: niente URL/router, il tab attivo è stato in memoria (`store.tab`).

## Convenzioni

- **i18n**: ogni testo visibile passa da `useI18n().t`. Aggiungere la chiave in `en.ts` (che definisce il tipo) e in `it.ts`. I nomi dei metodi (V60, Chemex, AeroPress…) non si traducono. Le ricette seed sono salvate in inglese e tradotte al volo da `localizeRecipe` finché l'utente non le modifica.
- **Stile**: classi Tailwind inline; i colori vengono dai token in `styles/theme.css` (`bg-app`, `bg-card`, `bg-soft`, `bg-raise`, `text-ink`, `text-mute`, `accent`, `line`, `danger`). Non usare colori esadecimali sparsi nei componenti.
- **Touch first**: target minimi 48 px (spesso 64 px), `active:` invece di `hover:`, numeri con `.tabular`. Rispettare le safe area (`env(safe-area-inset-*)`).
- **Breakpoint**: mobile < `md` (tab bar), `md` iPad verticale (rail di icone), `lg` iPad orizzontale/desktop (sidebar completa, layout a colonne).
- Le icone sono SVG inline in `components/ui/Icon.tsx`: aggiungerne lì, non introdurre librerie.
- Logica pura (calcoli) separata dai componenti, dentro `features/<x>/logic/`.

## Service worker

`public/sw.js`: network-first per le pagine, cache-first per gli asset con hash. Incrementare `CACHE` quando un rilascio deve invalidare la cache vecchia.

## Lingua

L'utente parla italiano: rispondere in italiano. Codice, nomi e commenti nel codice restano in inglese.
