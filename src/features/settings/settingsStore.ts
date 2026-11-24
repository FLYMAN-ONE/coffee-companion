import { createStore } from "../../lib/createStore";

export interface SettingsStore {
  sound: boolean;
  setSound: (on: boolean) => void;
}

export const [SettingsContext, useSettings] = createStore<SettingsStore>("Settings");
