import { createStore } from "../../lib/createStore";

import type { PaletteId } from "./palettes";

export interface SettingsStore {
  sound: boolean;
  setSound: (on: boolean) => void;
  palette: PaletteId;
  setPalette: (id: PaletteId) => void;
}

export const [SettingsContext, useSettings] = createStore<SettingsStore>("Settings");
