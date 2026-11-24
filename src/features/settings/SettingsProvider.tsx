import { useEffect, useMemo, type ReactNode } from "react";
import { sanitizeSettings } from "../../data/schema";
import { STORAGE_KEYS } from "../../data/storageKeys";
import { setSoundEnabled } from "../../lib/audio";
import { useLocalStorage } from "../../lib/storage";
import { SettingsContext } from "./settingsStore";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, { sound: true }, sanitizeSettings);

  // The audio module is outside React: keep its flag in sync.
  useEffect(() => setSoundEnabled(settings.sound), [settings.sound]);

  const value = useMemo(
    () => ({ sound: settings.sound, setSound: (sound: boolean) => setSettings({ sound }) }),
    [settings.sound, setSettings]
  );
  return <SettingsContext value={value}>{children}</SettingsContext>;
}
