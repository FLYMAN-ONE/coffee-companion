import { useState } from "react";
import { NumberField } from "../../components/inputs/NumberField";
import { Ruler } from "../../components/inputs/Ruler";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Segmented } from "../../components/ui/Segmented";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { grinds, methods } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtDec, fmtTime, uid } from "../../lib/format";
import type { Recipe, RecipeStep } from "../../types";
import {
  coffeeInputValue,
  doseFromCoffee,
  doseFromInput,
  round1,
  type CoffeeInput,
} from "../prepare/logic/dosing";
import { totalSeconds } from "./logic/recipe";
import { sequenceLayout } from "./logic/sequence";
import { WaterRibbon } from "./WaterRibbon";

const RIBBON_H = 72;

interface RecipeEditorProps {
  recipe: Recipe;
  isNew: boolean;
  onSave: (r: Recipe) => void;
  onDelete: () => void;
  onCancel: () => void;
}

/** Inline editor in the recipe detail panel. Step water is edited in ml and stored as % of the total. */
export function RecipeEditor({ recipe, isNew, onSave, onDelete, onCancel }: RecipeEditorProps) {
  const { t, lang } = useI18n();
  const [r, setR] = useState<Recipe>(recipe);
  const [sel, setSel] = useState(0);
  const [error, setError] = useState(false);
  // The coffee is entered as grams, g/L or ratio; the recipe always stores the dose in g/L.
  const [mode, setMode] = useState<CoffeeInput>("g");
  const patch = (p: Partial<Recipe>) => setR((cur) => ({ ...cur, ...p }));
  const patchStep = (i: number, p: Partial<RecipeStep>) =>
    setR((cur) => ({ ...cur, steps: cur.steps.map((s, j) => (j === i ? { ...s, ...p } : s)) }));

  const coffee = coffeeInputValue("g", r.dose, r.water);
  const ratio = coffeeInputValue("ratio", r.dose, r.water);
  const gpl = coffeeInputValue("gpl", r.dose, r.water);
  // In grams the coffee stays put when the water changes; in g/L and ratio the dose does.
  const setWater = (water: number) =>
    patch(mode === "g" ? { water, dose: doseFromCoffee(coffee, water) } : { water });
  const field = {
    g: { label: t.recipes.coffeeLabel, unit: "g", step: 0.1, min: 0.5, max: 300, decimals: 1 },
    gpl: { label: t.recipes.doseLabel, unit: "g/L", step: 1, min: 1, max: 1000, decimals: 0 },
    ratio: { label: t.recipes.ratioLabel, unit: undefined, step: 0.1, min: 1, max: 30, decimals: 1 },
  }[mode];
  const derived = {
    g: [`${fmtDec(gpl, 0, lang)} g/L`, `${t.recipes.ratio} 1:${fmtDec(ratio, 1, lang)}`],
    gpl: [
      `${fmtDec(coffee, 1, lang)} g ${t.recipes.coffee}`,
      `${t.recipes.ratio} 1:${fmtDec(ratio, 1, lang)}`,
    ],
    ratio: [`${fmtDec(coffee, 1, lang)} g ${t.recipes.coffee}`, `${fmtDec(gpl, 0, lang)} g/L`],
  }[mode];
  const total = totalSeconds(r) || 1;
  const layout = sequenceLayout(r.steps);
  const step = r.steps[sel];
  const ml = (pct: number) => Math.round((pct / 100) * r.water);

  const move = (dir: -1 | 1) => {
    const j = sel + dir;
    if (j < 0 || j >= r.steps.length) return;
    const steps = [...r.steps];
    [steps[sel], steps[j]] = [steps[j], steps[sel]];
    patch({ steps });
    setSel(j);
  };
  const addStep = () => {
    const last = r.steps[r.steps.length - 1];
    patch({
      steps: [
        ...r.steps,
        { id: uid(), label: t.recipes.newStep, seconds: 30, waterPct: last?.waterPct ?? 100 },
      ],
    });
    setSel(r.steps.length);
  };
  const removeStep = () => {
    patch({ steps: r.steps.filter((_, j) => j !== sel) });
    setSel(Math.max(0, sel - 1));
  };
  const save = () => {
    if (!r.name.trim()) return setError(true);
    onSave({ ...r, name: r.name.trim() });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <h2 className="flex-1 text-[28px] font-bold tracking-tight">
          {isNew ? t.recipes.newRecipe : t.recipes.editTitle}
        </h2>
        <Button variant="text" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" icon="check" onClick={save}>
          {t.common.save}
        </Button>
      </div>

      <label className="flex flex-col gap-2">
        <span className="eyebrow">{t.recipes.name}</span>
        <input
          className="input"
          value={r.name}
          placeholder={t.recipes.namePh}
          aria-invalid={error}
          onChange={(e) => {
            setError(false);
            patch({ name: e.target.value });
          }}
        />
        {error ? <span className="text-[13px] text-danger">{t.recipes.nameRequired}</span> : null}
      </label>

      <div className="flex flex-col gap-2">
        <span className="eyebrow">{t.recipes.method}</span>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <Chip
              key={m.id}
              icon={m.id}
              tone="raised"
              selected={r.method === m.id}
              onClick={() => patch({ method: m.id })}
            >
              {t.methods[m.id]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <NumberField
          label={t.recipes.waterLabel}
          unit="ml"
          value={r.water}
          step={r.water < 100 ? 1 : 10}
          min={10}
          max={5000}
          onChange={setWater}
        />
        <NumberField
          key={mode}
          label={field.label}
          unit={field.unit}
          value={coffeeInputValue(mode, r.dose, r.water)}
          step={field.step}
          min={field.min}
          max={field.max}
          decimals={field.decimals}
          onChange={(v) => patch({ dose: doseFromInput(mode, v, r.water) })}
        />
        <NumberField
          label={t.recipes.temp}
          unit="°C"
          value={r.tempC}
          step={1}
          min={0}
          max={100}
          onChange={(tempC) => patch({ tempC })}
        />
      </div>
      <div className="-mt-1 flex items-center gap-3">
        <span className="eyebrow">{t.recipes.coffeeIn}</span>
        <Segmented
          label={t.recipes.coffeeIn}
          value={mode}
          onChange={setMode}
          options={[
            { id: "g", label: t.recipes.coffeeModes.g },
            { id: "gpl", label: t.recipes.coffeeModes.gpl },
            { id: "ratio", label: t.recipes.coffeeModes.ratio },
          ]}
        />
        <span className="num ml-auto text-[14px] tracking-normal text-mute">
          = <span className="text-ink">{derived[0]}</span> · <span className="text-ink">{derived[1]}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="eyebrow">{t.recipes.grind}</span>
        <div className="flex flex-wrap gap-2">
          {grinds.map((g) => (
            <Chip key={g} tone="raised" selected={r.grind === g} onClick={() => patch({ grind: g })}>
              {t.grinds[g]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="eyebrow">
          {r.steps.length ? t.recipes.stepsHint(fmtTime(total)) : t.recipes.noSteps}
        </span>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-x-0 top-0">
              <WaterRibbon steps={layout} water={r.water} height={RIBBON_H} gap="surface" labelSize={16} />
            </div>
            <div className="relative flex">
              {layout.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSel(i)}
                  aria-pressed={i === sel}
                  style={{ flex: `${s.x1 - s.x0} 1 0`, paddingTop: RIBBON_H + 8 }}
                  className={`press flex min-w-0 flex-col rounded-[16px] px-2 pb-2 text-left ${
                    i === sel ? "bg-accent/8 shadow-[inset_0_0_0_2px_var(--color-accent)]" : ""
                  }`}
                >
                  <b className="line-clamp-2 text-[12.5px] leading-tight">{s.label}</b>
                  <span className="num text-xs tracking-normal text-mute">{fmtTime(s.seconds)}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={addStep}
            aria-label={t.recipes.addStep}
            className="press grid w-[52px] shrink-0 place-items-center self-stretch rounded-[16px] bg-accent/14 text-accent"
          >
            +
          </button>
        </div>
      </div>

      {step ? (
        <div
          key={step.id}
          className="motion-fade flex flex-col gap-3 rounded-[22px] bg-raised p-4"
          style={{ animation: "rise-in 150ms var(--ease-out)" }}
        >
          <div className="flex items-center gap-2">
            <input
              className="input flex-1 !bg-surface"
              aria-label={t.recipes.stepName}
              value={step.label}
              onChange={(e) => patchStep(sel, { label: e.target.value })}
            />
            <Button
              variant="icon"
              icon="left"
              className="!bg-surface"
              aria-label={t.recipes.moveLeft}
              disabled={sel === 0}
              onClick={() => move(-1)}
            />
            <Button
              variant="icon"
              icon="right"
              className="!bg-surface"
              aria-label={t.recipes.moveRight}
              disabled={sel === r.steps.length - 1}
              onClick={() => move(1)}
            />
            <Button
              variant="icon"
              icon="trash"
              className="!bg-surface"
              aria-label={t.recipes.removeStep}
              onClick={removeStep}
            />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="eyebrow w-21">{t.recipes.stepDuration}</span>
            <span className="num text-[22px]">{fmtTime(step.seconds)}</span>
          </div>
          <Ruler
            key={`d-${step.id}`}
            size="sm"
            min={5}
            max={600}
            step={5}
            px={7}
            major={30}
            label={60}
            formatLabel={fmtTime}
            value={step.seconds}
            onChange={(seconds) => patchStep(sel, { seconds })}
            ariaLabel={t.recipes.stepDuration}
            ariaValueText={fmtTime(step.seconds)}
          />
          <div className="flex items-baseline gap-3">
            <span className="eyebrow w-21">{t.recipes.stepWater}</span>
            <span className="num text-[22px] text-water">{ml(step.waterPct)} ml</span>
            <span className="text-[13px] text-faint">{t.recipes.waterAtEnd(r.water)}</span>
          </div>
          <Ruler
            key={`w-${step.id}-${r.water}`}
            size="sm"
            min={0}
            max={r.water}
            step={5}
            px={7}
            major={50}
            label={100}
            value={Math.round(ml(step.waterPct) / 5) * 5}
            onChange={(v) => patchStep(sel, { waterPct: round1((v / r.water) * 100) })}
            ariaLabel={t.recipes.stepWater}
            ariaValueText={`${ml(step.waterPct)} ml`}
          />
        </div>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="eyebrow">{t.recipes.notes}</span>
        <textarea
          className="input"
          rows={4}
          placeholder={t.recipes.notesPh}
          value={r.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </label>

      {!isNew ? (
        <div>
          <ConfirmButton label={t.common.delete} onConfirm={onDelete} />
        </div>
      ) : null}
    </div>
  );
}
