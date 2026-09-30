import { useState } from "react";
import { grinds, methods, tastes } from "../../data/methods";
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
  const [e, setE] = useState<LogEntry>(entry);
  const patch = (p: Partial<LogEntry>) => setE((cur) => ({ ...cur, ...p }));

  const toggleTaste = (t: string) =>
    setE((cur) => ({
      ...cur,
      tastes: cur.tastes.includes(t) ? cur.tastes.filter((x) => x !== t) : [...cur.tastes, t],
    }));

  return (
    <Modal
      wide
      title={isNew ? "Log a brew" : "Edit brew"}
      onClose={onClose}
      footer={
        <>
          {!isNew && <ConfirmButton label="Delete" onConfirm={onDelete} />}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={() => onSave(e)}>Save</Button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="l-beans">Beans</label>
              <input id="l-beans" className="input" placeholder="Origin, roaster…" value={e.beans} onChange={(ev) => patch({ beans: ev.target.value })} />
            </div>
            <div>
              <label className={label} htmlFor="l-date">Date</label>
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
            <span className={label}>Method</span>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <Chip key={m.id} selected={e.method === m.id} onClick={() => patch({ method: m.id })}>{m.label}</Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Dose" unit="g/L" value={e.dose} step={1} min={10} max={1000}
              onChange={(dose) => patch({ dose, coffee: calculateCoffee(e.water, dose) })} />
            <NumberField label="Water" unit="ml" value={e.water} step={e.water < 100 ? 1 : 10} min={10} max={5000}
              onChange={(water) => patch({ water, coffee: calculateCoffee(water, e.dose) })} />
            <NumberField label="Coffee" unit="g" value={e.coffee} step={0.5} min={1} max={500} decimals={1}
              onChange={(coffee) => patch({ coffee, water: calculateWater(coffee, e.dose) })} />
            <NumberField label="Water temp" unit="°C" value={e.tempC} step={1} min={0} max={100}
              onChange={(tempC) => patch({ tempC })} />
            <NumberField label="Time (min)" value={Math.floor(e.timeSec / 60)} step={1} min={0} max={999}
              onChange={(m) => patch({ timeSec: m * 60 + (e.timeSec % 60) })} />
            <NumberField label="Time (sec)" value={e.timeSec % 60} step={5} min={0} max={59}
              onChange={(s) => patch({ timeSec: Math.floor(e.timeSec / 60) * 60 + s })} />
          </div>

          <div>
            <span className={label}>Grind</span>
            <div className="flex flex-wrap gap-2">
              {grinds.map((g) => (
                <Chip key={g} selected={e.grind === g} onClick={() => patch({ grind: g })}>{g}</Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className={label}>Rating</span>
            <Stars value={e.rating} onChange={(rating) => patch({ rating })} />
          </div>

          <div>
            <span className={label}>How did it taste?</span>
            <div className="flex flex-wrap gap-2">
              {tastes.map((t) => (
                <Chip key={t} selected={e.tastes.includes(t)} onClick={() => toggleTaste(t)}>{t}</Chip>
              ))}
            </div>
          </div>

          <div>
            <label className={label} htmlFor="l-notes">Notes</label>
            <textarea id="l-notes" rows={5} className="input" placeholder="What would you change next time?"
              value={e.notes} onChange={(ev) => patch({ notes: ev.target.value })} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
