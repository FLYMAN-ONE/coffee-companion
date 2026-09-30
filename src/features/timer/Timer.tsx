import { useApp } from "../../app/store";
import { getMethod } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtTime, uid } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { GlassCard } from "../../components/ui/GlassCard";
import { Icon } from "../../components/ui/Icon";
import { PageHeader } from "../../components/ui/PageHeader";
import type { LogEntry } from "../../types";

const R = 88;
const C = 2 * Math.PI * R;

export function Timer() {
  const { timer, calc, recipes, timerRecipe, timerRecipeId, setTimerRecipeId, applyRecipe, go, setLogDraft } =
    useApp();

  const { t } = useI18n();
  const steps = timerRecipe?.steps ?? [];
  const { status, hasSteps, stepIndex, elapsedMs, totalMs } = timer;
  const active = status === "running" || status === "paused";
  const step = hasSteps && stepIndex >= 0 ? steps[stepIndex] : null;

  const target = (pct: number) => Math.round((pct / 100) * calc.water);
  const prevPct = stepIndex > 0 ? steps[stepIndex - 1].waterPct : 0;
  const pourDelta = step ? target(step.waterPct) - target(prevPct) : 0;

  // Dial progress: current step, or a 60 s sweep for the plain stopwatch.
  const progress = hasSteps
    ? status === "done"
      ? 1
      : (elapsedMs - timer.stepStart) / Math.max(1, timer.stepEnd - timer.stepStart)
    : (elapsedMs % 60000) / 60000;

  const bigTime =
    status === "done"
      ? fmtTime(elapsedMs / 1000)
      : hasSteps
        ? fmtTime(status === "idle" ? steps[0].seconds : Math.ceil(timer.stepRemainingMs / 1000))
        : fmtTime(Math.floor(elapsedMs / 1000));

  const caption =
    status === "done"
      ? t.timer.brewComplete
      : step
        ? status === "idle"
          ? t.timer.stepReady(step.label, target(step.waterPct))
          : pourDelta > 0
            ? t.timer.pourToDelta(target(step.waterPct), pourDelta)
            : t.timer.wait
        : status === "idle"
          ? t.timer.stopwatch
          : t.timer.brewing;

  const label = status === "done" ? t.timer.done : step ? step.label : t.timer.stopwatch;

  const saveToLog = () => {
    const m = getMethod(calc.method);
    const draft: LogEntry = {
      id: uid(),
      date: new Date().toISOString(),
      method: timerRecipe?.method ?? calc.method,
      recipeName: timerRecipe?.name ?? "",
      beans: "",
      dose: calc.dose,
      water: calc.water,
      coffee: calc.coffee,
      tempC: timerRecipe?.tempC ?? m.tempC,
      grind: timerRecipe?.grind ?? m.grind,
      timeSec: Math.round(elapsedMs / 1000),
      rating: 0,
      tastes: [],
      notes: "",
    };
    setLogDraft(draft);
    go("log");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t.timer.title}
        subtitle={
          timerRecipe
            ? t.timer.subtitleRecipe(timerRecipe.name, calc.coffee, calc.water)
            : t.timer.subtitleFree(calc.coffee, calc.water)
        }
      />

      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1">
        <Chip disabled={active} selected={timerRecipeId === null} onClick={() => { timer.reset(); setTimerRecipeId(null); }}>
          {t.timer.stopwatch}
        </Chip>
        {recipes
          .filter((r) => r.steps.length > 0)
          .map((r) => (
            <Chip
              key={r.id}
              disabled={active}
              selected={timerRecipeId === r.id}
              onClick={() => { timer.reset(); applyRecipe(r); }}
            >
              {r.name}
            </Chip>
          ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <GlassCard className="flex flex-col items-center gap-5">
          <div className="relative aspect-square w-[min(100%,26rem,44dvh)] [container-type:inline-size]">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={R} fill="none" strokeWidth="9" className="stroke-raise" />
              <circle
                cx="100"
                cy="100"
                r={R}
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                className="stroke-accent"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - Math.min(1, Math.max(0, progress)))}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[10cqw] text-center">
              <div className="mb-1 text-xl text-accent">{label}</div>
              <div className="tabular text-[24cqw] font-semibold leading-none tracking-tight">
                {bigTime}
              </div>
              <div className="mt-3 text-lg text-mute">{caption}</div>
              {hasSteps && status !== "idle" ? (
                <div className="tabular mt-1 text-sm text-mute">
                  {t.timer.total} {fmtTime(Math.floor(elapsedMs / 1000))} / {fmtTime(totalMs / 1000)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-3">
            {status === "idle" && (
              <Button variant="primary" size="lg" icon="play" className="w-full max-w-sm" onClick={timer.start}>
                {t.timer.start}
              </Button>
            )}
            {status === "running" && (
              <>
                <Button size="lg" icon="pause" onClick={timer.pause}>{t.timer.pause}</Button>
                {hasSteps && stepIndex < steps.length - 1 ? (
                  <Button size="lg" icon="skip" onClick={timer.skip}>{t.timer.next}</Button>
                ) : (
                  <Button size="lg" icon="flag" onClick={timer.finish}>{t.timer.finish}</Button>
                )}
              </>
            )}
            {status === "paused" && (
              <>
                <Button variant="primary" size="lg" icon="play" onClick={timer.resume}>{t.timer.resume}</Button>
                <Button size="lg" icon="flag" onClick={timer.finish}>{t.timer.finish}</Button>
                <Button size="lg" icon="reset" onClick={timer.reset}>{t.timer.reset}</Button>
              </>
            )}
            {status === "done" && (
              <>
                <Button variant="primary" size="lg" icon="log" onClick={saveToLog}>{t.timer.saveToLog}</Button>
                <Button size="lg" icon="reset" onClick={timer.reset}>{t.timer.reset}</Button>
              </>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          {hasSteps ? (
            <ol className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const done = status === "done" || (status !== "idle" && i < stepIndex);
                const current = active && i === stepIndex;
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition ${
                      current ? "bg-accent/15 ring-1 ring-accent/60" : "bg-soft"
                    } ${done ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        done ? "bg-accent text-accent-ink" : current ? "bg-accent/30 text-accent" : "bg-raise text-mute"
                      }`}
                    >
                      {done ? <Icon name="check" className="h-5 w-5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-medium">{s.label}</div>
                      <div className="text-sm text-mute">{t.timer.toMl(target(s.waterPct))}</div>
                    </div>
                    <span className="tabular text-lg text-mute">{fmtTime(s.seconds)}</span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-center text-mute">
              <Icon name="timer" className="h-12 w-12" />
              <p className="max-w-xs text-lg">{t.timer.plain}</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
