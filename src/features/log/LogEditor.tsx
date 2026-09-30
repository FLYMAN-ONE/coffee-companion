import { useState } from "react";
import { grinds, methods, tastes } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fromInputValue, toInputValue } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Modal } from "../../components/ui/Modal";
import { Stars } from "../../components/ui/Stars";
import { NumberField } from "../../components/inputs/NumberField";
import { calculateCoffee, calculateWater } from "../brew-calculator/logic/calculations";
import type { LogEntry } from "../../types";

interface LogEditorProps {
  entry: LogEntry;
  isNew: boolean;
  onSave: (e: LogEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

const label = "mb-2 block text-sm text-mute";

export function LogEditor({ entry, isNew, onSave, onDelete, onClose }: LogEditorProps) {
  const { t } = useI18n();
  const [e, setE] = useState<LogEntry>(entry);
  const patch = (p: Partial<LogEntry>) => setE((cur) => ({ ...cur, ...p }));

  const toggleTaste = (name: string) =>
    setE((cur) => ({
      ...cur,
      tastes: cur.tastes.includes(name) ? cur.tastes.filter((x) => x !== name) : [...cur.tastes, name],
    }));

  return (
    <Modal
      wide
      title={isNew ? t.log.editorNew : t.log.editorEdit}
      onClose={onClose}
      footer={
        <>
          {!isNew && <ConfirmButton label={t.common.delete} onConfirm={onDelete} />}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>{t.common.cancel}</Button>
          <Button variant="primary" icon="check" onClick={() => onSave(e)}>{t.common.save}</Button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="l-beans">{t.log.beans}</label>
              <input id="l-beans" className="input" placeholder={t.log.beansPh} value={e.beans} onChange={(ev) => patch({ beans: ev.target.value })} />
            </div>
            <div>
              <label className={label} htmlFor="l-date">{t.log.date}</label>
              <input
                id="l-date"
                type="datetime-local"
                className="input"
                value={toInputValue(e.date)}
                onChange={(ev) => ev.target.value && patch({ date: fromInputValue(ev.target.value) })}
              />
            </div>
          </div>

          <div>
            <span className={label}>{t.log.method}</span>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <Chip key={m.id} selected={e.method === m.id} onClick={() => patch({ method: m.id })}>{t.methods[m.id]}</Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField label={t.log.dose} unit="g/L" value={e.dose} step={1} min={10} max={1000}
              onChange={(dose) => patch({ dose, coffee: calculateCoffee(e.water, dose) })} />
            <NumberField label={t.log.waterLabel} unit="ml" value={e.water} step={e.water < 100 ? 1 : 10} min={10} max={5000}
              onChange={(water) => patch({ water, coffee: calculateCoffee(water, e.dose) })} />
            <NumberField label={t.log.coffeeLabel} unit="g" value={e.coffee} step={0.5} min={1} max={500} decimals={1}
              onChange={(coffee) => patch({ coffee, water: calculateWater(coffee, e.dose) })} />
            <NumberField label={t.log.waterTemp} unit="°C" value={e.tempC} step={1} min={0} max={100}
              onChange={(tempC) => patch({ tempC })} />
            <NumberField label={t.log.timeMin} value={Math.floor(e.timeSec / 60)} step={1} min={0} max={999}
              onChange={(m) => patch({ timeSec: m * 60 + (e.timeSec % 60) })} />
            <NumberField label={t.log.timeSec} value={e.timeSec % 60} step={5} min={0} max={59}
              onChange={(s) => patch({ timeSec: Math.floor(e.timeSec / 60) * 60 + s })} />
          </div>

          <div>
            <span className={label}>{t.log.grindLabel}</span>
            <div className="flex flex-wrap gap-2">
              {grinds.map((g) => (
                <Chip key={g} selected={e.grind === g} onClick={() => patch({ grind: g })}>{t.grinds[g]}</Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className={label}>{t.log.rating}</span>
            <Stars value={e.rating} onChange={(rating) => patch({ rating })} />
          </div>

          <div>
            <span className={label}>{t.log.taste}</span>
            <div className="flex flex-wrap gap-2">
              {tastes.map((name) => (
                <Chip key={name} selected={e.tastes.includes(name)} onClick={() => toggleTaste(name)}>{t.tastes[name] ?? name}</Chip>
              ))}
            </div>
          </div>

          <div>
            <label className={label} htmlFor="l-notes">{t.log.notes}</label>
            <textarea id="l-notes" rows={5} className="input" placeholder={t.log.notesPh}
              value={e.notes} onChange={(ev) => patch({ notes: ev.target.value })} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
