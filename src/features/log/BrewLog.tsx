import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../app/store";
import { getMethod } from "../../data/methods";
import { fmtDay, fmtHour, fmtTime, uid } from "../../lib/format";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { useI18n } from "../../i18n";
import { Button } from "../../components/ui/Button";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { GlassCard } from "../../components/ui/GlassCard";
import { Icon } from "../../components/ui/Icon";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Stars } from "../../components/ui/Stars";
import { LogEditor } from "./LogEditor";
import type { LogEntry } from "../../types";

function Detail({ log, onEdit, onDelete }: { log: LogEntry; onEdit: () => void; onDelete: () => void }) {
  const { t, lang } = useI18n();
  const title = log.beans || log.recipeName || t.methods[log.method];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-sm text-accent">
          {t.methods[log.method]}
          {log.recipeName && log.beans ? ` · ${log.recipeName}` : ""}
        </div>
        <div className="text-3xl font-semibold">{title}</div>
        <div className="mt-1 text-mute">
          {fmtDay(log.date, lang)} · {fmtHour(log.date, lang)}
        </div>
      </div>

      {log.rating ? <Stars value={log.rating} size="lg" /> : <div className="text-mute">{t.log.notRated}</div>}

      <div className="grid grid-cols-3 gap-3">
        {[
          [`${log.coffee} g`, t.log.coffee],
          [`${log.water} ml`, t.log.water],
          [`1:${log.coffee ? Number((log.water / log.coffee).toFixed(1)) : 0}`, t.log.ratio],
          [`${log.tempC}°C`, t.log.temp],
          [t.grinds[log.grind], t.log.grind],
          [log.timeSec ? fmtTime(log.timeSec) : "—", t.log.time],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl bg-soft px-4 py-3">
            <div className="text-lg font-semibold">{v}</div>
            <div className="text-sm text-mute">{l}</div>
          </div>
        ))}
      </div>

      {log.tastes.length ? (
        <div className="flex flex-wrap gap-2">
          {log.tastes.map((name) => (
            <span key={name} className="rounded-full bg-accent/15 px-4 py-2 text-accent">{t.tastes[name] ?? name}</span>
          ))}
        </div>
      ) : null}

      {log.notes ? <p className="whitespace-pre-wrap text-lg leading-relaxed">{log.notes}</p> : null}

      <div className="flex gap-3">
        <Button icon="edit" onClick={onEdit}>{t.common.edit}</Button>
        <ConfirmButton label={t.common.delete} onConfirm={onDelete} />
      </div>
    </div>
  );
}

export function BrewLog() {
  const { logs, saveLog, deleteLog, logDraft, setLogDraft, exportBackup, importBackup, toast } = useApp();
  const { t, lang } = useI18n();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<LogEntry | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // A draft coming from the calculator or timer opens straight in the editor.
  useEffect(() => {
    if (logDraft) {
      setEditing(logDraft);
      setLogDraft(null);
    }
  }, [logDraft, setLogDraft]);

  const sorted = useMemo(() => [...logs].sort((a, b) => b.date.localeCompare(a.date)), [logs]);
  const selected = sorted.find((l) => l.id === selectedId) ?? (isWide ? sorted[0] : undefined);

  const stats = useMemo(() => {
    const rated = logs.filter((l) => l.rating > 0);
    const counts = new Map<string, number>();
    logs.forEach((l) => counts.set(l.method, (counts.get(l.method) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      total: logs.length,
      avg: rated.length ? (rated.reduce((s, l) => s + l.rating, 0) / rated.length).toFixed(1) : "—",
      top: top ? top[0] : null,
    };
  }, [logs]);
  const topLabel = stats.top ? t.methods[stats.top as LogEntry["method"]] : "—";

  const newEntry = (): LogEntry => {
    const m = getMethod("v60");
    return {
      id: uid(), date: new Date().toISOString(), method: m.id, recipeName: "", beans: "",
      dose: m.dose, water: 250, coffee: 15, tempC: m.tempC, grind: m.grind,
      timeSec: 0, rating: 0, tastes: [], notes: "",
    };
  };

  const remove = (l: LogEntry) => {
    deleteLog(l.id);
    setSelectedId(null);
    setDetailOpen(false);
    toast(t.log.toastDeleted);
  };

  const isNew = editing ? !logs.some((l) => l.id === editing.id) : false;
  const openDetail = (l: LogEntry) => {
    setSelectedId(l.id);
    if (!isWide) setDetailOpen(true);
  };

  let lastDay = "";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t.log.title}
        subtitle={t.log.subtitle}
        actions={
          <>
            <Button variant="ghost" size="icon" icon="download" aria-label={t.log.exportAria} onClick={exportBackup} />
            <Button variant="ghost" size="icon" icon="upload" aria-label={t.log.importAria} onClick={() => fileRef.current?.click()} />
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) importBackup(await f.text());
                e.target.value = "";
              }}
            />
            <Button variant="primary" icon="plus" onClick={() => setEditing(newEntry())}>
              {t.log.logBrew}
            </Button>
          </>
        }
      />

      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-line py-24 text-center">
          <Icon name="log" className="h-14 w-14 text-mute" />
          <p className="max-w-md text-lg text-mute">{t.log.empty}</p>
          <Button variant="primary" icon="plus" onClick={() => setEditing(newEntry())}>
            {t.log.emptyBtn}
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-3 gap-4">
            {[
              [String(stats.total), t.log.statTotal],
              [stats.avg, t.log.statAvg],
              [topLabel, t.log.statTop],
            ].map(([v, l]) => (
              <GlassCard key={l} className="!p-5">
                <div className="text-3xl font-semibold">{v}</div>
                <div className="text-sm text-mute">{l}</div>
              </GlassCard>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <div className="flex flex-col gap-2 lg:col-span-2">
              {sorted.map((l) => {
                const day = fmtDay(l.date, lang);
                const header = day !== lastDay ? day : null;
                lastDay = day;
                const on = selected?.id === l.id;
                return (
                  <div key={l.id}>
                    {header ? <div className="mb-2 mt-3 px-2 text-sm text-mute first:mt-0">{header}</div> : null}
                    <button
                      onClick={() => openDetail(l)}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                        on ? "border-accent/60 bg-accent/10" : "border-line bg-card"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-medium">{l.beans || l.recipeName || t.methods[l.method]}</div>
                        <div className="tabular truncate text-sm text-mute">
                          {t.methods[l.method]} · {l.coffee} g · {l.water} ml
                          {l.timeSec ? ` · ${fmtTime(l.timeSec)}` : ""}
                        </div>
                      </div>
                      {l.rating ? <Stars value={l.rating} size="sm" /> : null}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:col-span-3 lg:block">
              {selected ? (
                <GlassCard className="sticky top-0">
                  <Detail log={selected} onEdit={() => setEditing(selected)} onDelete={() => remove(selected)} />
                </GlassCard>
              ) : null}
            </div>
          </div>
        </>
      )}

      {detailOpen && !isWide && selected ? (
        <Modal title={t.log.modalTitle} onClose={() => setDetailOpen(false)}>
          <Detail log={selected} onEdit={() => { setDetailOpen(false); setEditing(selected); }} onDelete={() => remove(selected)} />
        </Modal>
      ) : null}

      {editing ? (
        <LogEditor
          key={editing.id}
          entry={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={(l) => {
            saveLog(l);
            setSelectedId(l.id);
            setEditing(null);
            toast(t.log.toastSaved);
          }}
          onDelete={() => {
            remove(editing);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}
