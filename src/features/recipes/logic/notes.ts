/**
 * Split recipe notes into short key points for reading at a glance.
 * One point per line when the notes have line breaks, otherwise one per sentence.
 * A final sentence starting with a source prefix ("Sources:", "Fonti:") is returned apart.
 */
export function splitNotes(
  notes: string,
  sourcePrefixes: readonly string[]
): { points: string[]; source: string | null } {
  const text = notes.trim();
  if (!text) return { points: [], source: null };
  const parts = text.includes("\n") ? text.split(/\n+/) : text.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9"“(])/);
  const points = parts.map((p) => p.trim().replace(/^[-•]\s*/, "")).filter(Boolean);
  let source: string | null = null;
  const last = points[points.length - 1];
  const prefix = last ? sourcePrefixes.find((p) => last.startsWith(p)) : undefined;
  if (prefix) {
    source = last.slice(prefix.length).trim().replace(/\.$/, "");
    points.pop();
  }
  return { points, source };
}
