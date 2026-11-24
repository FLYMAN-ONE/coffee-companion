import { useMemo } from "react";
import { useToast } from "../../app/toast";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Icon } from "../../components/ui/Icon";
import { Stars } from "../../components/ui/Stars";
import { newLogEntry } from "../../data/factories";
import { tastes } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtDay, fmtDec, fmtHour, fmtTime } from "../../lib/format";
import type { LogEntry } from "../../types";
import { LogEditor } from "./LogEditor";
import { useLogs } from "./logsStore";

/** Log: one-line stats, entries grouped by day on the left, the selected entry on the right. */
export function LogScreen() {
  const { logs, saveLog, deleteLog, selectedId, select, editing, openEditor, closeEditor } = useLogs();
  const toast = useToast();
  const { t, lang } = useI18n();

  const sorted = useMemo(() => [...logs].sort((a, b) => b.date.localeCompare(a.date)), [logs]);
  const selected = sorted.find((l) => l.id === selectedId) ?? sorted[0];
  const rows = useMemo(
    () =>
      sorted.map((l, i) => {
        const day = fmtDay(l.date, lang);
        return { log: l, header: i === 0 || day !== fmtDay(sorted[i - 1].date, lang) ? day : null };
      }),
    [sorted, lang]
  );

  const stats = useMemo(() => {
    const rated = logs.filter((l) => l.rating > 0);
    const counts = new Map<LogEntry["method"], number>();
    logs.forEach((l) => counts.set(l.method, (counts.get(l.method) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      avg: rated.length ? fmtDec(rated.reduce((s, l) => s + l.rating, 0) / rated.length, 1, lang) : "—",
      top: top ? t.methods[top[0]] : "—",
    };
  }, [logs, lang, t]);

  const isNew = editing ? !logs.some((l) => l.id === editing.id) : false;

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3.5">
      <header className="flex items-baseline gap-7 px-1">
        <h1 className="mr-auto text-[30px] font-bold tracking-tight">{t.log.title}</h1>
        {logs.length ? (
          <>
            <Stat value={String(logs.length)} label={t.log.brews} />
            <Stat value={stats.avg} label={t.log.avg} />
            <Stat value={stats.top} label={t.log.top} />
          </>
        ) : null}
        <Button
          variant="primary"
          icon="plus"
          className="self-center"
          onClick={() => openEditor(newLogEntry())}
        >
          {t.log.logBrew}
        </Button>
      </header>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] bg-surface text-center">
          <Icon name="journal" className="h-14 w-14 text-faint" />
          <p className="max-w-md text-lg text-mute">{t.log.empty}</p>
          <Button variant="primary" icon="plus" onClick={() => openEditor(newLogEntry())}>
            {t.log.emptyBtn}
          </Button>
        </div>
      ) : (
        <div className="grid min-h-0 grid-cols-[300px_minmax(0,1fr)] gap-6">
          <nav className="no-scrollbar flex flex-col overflow-y-auto rounded-[28px] bg-surface px-3 py-3">
            {rows.map(({ log: l, header }) => (
              <div key={l.id} className="flex flex-col">
                {header ? (
                  <div className="mx-2.5 mt-3 mb-1.5 text-xs font-bold text-faint first-letter:uppercase">
                    {header}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => select(l.id)}
                  aria-pressed={l.id === selected?.id}
                  className={`press flex items-center gap-3 rounded-[20px] p-2.5 text-left ${l.id === selected?.id ? "bg-raised" : ""}`}
                >
                  <span
                    className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[14px] ${l.id === selected?.id ? "bg-sage/14 text-sage" : "bg-raised text-mute"}`}
                  >
                    <Icon name={l.method} className="h-[22px] w-[22px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] leading-tight font-semibold">
                      {l.beans || l.recipeName || t.methods[l.method]}
                    </span>
                    <span className="num mt-0.5 block text-[12.5px] tracking-normal text-mute">
                      {l.recipeName || t.methods[l.method]} · {l.timeSec ? fmtTime(l.timeSec) : "—"}
                    </span>
                  </span>
                  {l.rating ? <Stars value={l.rating} size="sm" /> : null}
                </button>
              </div>
            ))}
          </nav>

          {selected ? (
            <LogDetail
              key={selected.id}
              log={selected}
              onChange={saveLog}
              onEdit={() => openEditor(selected)}
              onDelete={() => {
                deleteLog(selected.id);
                select(null);
                toast(t.log.toastDeleted);
              }}
            />
          ) : null}
        </div>
      )}

      {editing ? (
        <LogEditor
          key={editing.id}
          entry={editing}
          isNew={isNew}
          onClose={closeEditor}
          onSave={(l) => {
            saveLog(l);
            select(l.id);
            closeEditor();
            toast(t.log.toastSaved);
          }}
        />
      ) : null}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="text-[13.5px] text-mute">
      <b className="num mr-1.5 text-2xl font-medium text-ink">{value}</b>
      {label}
    </span>
  );
}

/** Rating and tastes can be set right here, without opening the editor. */
function LogDetail({
  log: l,
  onChange,
  onEdit,
  onDelete,
}: {
  log: LogEntry;
  onChange: (l: LogEntry) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, lang } = useI18n();
  const toggleTaste = (name: string) =>
    onChange({
      ...l,
      tastes: l.tastes.includes(name) ? l.tastes.filter((x) => x !== name) : [...l.tastes, name],
    });

  return (
    <section className="no-scrollbar flex min-w-0 flex-col gap-5 overflow-y-auto rounded-[28px] bg-surface px-8 py-7">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-sage/14 text-sage">
          <Icon name={l.method} className="h-[30px] w-[30px]" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[28px] leading-tight font-bold tracking-tight">{l.beans || t.log.unnamed}</h2>
          <p className="mt-1 text-sm text-mute">
            {l.recipeName || t.methods[l.method]} · {fmtDay(l.date, lang)} · {fmtHour(l.date, lang)}
          </p>
        </div>
      </div>

      <Stars value={l.rating} onChange={(rating) => onChange({ ...l, rating })} />

      <div className="grid grid-cols-4 gap-2.5">
        {[
          [`${fmtDec(l.coffee, 1, lang)} g`, t.log.coffee],
          [`${l.water} ml`, t.log.water],
          [`1:${fmtDec(l.coffee ? l.water / l.coffee : 0, 1, lang)}`, t.log.ratio],
          [l.timeSec ? fmtTime(l.timeSec) : "—", t.log.time],
        ].map(([v, lab]) => (
          <div key={lab} className="rounded-[18px] bg-raised px-3.5 py-3">
            <b className="num block text-[22px] font-medium">{v}</b>
            <span className="text-[12.5px] text-mute">{lab}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="eyebrow">{t.log.howWasIt}</div>
        <div className="flex flex-wrap gap-2">
          {tastes.map((name) => (
            <Chip
              key={name}
              tone="raised"
              selected={l.tastes.includes(name)}
              onClick={() => toggleTaste(name)}
            >
              {t.tastes[name] ?? name}
            </Chip>
          ))}
        </div>
      </div>

      {l.notes ? (
        <p className="max-w-[60ch] text-[15.5px] leading-relaxed whitespace-pre-wrap text-[#ddd5c8]">
          {l.notes}
        </p>
      ) : null}

      <div className="flex gap-2.5">
        <Button icon="edit" onClick={onEdit}>
          {t.common.edit}
        </Button>
        <ConfirmButton label={t.common.delete} onConfirm={onDelete} />
      </div>
    </section>
  );
}
