import { useCallback } from "react";
import { useToast } from "../../app/toast";
import { backupFileName, buildBackup, parseBackup } from "../../data/backup";
import { useI18n } from "../../i18n";
import { downloadJson } from "../../lib/download";
import { useRecipes } from "../recipes/recipesStore";
import { useLogs } from "./logsStore";

/** Export everything to a JSON file, or merge a previously exported file. */
export function useBackup() {
  const { storedRecipes, importRecipes } = useRecipes();
  const { logs, importLogs } = useLogs();
  const toast = useToast();
  const { t } = useI18n();

  const exportBackup = useCallback(() => {
    downloadJson(backupFileName(), buildBackup(storedRecipes, logs));
    toast(t.store.backupDownloaded);
  }, [storedRecipes, logs, toast, t]);

  const importBackup = useCallback(
    (text: string) => {
      try {
        const { recipes, logs } = parseBackup(text);
        importRecipes(recipes);
        importLogs(logs);
        toast(t.store.imported(recipes.length, logs.length));
      } catch {
        toast(t.store.invalidBackup);
      }
    },
    [importRecipes, importLogs, toast, t]
  );

  return { exportBackup, importBackup };
}
