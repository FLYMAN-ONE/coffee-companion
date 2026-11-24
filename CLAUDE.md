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
- `npm run check` — lint + test + build: **eseguirlo dopo ogni modifica**
- `npm run test` / `npm run test:watch` — Vitest (jsdom)
- `npm run lint` — ESLint (incluse le regole del React Compiler di `react-hooks`)
- `npm run format` — Prettier (printWidth 110, doppi apici)
- `npm run build` — type check (`tsc -b`) + build in `dist/`
- `npm run deploy` — build e pubblicazione su GitHub Pages (`gh-pages -d dist`)

## Stack

React 19 + TypeScript (strict) + Vite 8 + Tailwind CSS 4 (plugin `@tailwindcss/vite`, nessun `tailwind.config`). Test con Vitest + Testing Library. Nessuna libreria di routing, stato, icone o animazioni.

## Struttura

```
src/
  main.tsx              prepareStorage() (migrazioni) poi render; service worker solo in produzione
  App.tsx               AppProviders > AppShell
  app/
    AppProviders.tsx    composizione dei provider (l'ordine conta)
    AppShell.tsx        layout iPad orizzontale: Sidebar + schermata attiva
    navigation.ts       tab, icone, useNavigation()
    toast.ts            useToast() (ToastProvider disegna il toast)
    useApplyRecipe.ts   carica una ricetta nel calcolatore e nel timer
  features/<nome>/      una cartella per schermata, ognuna con il proprio store
    brew-calculator/    useCalculator(); logica pura in logic/
    recipes/            useRecipes() (lista localizzata, salvataggio, editor aperto)
    log/                useLogs(), useBackup() (export/import JSON)
    timer/              useTimerSession() (stato stabile), useTimerClock() (aggiornato a ogni tick)
  data/
    schema.ts           sanitize* per tutto ciò che arriva da storage o backup, upsert
    migrations.ts       SCHEMA_VERSION, migrazioni, mergeSeed, prepareStorage
    storageKeys.ts      tutte le chiavi localStorage
    backup.ts           buildBackup / parseBackup
    factories.ts        newRecipe / newLogEntry
    methods.ts          default per metodo; defaultRecipes.ts ricette seed
  components/ui|inputs|layout   componenti riutilizzabili
  i18n/                 en.ts (definisce il tipo Dict), it.ts, useI18n, localizeRecipe
  lib/                  createStore, useLocalStorage, audio, format, download
  styles/theme.css      token di design (@theme di Tailwind)
```

Pattern degli store: `xStore.ts` definisce interfaccia, context e hook con `createStore`; `XProvider.tsx` contiene solo il componente (fast refresh). Gli editor aperti (`editing`, `openEditor`) vivono nello store, così altre schermate possono aprirli prima di cambiare tab.

## Concetti chiave

- **Dose in g/L**: il calcolatore lavora con dose (g di caffè per litro), acqua (ml) e caffè (g). Cambiando un valore si ricalcola l'altro (`logic/calculations.ts`). Il rapporto 1:N è derivato. Cambiare metodo mantiene i grammi di caffè e adatta l'acqua alla dose tipica del metodo.
- **Ricette**: `steps[].waterPct` è l'acqua cumulativa a fine passaggio (0–100 % del totale), `seconds` la durata del passaggio. Una ricetta senza passaggi non compare tra quelle selezionabili nel timer.
- **Ricette seed**: hanno id `builtin-*`. Se si modificano in `defaultRecipes.ts`, incrementare `SEED_VERSION`: `prepareStorage` le aggiorna una volta all'avvio (`mergeSeed`), mantenendo i preferiti e lasciando intatte le ricette dell'utente. Le fonti (The World Atlas of Coffee, video di James Hoffmann) sono citate nelle note.
- **Persistenza**: solo `localStorage`, chiavi in `data/storageKeys.ts`. Ogni lettura passa da un `sanitize*` (dati corrotti o vecchi non rompono la UI). Per cambiare la forma dei dati: aggiungere una migrazione in `data/migrations.ts` e incrementare `SCHEMA_VERSION`, con un test. I dati dell'utente sul suo iPad non vanno mai persi.
- **Timer**: basato su `Date.now()` (non su contatori), quindi resta preciso in pausa/background. Le azioni sono stabili; suoni e fine automatica stanno nel callback dell'intervallo. Solo la schermata Timer deve usare `useTimerClock()` (si aggiorna ogni 100 ms): altrove usare `useTimerSession()`. L'audio va sbloccato da un gesto dell'utente (`unlockAudio` nel tasto Start) per iPadOS.
- **Navigazione**: niente URL/router, il tab attivo è stato in memoria (`store.tab`).

## Convenzioni

- **i18n**: ogni testo visibile passa da `useI18n().t`. Aggiungere la chiave in `en.ts` (che definisce il tipo) e in `it.ts`. I nomi dei metodi (V60, Chemex, AeroPress…) non si traducono. Le ricette seed sono salvate in inglese e tradotte al volo da `localizeRecipe` finché l'utente non le modifica.
- **Stile**: classi Tailwind inline; i colori vengono dai token in `styles/theme.css` (`bg-app`, `bg-card`, `bg-soft`, `bg-raise`, `text-ink`, `text-mute`, `accent`, `line`, `danger`). Non usare colori esadecimali sparsi nei componenti.
- **Touch first**: target minimi 48 px (spesso 64 px), `active:` invece di `hover:`, numeri con `.tabular`. Rispettare le safe area (`env(safe-area-inset-*)`).
- **Layout**: solo iPad orizzontale (≥ 1024 px, manifest `landscape`). Niente layout telefono: non aggiungere varianti `md:`/mobile.
- Le icone sono SVG inline in `components/ui/Icon.tsx`: aggiungerne lì, non introdurre librerie.
- Logica pura (calcoli) separata dai componenti, dentro `features/<x>/logic/`.

## Service worker

`public/sw.js`: network-first per le pagine, cache-first per gli asset con hash. Incrementare `CACHE` quando un rilascio deve invalidare la cache vecchia.

## Lingua

L'utente parla italiano: rispondere in italiano. Codice, nomi e commenti nel codice restano in inglese.
