import { useCallback, useMemo, useState, type ReactNode } from "react";
import { sanitizeList, sanitizeLog, upsert } from "../../data/schema";
import { STORAGE_KEYS } from "../../data/storageKeys";
import { useLocalStorage } from "../../lib/storage";
import type { LogEntry } from "../../types";
import { LogsContext } from "./logsStore";

const sanitize = (raw: unknown) => sanitizeList(raw, sanitizeLog);

export function LogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>(STORAGE_KEYS.logs, [], sanitize);
  const [editing, setEditing] = useState<LogEntry | null>(null);
  const [selectedId, select] = useState<string | null>(null);

  const saveLog = useCallback((l: LogEntry) => setLogs((list) => upsert(list, l)), [setLogs]);
  const deleteLog = useCallback(
    (id: string) => setLogs((list) => list.filter((l) => l.id !== id)),
    [setLogs]
  );
  const importLogs = useCallback(
    (items: LogEntry[]) => setLogs((list) => items.reduce(upsert, list)),
    [setLogs]
  );
  const closeEditor = useCallback(() => setEditing(null), []);

  const value = useMemo(
    () => ({
      logs,
      saveLog,
      deleteLog,
      importLogs,
      selectedId,
      select,
      editing,
      openEditor: setEditing,
      closeEditor,
    }),
    [logs, saveLog, deleteLog, importLogs, selectedId, editing, closeEditor]
  );

  return <LogsContext value={value}>{children}</LogsContext>;
}
