import { useId, useState } from "react";
import { useToast } from "../../app/toast";
import { Ruler } from "../../components/inputs/Ruler";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Icon } from "../../components/ui/Icon";
import { SwapNumber } from "../../components/ui/SwapNumber";
import { getMethod, methods } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtDec, fmtTime } from "../../lib/format";
import type { Recipe } from "../../types";
import { totalSeconds } from "../recipes/logic/recipe";
import { sequenceLayout } from "../recipes/logic/sequence";
import { RecipeList } from "../recipes/RecipeList";
import { useRecipes } from "../recipes/recipesStore";
import { WaterRibbon } from "../recipes/WaterRibbon";
import { useTimerSession } from "../timer/timerStore";
import { COUNTDOWN_MS } from "../timer/useTimer";
import {
  DOSE_FIELDS,
  RULER_SCALES,
  derivedField,
  prepareLock,
  type DoseField,
  type PrepareField,
} from "./logic/dosing";
import { usePrepare } from "./prepareStore";

/** How long the picked row stays visible before the recipe sheet closes. */
const PICK_CLOSE_DELAY = 150;

/**
 * Prepare: pick a recipe (or Free), set the doses with the ruler, press Play. The doses use the
 * whole width; the recipe list is a glass sheet opened from the title, closed again after a pick.
 */
export function PrepareScreen() {
  const prep = usePrepare();
  const { recipe } = prep;
  const { t, lang } = useI18n();
  const toast = useToast();
  const { toggleFavorite } = useRecipes();
  const { actions } = useTimerSession();

  const [field, setField] = useState<PrepareField>("coffee");
  const [dragging, setDragging] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const sheetId = useId();

  const m = getMethod(recipe?.method ?? prep.method);
  const temp = recipe?.tempC ?? m.tempC;
  const grind = recipe?.grind ?? m.grind;
  const duration = recipe ? totalSeconds(recipe) : 0;

  const text: Record<DoseField, string> = {
    coffee: fmtDec(prep.coffee, 1, lang),
    ratio: `1:${fmtDec(prep.ratio, 1, lang)}`,
    water: String(Math.round(prep.water)),
  };
  const template: Record<DoseField, string> = { coffee: "00,0", ratio: "1:00,0", water: "000" };
  const unit: Partial<Record<DoseField, string>> = { coffee: "g", water: "ml" };

  const pick = (r: Recipe | null) => {
    prep.pickRecipe(r);
    setTimeout(() => setListOpen(false), PICK_CLOSE_DELAY);
  };
  // While dragging, the value that follows lights up: the other amount with a recipe, the ratio in Free.
  const follower = derivedField(prepareLock(recipe !== null, field), field);

  return (
    <div className="relative h-full">
      <div
        inert={listOpen}
        className="motion-move flex h-full min-w-0 flex-col gap-[18px]"
        style={{
          transformOrigin: "70% 50%",
          transform: listOpen ? "translateX(36px) scale(0.965)" : "none",
          opacity: listOpen ? 0.4 : 1,
          transition: listOpen
            ? "transform 460ms var(--ease-out), opacity 300ms var(--ease-out)"
            : "transform 300ms var(--ease-out), opacity 300ms var(--ease-out)",
        }}
      >
        <header className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setListOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={listOpen}
            aria-controls={sheetId}
            className="press press-wide -my-1.5 -ml-1.5 flex min-w-0 flex-1 items-center gap-4 rounded-[24px] bg-linear-to-r from-surface to-transparent to-85% py-1.5 pr-[18px] pl-1.5 text-left"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-accent/14 text-accent">
              <Icon name={m.id} className="h-[30px] w-[30px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[30px] leading-tight font-bold tracking-tight">
                {recipe?.name ?? t.prepare.free}
              </span>
              <span className="mt-1 block text-sm text-mute">
                {recipe
                  ? `${t.methods[m.id]} · ${recipe.steps.length ? t.prepare.steps(recipe.steps.length) : t.prepare.noTimer}`
                  : t.prepare.freeHint}
              </span>
            </span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-raised text-ink">
              <Icon name="down" className="h-[22px] w-[22px]" />
            </span>
          </button>
          {recipe ? (
            <Button
              variant="icon"
              icon="heart"
              active={recipe.favorite}
              aria-label={recipe.favorite ? t.prepare.favRemove : t.prepare.favAdd}
              aria-pressed={recipe.favorite}
              onClick={() => {
                toggleFavorite(recipe.id);
                toast(recipe.favorite ? t.prepare.favRemoved : t.prepare.favAdded);
              }}
            />
          ) : null}
        </header>

        <div className="flex flex-wrap gap-2">
          <Fact icon="thermo" value={`${temp} °C`} num />
          <Fact icon="grind" value={t.grinds[grind]} />
          {duration ? <Fact icon="clock" value={fmtTime(duration)} num /> : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {DOSE_FIELDS.map((f) => {
            const derived = dragging && f === follower;
            const value = (
              <div
                className={`mt-0.5 flex items-baseline gap-1.5 text-[50px] leading-[1.15] font-medium ${
                  f === "ratio" ? "opacity-75" : ""
                }`}
              >
                <SwapNumber
                  text={text[f]}
                  template={template[f]}
                  swapKey={prep.recipeId}
                  className={f === "water" ? "text-water" : ""}
                />
                {unit[f] ? <small className="text-base font-medium text-mute">{unit[f]}</small> : null}
              </div>
            );
            // The ratio is read-only: set by the recipe, or the result of coffee and water in Free.
            if (f === "ratio")
              return (
                <div
                  key={f}
                  className={`rounded-[22px] px-[18px] pt-3.5 pb-3 shadow-[inset_0_0_0_1.5px_var(--color-line)] transition-colors duration-200 ${
                    derived ? "bg-accent/7" : ""
                  }`}
                >
                  <div className={`eyebrow text-xs ${derived ? "text-accent" : ""}`}>
                    {t.prepare.fields.ratio}
                    <span className="tracking-[0.06em] text-faint">
                      {" "}
                      · {recipe ? t.prepare.ratioRecipe : t.prepare.ratioResult}
                    </span>
                  </div>
                  {value}
                </div>
              );
            const on = f === field;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setField(f)}
                className={`press rounded-[22px] px-[18px] pt-3.5 pb-3 text-left ${
                  on
                    ? "bg-raised shadow-[inset_0_0_0_2px_var(--color-accent)]"
                    : derived
                      ? "bg-accent/7"
                      : "bg-surface"
                }`}
              >
                <div className={`eyebrow text-xs ${on || derived ? "text-accent" : ""}`}>
                  {t.prepare.fields[f]}
                </div>
                {value}
              </button>
            );
          })}
        </div>

        <Ruler
          key={field}
          {...RULER_SCALES[field]}
          value={prep[field]}
          onChange={(v) => prep.change(field, v)}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          ariaLabel={t.prepare.rulerAria(t.prepare.fields[field])}
          ariaValueText={`${text[field]} ${unit[field] ?? ""}`}
          formatLabel={(v) => String(Math.round(v))}
        />

        {recipe && recipe.steps.length ? (
          <Sequence recipe={recipe} water={prep.water} />
        ) : recipe ? (
          <p className="self-start rounded-[14px] bg-surface px-3.5 py-2 text-[13.5px] text-mute">
            {t.prepare.noSteps}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {methods.map((mm) => (
              <Chip
                key={mm.id}
                icon={mm.id}
                selected={mm.id === prep.method}
                onClick={() => prep.setMethod(mm.id)}
              >
                {t.methods[mm.id]}
              </Chip>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-5">
          <Button variant="primary" size="xl" icon="play" onClick={() => actions.start(COUNTDOWN_MS)}>
            {t.prepare.play}
          </Button>
          <div className="text-sm leading-normal text-mute">
            {duration ? t.prepare.duration : t.prepare.stopwatch}
            <br />
            <b className="num text-[17px] font-medium text-ink">
              {duration ? fmtTime(duration) : t.prepare.freeTime}
            </b>
          </div>
        </div>
      </div>

      {/* Recipe sheet: clipped to the screen area so it slides in from under the rail's edge. */}
      <div className={`absolute -inset-7 z-10 overflow-hidden ${listOpen ? "" : "pointer-events-none"}`}>
        <div aria-hidden="true" className="absolute inset-0" onClick={() => setListOpen(false)} />
        <div
          id={sheetId}
          role="dialog"
          aria-label={t.prepare.chooseRecipe}
          inert={!listOpen}
          className="motion-move absolute top-5 bottom-5 left-5 flex w-[340px] flex-col rounded-[30px] bg-surface/82 shadow-[0_0_0_1px_var(--color-line),0_40px_80px_-20px_rgb(0_0_0/0.7)] backdrop-blur-[26px] backdrop-saturate-130"
          style={{
            transform: listOpen ? "none" : "translateX(calc(-100% - 40px))",
            opacity: listOpen ? 1 : 0,
            transition: listOpen
              ? "transform 460ms var(--ease-spring), opacity 150ms var(--ease-out)"
              : "transform 300ms var(--ease-out), opacity 200ms var(--ease-out) 100ms",
          }}
        >
          <RecipeList
            selectedId={prep.recipeId}
            onPick={pick}
            withFree
            cascade={listOpen}
            className="min-h-0 flex-1 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  value,
  num = false,
}: {
  icon: "thermo" | "grind" | "clock";
  value: string;
  num?: boolean;
}) {
  return (
    <span className="flex items-center gap-2 rounded-[14px] bg-surface px-3.5 py-2 text-[13.5px] text-mute">
      <Icon name={icon} className="h-5 w-5" />
      <b className={`font-semibold text-ink ${num ? "num" : ""}`}>{value}</b>
    </span>
  );
}

/** The recipe as a ribbon of water, with start time, name and duration of each step below. */
function Sequence({ recipe, water }: { recipe: Recipe; water: number }) {
  const { t } = useI18n();
  const steps = sequenceLayout(recipe.steps);

  return (
    <div key={recipe.id}>
      <div className="eyebrow mb-3">{t.prepare.sequence}</div>
      <div className="motion-fade" style={{ animation: "ribbon-wipe 900ms var(--ease-out) both" }}>
        <WaterRibbon steps={steps} water={water} height={140} gap="app" />
      </div>
      <div className="mt-2.5 flex" style={{ animation: "fade-in 300ms var(--ease-out)" }}>
        {steps.map((s) => (
          <div key={s.id} className="flex min-w-0 flex-col pr-2.5" style={{ flex: `${s.x1 - s.x0} 1 0` }}>
            <span className="num text-xs tracking-normal text-faint">{fmtTime(s.start)}</span>
            <b className="line-clamp-2 text-sm leading-tight font-semibold text-ink">{s.label}</b>
            <span className="num text-[13px] tracking-normal text-mute">{fmtTime(s.seconds)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
