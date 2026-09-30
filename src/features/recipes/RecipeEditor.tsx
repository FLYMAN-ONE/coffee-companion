import { useState } from "react";
import { getMethod, grinds, methods } from "../../data/methods";
import { fmtTime, uid } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Modal } from "../../components/ui/Modal";
import { NumberField } from "../../components/inputs/NumberField";
import { calculateCoffee } from "../brew-calculator/logic/calculations";
import type { Recipe, RecipeStep } from "../../types";

interface RecipeEditorProps {
  recipe: Recipe;
  isNew: boolean;
  onSave: (r: Recipe) => void;
  onDelete: () => void;
  onClose: () => void;
}

const label = "mb-2 block text-sm text-mute";

export function RecipeEditor({ recipe, isNew, onSave, onDelete, onClose }: RecipeEditorProps) {
  const [r, setR] = useState<Recipe>(recipe);
  const patch = (p: Partial<Recipe>) => setR((cur) => ({ ...cur, ...p }));

  const patchStep = (id: string, p: Partial<RecipeStep>) =>
    patch({ steps: r.steps.map((s) => (s.id === id ? { ...s, ...p } : s)) });

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= r.steps.length) return;
    const next = [...r.steps];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ steps: next });
  };

  const addStep = () => {
    const last = r.steps[r.steps.length - 1];
    patch({
      steps: [
        ...r.steps,
        { id: uid(), label: `Step ${r.steps.length + 1}`, seconds: 30, waterPct: last?.waterPct ?? 100 },
      ],
    });
  };

  const totalSec = r.steps.reduce((s, x) => s + x.seconds, 0);
  const canSave = r.name.trim().length > 0;

  return (
    <Modal
      wide
      title={isNew ? "New recipe" : "Edit recipe"}
      onClose={onClose}
      footer={
        <>
          {!isNew && <ConfirmButton label="Delete" onConfirm={onDelete} />}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon="check"
            disabled={!canSave}
            onClick={() => onSave({ ...r, name: r.name.trim() })}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div>
            <label className={label} htmlFor="r-name">Name</label>
            <input
              id="r-name"
              className="input"
              placeholder="e.g. Morning V60"
              value={r.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </div>

          <div>
            <span className={label}>Method</span>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <Chip key={m.id} selected={r.method === m.id} onClick={() => patch({ method: m.id })}>
                  {m.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Dose" unit="g/L" value={r.dose} step={1} min={10} max={1000} onChange={(dose) => patch({ dose })} />
            <NumberField label="Water" unit="ml" value={r.water} step={r.water < 100 ? 1 : 10} min={10} max={5000} onChange={(water) => patch({ water })} />
          </div>
          <div className="-mt-2 text-sm text-mute">
            = {calculateCoffee(r.water, r.dose)} g coffee · ratio 1:
            {r.dose ? Number((1000 / r.dose).toFixed(1)) : 0}
          </div>

          <NumberField label="Water temperature" unit="°C" value={r.tempC} step={1} min={0} max={100} onChange={(tempC) => patch({ tempC })} />

          <div>
            <span className={label}>Grind</span>
            <div className="flex flex-wrap gap-2">
              {grinds.map((g) => (
                <Chip key={g} selected={r.grind === g} onClick={() => patch({ grind: g })}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className={label} htmlFor="r-notes">Notes</label>
            <textarea
              id="r-notes"
              rows={3}
              className="input"
              placeholder="Tips, taste goals, bean suggestions…"
              value={r.notes}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Timer steps</div>
              <div className="text-sm text-mute">
                {r.steps.length ? `${r.steps.length} steps · ${fmtTime(totalSec)}` : "No steps: the timer runs as a stopwatch"}
              </div>
            </div>
            <Button icon="plus" onClick={addStep}>
              Add step
            </Button>
          </div>

          {r.steps.map((s, i) => (
            <div key={s.id} className="rounded-2xl border border-line bg-soft/50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <input
                  className="input !min-h-11 flex-1"
                  aria-label={`Step ${i + 1} name`}
                  value={s.label}
                  onChange={(e) => patchStep(s.id, { label: e.target.value })}
                />
                <Button variant="ghost" size="icon" icon="up" aria-label="Move up" disabled={i === 0} onClick={() => moveStep(i, -1)} />
                <Button variant="ghost" size="icon" icon="down" aria-label="Move down" disabled={i === r.steps.length - 1} onClick={() => moveStep(i, 1)} />
                <Button variant="ghost" size="icon" icon="trash" aria-label="Remove step" onClick={() => patch({ steps: r.steps.filter((x) => x.id !== s.id) })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Duration" unit="s" value={s.seconds} step={5} min={1} max={3600} onChange={(seconds) => patchStep(s.id, { seconds })} />
                <NumberField label="Water by end" unit="%" value={s.waterPct} step={5} min={0} max={100} onChange={(waterPct) => patchStep(s.id, { waterPct })} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export const blankRecipe = (): Recipe => {
  const m = getMethod("v60");
  return {
    id: uid(),
    name: "",
    method: m.id,
    dose: m.dose,
    water: 250,
    tempC: m.tempC,
    grind: m.grind,
    notes: "",
    steps: [],
    favorite: false,
    createdAt: new Date().toISOString(),
  };
};
