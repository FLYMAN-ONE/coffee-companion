import { createStore } from "../../lib/createStore";
import type { LogEntry } from "../../types";

export interface LogsStore {
  logs: LogEntry[];
  saveLog: (l: LogEntry) => void;
  deleteLog: (id: string) => void;
  /** Merge entries from a backup (same id replaces). */
  importLogs: (list: LogEntry[]) => void;

  /** Entry open in the editor; may be new (not in `logs` yet). */
  editing: LogEntry | null;
  openEditor: (l: LogEntry) => void;
  closeEditor: () => void;
}

export const [LogsContext, useLogs] = createStore<LogsStore>("Logs");
