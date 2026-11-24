import type { ReactNode } from "react";
import { CalculatorProvider } from "../features/brew-calculator/CalculatorProvider";
import { LogsProvider } from "../features/log/LogsProvider";
import { RecipesProvider } from "../features/recipes/RecipesProvider";
import { TimerProvider } from "../features/timer/TimerProvider";
import { LanguageProvider } from "../i18n";
import { NavigationProvider } from "./NavigationProvider";
import { ToastProvider } from "./ToastProvider";

/** Order matters: the timer reads recipes, recipes read the language. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <NavigationProvider>
          <CalculatorProvider>
            <RecipesProvider>
              <LogsProvider>
                <TimerProvider>{children}</TimerProvider>
              </LogsProvider>
            </RecipesProvider>
          </CalculatorProvider>
        </NavigationProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
