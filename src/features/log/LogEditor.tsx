import { useState } from "react";
import { NumberField } from "../../components/inputs/NumberField";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Sheet } from "../../components/ui/Sheet";
import { Stars } from "../../components/ui/Stars";
import { grinds, methods, tastes } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtDec, fromInputValue, toInputValue } from "../../lib/format";
import type { LogEntry } from "../../types";

interface LogEditorProps {
  entry: LogEntry;
  isNew: boolean;
  onSave: (e: LogEntry) => void;
  onClose: () => void;
}

/** Full editor for a log entry (manual entries and corrections). */
export function LogEditor({ entry, isNew, onSave, onClose }: LogEditorProps) {
  const { t, lang } = useI18n();
  const [e, setE] = useState<LogEntry>(entry);
  const patch = (p: Partial<LogEntry>) => setE((cur) => ({ ...cur, ...p }));
  const withDose = (coffee: number, water: number) => ({
    coffee,
    water,
    dose: water > 0 ? Math.round((coffee / water) * 1000) : e.dose,
  });
  const toggleTaste = (name: string) =>
    patch({ tastes: e.tastes.includes(name) ? e.tastes.filter((x) => x !== name) : [...e.tastes, name] });

  return (
    <Sheet label={isNew ? t.log.editorNew : t.log.editorEdit} onClose={onClose} width="w-[980px]">
      <div className="flex items-center gap-2.5">
        <h2 className="flex-1 text-[26px] font-bold">{isNew ? t.log.editorNew : t.log.editorEdit}</h2>
        <Button variant="text" onClick={onClose}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" icon="check" onClick={() => onSave(e)}>
          {t.common.save}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="eyebrow">{t.log.beans}</span>
              <input
                className="input"
                placeholder={t.log.beansPh}
                value={e.beans}
                onChange={(ev) => patch({ beans: ev.target.value })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="eyebrow">{t.log.date}</span>
              <input
                type="datetime-local"
                className="input"
                value={toInputValue(e.date)}
                onChange={(ev) => ev.target.value && patch({ date: fromInputValue(ev.target.value) })}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t.log.method}</span>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <Chip
                  key={m.id}
                  icon={m.id}
                  tone="raised"
                  selected={e.method === m.id}
                  onClick={() => patch({ method: m.id })}
                >
                  {t.methods[m.id]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label={t.log.coffeeLabel}
              unit="g"
              value={e.coffee}
              step={0.5}
              min={1}
              max={500}
              decimals={1}
              onChange={(c) => patch(withDose(c, e.water))}
            />
            <NumberField
              label={t.log.waterLabel}
              unit="ml"
              value={e.water}
              step={e.water < 100 ? 1 : 10}
              min={10}
              max={5000}
              onChange={(w) => patch(withDose(e.coffee, w))}
            />
            <NumberField
              label={t.log.waterTemp}
              unit="°C"
              value={e.tempC}
              step={1}
              min={0}
              max={100}
              onChange={(tempC) => patch({ tempC })}
            />
            <div className="flex flex-col justify-end pb-3 text-mute">
              {t.log.ratio}{" "}
              <b className="num text-xl font-medium text-ink">
                1:{fmtDec(e.coffee ? e.water / e.coffee : 0, 1, lang)}
              </b>
            </div>
            <NumberField
              label={t.log.timeMin}
              value={Math.floor(e.timeSec / 60)}
              step={1}
              min={0}
              max={999}
              onChange={(m) => patch({ timeSec: m * 60 + (e.timeSec % 60) })}
            />
            <NumberField
              label={t.log.timeSec}
              value={e.timeSec % 60}
              step={5}
              min={0}
              max={59}
              onChange={(s) => patch({ timeSec: Math.floor(e.timeSec / 60) * 60 + s })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t.log.grindLabel}</span>
            <div className="flex flex-wrap gap-2">
              {grinds.map((g) => (
                <Chip key={g} tone="raised" selected={e.grind === g} onClick={() => patch({ grind: g })}>
                  {t.grinds[g]}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">{t.log.rating}</span>
            <Stars value={e.rating} onChange={(rating) => patch({ rating })} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t.log.howWasIt}</span>
            <div className="flex flex-wrap gap-2">
              {tastes.map((name) => (
                <Chip
                  key={name}
                  tone="raised"
                  selected={e.tastes.includes(name)}
                  onClick={() => toggleTaste(name)}
                >
                  {t.tastes[name] ?? name}
                </Chip>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="eyebrow">{t.log.notes}</span>
            <textarea
              className="input"
              rows={5}
              placeholder={t.log.notesPh}
              value={e.notes}
              onChange={(ev) => patch({ notes: ev.target.value })}
            />
          </label>
        </div>
      </div>
    </Sheet>
  );
}
