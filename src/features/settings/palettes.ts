import { sanitizeSettings } from "../../data/schema";
import { STORAGE_KEYS } from "../../data/storageKeys";

/** Selectable colour palettes. Their tokens live in src/styles/theme.css; `swatches` = accent, water. */
export const PALETTES = [
  /** Default: slate grey, copper actions, ice-blue water. */
  { id: "ardesia", app: "#0e1116", swatches: ["#dd8c5c", "#8fcbe8"] },
  /** Near-black petrol, coral actions, aquamarine water. */
  { id: "abisso", app: "#090c0d", swatches: ["#ff8f72", "#8ed3cb"] },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export const DEFAULT_PALETTE: PaletteId = "ardesia";

export const isPalette = (v: unknown): v is PaletteId => PALETTES.some((p) => p.id === v);

/** Set the palette on <html> and the browser chrome colour (status bar). */
export function applyPalette(id: PaletteId) {
  document.documentElement.dataset.palette = id;
  const app = PALETTES.find((p) => p.id === id)?.app;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", app ?? "");
}

/** Before the first render, so the app never flashes the default palette. */
export function applyStoredPalette(storage: Storage = localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEYS.settings);
    applyPalette(sanitizeSettings(raw ? JSON.parse(raw) : undefined).palette);
  } catch {
    applyPalette(DEFAULT_PALETTE);
  }
}
