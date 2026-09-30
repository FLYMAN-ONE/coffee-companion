import { LanguageProvider } from "./i18n";
import { AppProvider } from "./app/store";
import { AppShell } from "./app/AppShell";

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </LanguageProvider>
  );
}
