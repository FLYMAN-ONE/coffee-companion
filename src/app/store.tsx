import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LogEntry, Recipe } from "../types";
import { SEED_VERSION, defaultRecipes } from "../data/defaultRecipes";
import { useLocalStorage, downloadJson } from "../lib/storage";
import { useBrewCalculator } from "../features/brew-calculator/hooks/useBrewCalculator";
import { useTimer, type TimerApi } from "../features/timer/useTimer";
import type { BrewCalculatorReturn } from "../features/brew-calculator/types";
import { localizeRecipe, useI18n } from "../i18n";
import type { TabId } from "./navigation";

interface AppStore {
  tab: TabId;
  go: (tab: TabId) => void;

  calc: BrewCalculatorReturn;

  recipes: Recipe[];
  saveRecipe: (r: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  recipeDraft: Recipe | null;
  setRecipeDraft: (r: Recipe | null) => void;

  logs: LogEntry[];
  saveLog: (l: LogEntry) => void;
  deleteLog: (id: string) => void;
  logDraft: LogEntry | null;
  setLogDraft: (l: LogEntry | null) => void;

  timer: TimerApi;
  timerRecipeId: string | null;
  setTimerRecipeId: (id: string | null) => void;
  timerRecipe: Recipe | null;

  /** Load a recipe into the calculator and select it for the timer. */
  applyRecipe: (r: Recipe, goTo?: TabId) => void;

  exportBackup: () => void;
  importBackup: (text: string) => void;

  toast: (message: string) => void;
  toastMessage: string | null;
}

const Ctx = createContext<AppStore | null>(null);

const upsert = <T extends { id: string }>(list: T[], item: T): T[] =>
  list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [item, ...list];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>("brew");
  const calc = useBrewCalculator();

  const { t, lang } = useI18n();
  const [storedRecipes, setRecipes] = useLocalStorage<Recipe[]>("cc:recipes:v1", defaultRecipes);
  const [seedVersion, setSeedVersion] = useLocalStorage<number>("cc:seed:v1", 0);

  // Refresh the seeded recipes once per SEED_VERSION. Favorites are kept,
  // recipes created by the user are left untouched.
  useEffect(() => {
    if (seedVersion >= SEED_VERSION) return;
    setRecipes((list) => {
      const favorites = new Set(list.filter((r) => r.favorite).map((r) => r.id));
      const own = list.filter((r) => !r.id.startsWith("builtin-"));
      const fresh = defaultRecipes.map((r) => ({ ...r, favorite: r.favorite || favorites.has(r.id) }));
      return [...fresh, ...own];
    });
    setSeedVersion(SEED_VERSION);
  }, [seedVersion, setRecipes, setSeedVersion]);

  const recipes = useMemo(
    () => storedRecipes.map((r) => localizeRecipe(r, lang)),
    [storedRecipes, lang]
  );
  const [logs, setLogs] = useLocalStorage<LogEntry[]>("cc:logs:v1", []);
  const [recipeDraft, setRecipeDraft] = useState<Recipe | null>(null);
  const [logDraft, setLogDraft] = useState<LogEntry | null>(null);

  const [timerRecipeId, setTimerRecipeId] = useState<string | null>(null);
  const timerRecipe = recipes.find((r) => r.id === timerRecipeId) ?? null;
  const timer = useTimer(timerRecipe?.steps ?? []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);
  const toast = useCallback((message: string) => {
    setToastMessage(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2600);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const saveRecipe = useCallback(
    (r: Recipe) => setRecipes((list) => upsert(list, r)),
    [setRecipes]
  );
  const deleteRecipe = useCallback(
    (id: string) => {
      setRecipes((list) => list.filter((r) => r.id !== id));
      setTimerRecipeId((cur) => (cur === id ? null : cur));
    },
    [setRecipes]
  );
  const toggleFavorite = useCallback(
    (id: string) =>
      setRecipes((list) =>
        list.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r))
      ),
    [setRecipes]
  );

  const saveLog = useCallback((l: LogEntry) => setLogs((list) => upsert(list, l)), [setLogs]);
  const deleteLog = useCallback(
    (id: string) => setLogs((list) => list.filter((l) => l.id !== id)),
    [setLogs]
  );

  const applyRecipe = useCallback(
    (r: Recipe, goTo?: TabId) => {
      calc.setAll(r.dose, r.water, r.method);
      if (timer.status === "idle" || timer.status === "done") {
        timer.reset();
        setTimerRecipeId(r.id);
      }
      if (goTo) setTab(goTo);
    },
    [calc, timer]
  );

  const exportBackup = useCallback(() => {
    downloadJson(`coffee-companion-backup-${new Date().toISOString().slice(0, 10)}.json`, {
      app: "coffee-companion",
      version: 1,
      recipes: storedRecipes,
      logs,
    });
    toast(t.store.backupDownloaded);
  }, [storedRecipes, logs, toast, t]);

  const importBackup = useCallback(
    (text: string) => {
      try {
        const data = JSON.parse(text) as { recipes?: Recipe[]; logs?: LogEntry[] };
        const r = Array.isArray(data.recipes) ? data.recipes.filter((x) => x?.id && x?.name) : [];
        const l = Array.isArray(data.logs) ? data.logs.filter((x) => x?.id && x?.date) : [];
        if (!r.length && !l.length) throw new Error("empty");
        setRecipes((list) => r.reduce(upsert, list));
        setLogs((list) => l.reduce(upsert, list));
        toast(t.store.imported(r.length, l.length));
      } catch {
        toast(t.store.invalidBackup);
      }
    },
    [setRecipes, setLogs, toast, t]
  );

  const value = useMemo<AppStore>(
    () => ({
      tab,
      go: setTab,
      calc,
      recipes,
      saveRecipe,
      deleteRecipe,
      toggleFavorite,
      recipeDraft,
      setRecipeDraft,
      logs,
      saveLog,
      deleteLog,
      logDraft,
      setLogDraft,
      timer,
      timerRecipeId,
      setTimerRecipeId,
      timerRecipe,
      applyRecipe,
      exportBackup,
      importBackup,
      toast,
      toastMessage,
    }),
    [
      tab, calc, recipes, saveRecipe, deleteRecipe, toggleFavorite, recipeDraft,
      logs, saveLog, deleteLog, logDraft, timer, timerRecipeId, timerRecipe,
      applyRecipe, exportBackup, importBackup, toast, toastMessage,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
