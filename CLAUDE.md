# Coffee Companion

PWA per preparare il caffè filtro e non solo: schermata Prepara (ricetta, dosi con righello, Play), timer guidato a tutto schermo, ricette e diario delle estrazioni.

Pubblicata su GitHub Pages: https://FLYMAN-ONE.github.io/coffee-companion/

## Utente e contesto d'uso

- **App personale**, un solo utente, non pubblica: niente onboarding, marketing o branding oltre a un'icona che dica chiaramente "caffè".
- **Dispositivo unico: iPad in orizzontale**, installato come PWA e fisso sul coffee corner. È l'unico layout supportato.
- **Flusso principale**: prima di preparare si impostano metodo, dosi e ricetta, poi Play. Da lì si segue solo il timer, letto a distanza con le mani occupate; al massimo si mette in pausa. Il timer deve essere leggibile da lontano e richiedere zero interazioni.
- **Gusto di design**: moderno, fluido, minimale ma riconoscibile; angoli arrotondati; animazioni presenti e piacevoli ma mai eccessive.
- **Refresh UI/UX** (nov 2026): analisi, decisioni e mockup in `docs/refresh/`. Le scelte in `docs/refresh/02-decisioni.md` sono il riferimento per qualsiasi modifica visiva.

## Comandi

- `npm run dev` — server di sviluppo Vite
- `npm run check` — lint + test + build: **eseguirlo dopo ogni modifica**
- `npm run test` / `npm run test:watch` — Vitest (jsdom)
- `npm run lint` — ESLint (incluse le regole del React Compiler di `react-hooks`)
- `npm run format` — Prettier (printWidth 110, doppi apici)
- `npm run build` — type check (`tsc -b`) + build in `dist/`
- `npm run deploy` — build e pubblicazione su GitHub Pages (`gh-pages -d dist`)

## Stack

React 19 + TypeScript (strict) + Vite 8 + Tailwind CSS 4 (plugin `@tailwindcss/vite`, nessun `tailwind.config`). Font Manrope e Space Grotesk inclusi via `@fontsource-variable` (funzionano offline). Test con Vitest + Testing Library. Nessuna libreria di routing, stato, icone o animazioni.

## Struttura

```
src/
  main.tsx              font, prepareStorage() (migrazioni) poi render; service worker solo in produzione
  App.tsx               AppProviders > AppShell
  app/
    AppProviders.tsx    composizione dei provider (l'ordine conta)
    AppShell.tsx        Rail + schermata attiva; FocusScreen sopra tutto mentre il timer non è idle
    navigation.ts       tab (prepare, recipes, log, settings), useNavigation()
    toast.ts            useToast() (ToastProvider disegna il toast in alto)
  features/<nome>/      una cartella per schermata, ognuna con il proprio store
    prepare/            PrepareScreen, usePrepare() (ricetta scelta, caffè/rapporto/acqua, blocco); logic/dosing.ts
    timer/              useTimer, FocusScreen (caraffa, timeline, pausa, fine); useTimerSession() / useTimerClock()
    recipes/            RecipesScreen, RecipeList (condivisa con Prepara), RecipeEditor (nastro + righelli), WaterRibbon; logic/
    log/                LogScreen, LogEditor, useLogs() (selezione inclusa), useBackup()
    settings/           SettingsScreen, useSettings() (suoni)
  data/
    schema.ts           sanitize* per tutto ciò che arriva da storage o backup, upsert
    migrations.ts       SCHEMA_VERSION, migrazioni, mergeSeed, prepareStorage
    storageKeys.ts      tutte le chiavi localStorage
    backup.ts           buildBackup / parseBackup
    factories.ts        newRecipe / newLogEntry
    methods.ts          default per metodo; defaultRecipes.ts ricette seed
  components/
    ui/                 Button, Chip, Icon (incluse le icone dei metodi), Sheet, Segmented, Stars, SwapNumber, ConfirmButton, SwipeRow
    inputs/             Ruler (righello; tap su un numero per saltarci), NumberField
    layout/             Rail
  i18n/                 en.ts (definisce il tipo Dict), it.ts, useI18n, localizeRecipe
  lib/                  createStore, useLocalStorage, audio, format, download
  styles/theme.css      token di design (@theme di Tailwind)
```

Pattern degli store: `xStore.ts` definisce interfaccia, context e hook con `createStore`; `XProvider.tsx` contiene solo il componente (fast refresh). Gli editor aperti (`editing`, `openEditor`) vivono nello store, così altre schermate possono aprirli prima di cambiare tab.

## Concetti chiave

- **Dosi** (`features/prepare/logic/dosing.ts`): caffè (g), rapporto (1:N) e acqua (ml) con acqua = caffè × rapporto. In Prepara si muovono solo caffè e acqua, il rapporto è in sola lettura (`prepareLock`): con una ricetta il rapporto resta fisso e la dose scala; in Libero resta fermo l'altro valore e il rapporto è il risultato. Le ricette e il diario salvano la dose in g/L: si converte ai bordi (`dosingFromRecipe`, `doseFromRatio`).
- **Ricette**: `steps[].waterPct` è l'acqua cumulativa a fine passaggio (0–100 % del totale), `seconds` la durata del passaggio. Senza passaggi il timer è un cronometro. Nell'editor si inseriscono l'acqua e il caffè in grammi (passo 0,1), in g/L (solo interi) o come rapporto (`CoffeeInput`, `doseFromInput`); gli altri due valori sono mostrati come risultato. L'acqua degli step si modifica in ml ma resta salvata in %.
- **Ricette seed**: hanno id `builtin-*`. Se si modificano in `defaultRecipes.ts`, incrementare `SEED_VERSION`: `prepareStorage` le aggiorna una volta all'avvio (`mergeSeed`), mantenendo i preferiti e lasciando intatte le ricette dell'utente. Le fonti (The World Atlas of Coffee, video di James Hoffmann) sono citate nelle note.
- **Persistenza**: solo `localStorage`, chiavi in `data/storageKeys.ts`. Ogni lettura passa da un `sanitize*` (dati corrotti o vecchi non rompono la UI). Per cambiare la forma dei dati: aggiungere una migrazione in `data/migrations.ts` e incrementare `SCHEMA_VERSION`, con un test. I dati dell'utente sul suo iPad non vanno mai persi.
- **Timer**: basato su `Date.now()` (non su contatori), quindi resta preciso in pausa/background. Le azioni sono stabili; suoni e fine automatica stanno nel callback dell'intervallo. Il timer segue la ricetta scelta in Prepara. Play avvia un conto alla rovescia di 5 s (`COUNTDOWN_MS`, stato `countdown`; un tocco lo annulla), anche "Ricomincia". Solo `FocusScreen` deve usare `useTimerClock()` (si aggiorna ogni 100 ms): altrove usare `useTimerSession()` (stato e azioni stabili). L'audio va sbloccato da un gesto dell'utente (`unlockAudio` in start/resume) per iPadOS; i suoni si spengono dalle Impostazioni.
- **Nastro d'acqua** (`features/recipes/WaterRibbon.tsx`, logica in `logic/sequence.ts`): la ricetta come nastro il cui spessore è l'acqua nella caraffa, con il totale sopra ogni versata. È l'unica rappresentazione degli step in tutta l'app: Prepara, timer (con `progress`), dettaglio ricetta ed editor.
- **Navigazione**: niente URL/router, il tab attivo è stato in memoria (`store.tab`).

## Convenzioni

- **i18n**: ogni testo visibile passa da `useI18n().t`. Aggiungere la chiave in `en.ts` (che definisce il tipo) e in `it.ts`. I nomi dei metodi (V60, Chemex, AeroPress…) non si traducono. Le ricette seed sono salvate in inglese e tradotte al volo da `localizeRecipe` finché l'utente non le modifica.
- **Design system** (`styles/theme.css`, dettagli in `docs/refresh/02-decisioni.md`):
  - **palette selezionabili** in Opzioni: `ardesia` (predefinita: ardesia, rame, azzurro ghiaccio) e `abisso` (quasi nero petrolio, corallo, acquamarina). Ogni palette ridefinisce le stesse variabili `--color-*` sotto `:root[data-palette="…"]`; l'elenco è in `features/settings/palettes.ts`. `main.tsx` applica la palette salvata prima del primo render. Per aggiungerne una: blocco in `theme.css` + voce in `PALETTES` + nome in i18n + `sanitizeSettings`;
  - superfici su 3 livelli: `bg-app` (pagina) → `bg-surface` (pannelli) → `bg-raised` (controlli nei pannelli); `bg-focus` per il timer e lo sfondo dei pannelli a comparsa;
  - testo `text-ink` / `text-prose` (note) / `text-mute` / `text-faint`; `accent` per azioni, selezione e progresso; `water` solo per quantità d'acqua; `danger` per eliminare; `glass`, `water-deep`, `accent-bright`, `star-empty` per caraffa, preavviso e stelle;
  - numeri sempre con `.num` (Space Grotesk, cifre tabulari); etichette di sezione con `.eyebrow`;
  - bottoni: un solo `primary` per vista, poi `tonal`, `text`, `danger`, `icon`;
  - **nessun colore esadecimale nei componenti**: solo token, anche negli SVG (`var(--color-…)`), altrimenti il cambio palette non li raggiunge.
- **CSS e Tailwind 4**: reset in `@layer base`, classi nostre in `@layer components`. CSS fuori dai layer batte le utility di Tailwind.
- **Movimento** (sezione 8 delle decisioni): pressioni con `.press` (scale 0.97, 160 ms); curva `--ease-out` per la UI, `--ease-spring` solo per ingressi rari; niente animazioni sui valori mentre si trascina; niente `transition: all`. Con "riduci movimento" restano solo opacità e colore (`.motion-move`, `.motion-fade`).
- **Touch first**: target minimi 44–48 px, `active:` invece di `hover:`. Rispettare le safe area (`env(safe-area-inset-*)`).
- **Layout**: solo iPad orizzontale (≥ 1024 px, manifest `landscape`). Niente layout telefono: non aggiungere varianti `md:`/mobile.
- Le icone sono SVG inline in `components/ui/Icon.tsx`: aggiungerne lì, non introdurre librerie.
- Logica pura (calcoli) separata dai componenti, dentro `features/<x>/logic/`.

## Service worker

`public/sw.js`: network-first per le pagine, cache-first per gli asset con hash. Incrementare `CACHE` quando un rilascio deve invalidare la cache vecchia.

## Lingua

L'utente parla italiano: rispondere in italiano. Codice, nomi e commenti nel codice restano in inglese.
