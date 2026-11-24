import type { ReactNode } from "react";
import { LogsProvider } from "../features/log/LogsProvider";
import { PrepareProvider } from "../features/prepare/PrepareProvider";
import { RecipesProvider } from "../features/recipes/RecipesProvider";
import { SettingsProvider } from "../features/settings/SettingsProvider";
import { TimerProvider } from "../features/timer/TimerProvider";
import { LanguageProvider } from "../i18n";
import { NavigationProvider } from "./NavigationProvider";
import { ToastProvider } from "./ToastProvider";

/** Order matters: recipes read the language, Prepare reads recipes, the timer reads Prepare. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <ToastProvider>
          <NavigationProvider>
            <RecipesProvider>
              <PrepareProvider>
                <LogsProvider>
                  <TimerProvider>{children}</TimerProvider>
                </LogsProvider>
              </PrepareProvider>
            </RecipesProvider>
          </NavigationProvider>
        </ToastProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
}
