import { useEffect, useMemo, type ReactNode } from "react";
import { sanitizeSettings } from "../../data/schema";
import { STORAGE_KEYS } from "../../data/storageKeys";
import { setSoundEnabled } from "../../lib/audio";
import { useLocalStorage } from "../../lib/storage";
import { applyPalette, type PaletteId } from "./palettes";
import { SettingsContext } from "./settingsStore";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage(
    STORAGE_KEYS.settings,
    sanitizeSettings(undefined),
    sanitizeSettings
  );

  // The audio module is outside React: keep its flag in sync.
  useEffect(() => setSoundEnabled(settings.sound), [settings.sound]);
  // The palette lives on <html> (CSS variables); main.tsx sets it once before the first render.
  useEffect(() => applyPalette(settings.palette), [settings.palette]);

  const value = useMemo(
    () => ({
      ...settings,
      setSound: (sound: boolean) => setSettings((s) => ({ ...s, sound })),
      setPalette: (palette: PaletteId) => setSettings((s) => ({ ...s, palette })),
    }),
    [settings, setSettings]
  );
  return <SettingsContext value={value}>{children}</SettingsContext>;
}
