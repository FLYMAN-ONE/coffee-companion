import { useId } from "react";
import { useNavigation } from "../../app/navigation";
import { useToast } from "../../app/toast";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { newLogEntry } from "../../data/factories";
import { getMethod } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtDec, fmtTime } from "../../lib/format";
import type { RecipeStep } from "../../types";
import { useLogs } from "../log/logsStore";
import { doseFromRatio } from "../prepare/logic/dosing";
import { usePrepare } from "../prepare/prepareStore";
import { useTimerClock } from "./timerStore";

/** Seconds a stopwatch-only brew takes to "fill" the carafe. */
const STOPWATCH_FILL_S = 180;
const WARN_MS = 5000;

/**
 * Full-screen brew view, readable from across the counter. Tap anywhere to
 * pause; next step and end live in the pause sheet so they cannot be hit by accident.
 */
export function FocusScreen() {
  const timer = useTimerClock();
  const prep = usePrepare();
  const { t, lang } = useI18n();
  const { recipe } = prep;
  const steps = recipe?.steps ?? [];
  const { status, hasSteps, stepIndex, elapsedMs, totalMs, stepStart, stepEnd, stepRemainingMs } = timer;

  const step = hasSteps ? steps[stepIndex] : null;
  const prevPct = stepIndex > 0 ? steps[stepIndex - 1].waterPct : 0;
  const ml = (pct: number) => Math.round((pct / 100) * prep.water);
  const pour = step ? step.waterPct > prevPct : false;

  // Water level: during a pour it rises from the previous target to this one, as a pace guide.
  const stepProgress = Math.min(1, (elapsedMs - stepStart) / Math.max(1, stepEnd - stepStart));
  const level =
    status === "done"
      ? 100
      : step
        ? prevPct + (step.waterPct - prevPct) * stepProgress
        : Math.min(100, (elapsedMs / 1000 / STOPWATCH_FILL_S) * 100);

  const warn = status === "running" && hasSteps && stepRemainingMs <= WARN_MS;
  const bigTime =
    hasSteps && status !== "done" ? Math.ceil(stepRemainingMs / 1000) : Math.floor(elapsedMs / 1000);

  return (
    <div
      role="dialog"
      aria-label={t.focus.label}
      onClick={() => status === "running" && timer.pause()}
      className="motion-fade fixed inset-0 z-40 flex cursor-pointer flex-col bg-[#0b0a08] px-11 pt-[max(34px,env(safe-area-inset-top))] pb-[max(30px,env(safe-area-inset-bottom))]"
      style={{ animation: "focus-in 550ms var(--ease-spring)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-bold tracking-[0.14em] text-sage uppercase">
            {step ? step.label : t.focus.stopwatch}
            {step ? (
              <span className="ml-2.5 tracking-[0.04em] text-faint">
                {t.focus.stepOf(stepIndex + 1, steps.length)}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 text-sm text-mute">
            {recipe?.name ?? t.prepare.free} · {fmtDec(prep.coffee, 1, lang)} g · {Math.round(prep.water)} ml
          </div>
        </div>
        <div className="text-right text-[13px] text-mute">
          {t.focus.total}
          <b className="num block text-[26px] font-medium text-ink">
            {fmtTime(elapsedMs / 1000)}
            {hasSteps ? ` / ${fmtTime(totalMs / 1000)}` : ""}
          </b>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] items-center gap-5">
        <div className="flex flex-col gap-1.5">
          <span
            className={`num text-[232px] leading-[0.92] font-medium tracking-[-0.05em] transition-colors duration-400 ${
              warn ? "text-sage" : "text-ink"
            }`}
          >
            {fmtTime(bigTime)}
          </span>
          <span className="ml-2 text-[15px] font-semibold text-faint">
            {hasSteps && status !== "done" ? t.focus.remaining : t.focus.elapsed}
          </span>
          <div className="mt-6.5 flex items-baseline gap-[18px]">
            {step ? (
              <>
                <span
                  className={`num text-[104px] leading-none font-medium tracking-[-0.04em] text-water ${pour ? "" : "opacity-45"}`}
                >
                  {ml(step.waterPct)}
                  <small className="ml-1.5 text-[40px]">ml</small>
                </span>
                {pour ? (
                  <span className="num text-[30px] text-water/70">+{ml(step.waterPct) - ml(prevPct)}</span>
                ) : (
                  <span className="text-[30px] font-semibold text-mute">{t.focus.wait}</span>
                )}
              </>
            ) : (
              <>
                <span className="num text-[104px] leading-none font-medium tracking-[-0.04em] text-water">
                  {Math.round(prep.water)}
                  <small className="ml-1.5 text-[40px]">ml</small>
                </span>
                <span className="text-[30px] font-semibold text-mute">{t.focus.inTotal}</span>
              </>
            )}
          </div>
        </div>
        <Carafe
          steps={steps}
          water={prep.water}
          level={level}
          target={step?.waterPct}
          warn={warn}
          done={status === "done"}
        />
      </div>

      {hasSteps ? (
        <Timeline
          steps={steps}
          water={prep.water}
          stepIndex={stepIndex}
          stepProgress={stepProgress}
          done={status === "done"}
          warn={warn}
        />
      ) : null}
      <div className="mt-4 text-center text-[13px] text-faint">{t.focus.tapToPause}</div>

      {/* Flash at each step change: remounting on a new key replays the CSS animation once. */}
      {status === "running" && stepIndex > 0 ? (
        <div
          key={stepIndex}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-sage opacity-0"
          style={{ animation: "flash 800ms var(--ease-out)" }}
        />
      ) : null}

      {status === "paused" ? <PauseSheet /> : null}
      {status === "done" ? <DoneSheet /> : null}
    </div>
  );
}

function Carafe({
  steps,
  water,
  level,
  target,
  warn,
  done,
}: {
  steps: RecipeStep[];
  water: number;
  level: number;
  target?: number;
  warn: boolean;
  done: boolean;
}) {
  const clip = useId();
  const y = (pct: number) => 350 - (pct / 100) * 290;
  const body = "M40 28 H200 Q208 28 208 38 V310 Q208 350 168 350 H72 Q32 350 32 310 V38 Q32 28 40 28 Z";
  const marks = [...new Set(steps.map((s) => s.waterPct).filter((p) => p > 0))];
  const wave = (amp: number) =>
    `M-160 0 ${Array.from({ length: 6 }, (_, i) => `q40 ${i % 2 ? amp : -amp} 80 0`).join(" ")} V400 H-160 Z`;
  const glass = warn ? "#a9c788" : "#4a443b";

  return (
    <svg viewBox="-80 0 340 380" className="h-full max-h-[470px] w-80" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <g
          style={{
            transform: `translateY(${y(level)}px)`,
            transition: done ? "transform 900ms var(--ease-spring)" : "transform 120ms linear",
          }}
        >
          <g className="motion-move" style={{ animation: "wave 2.6s linear infinite" }}>
            <path d={wave(-8)} fill="#d98a5f" opacity={0.9} />
          </g>
          <g className="motion-move" style={{ animation: "wave 3.8s linear infinite reverse" }}>
            <path d={wave(6)} transform="translate(0 6)" fill="#b86d45" opacity={0.55} />
          </g>
        </g>
      </g>
      <path
        d={body}
        fill="none"
        stroke={glass}
        strokeWidth={3}
        className="motion-move"
        style={warn ? { animation: "pulse-glass 1s ease-in-out infinite" } : undefined}
      />
      <path d="M208 92 Q250 96 248 160 Q246 226 208 232" fill="none" stroke={glass} strokeWidth={3} />
      {marks.map((p) => {
        const cur = p === target;
        return (
          <g key={p}>
            <line
              x1={10}
              x2={30}
              y1={y(p)}
              y2={y(p)}
              stroke={cur ? "#d98a5f" : "#4a443b"}
              strokeWidth={cur ? 3 : 2}
            />
            <text
              x={2}
              y={y(p) + 5}
              textAnchor="end"
              className="num"
              fontSize={15}
              fill={cur ? "#d98a5f" : "#6f6758"}
            >
              {Math.round((p / 100) * water)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Timeline({
  steps,
  water,
  stepIndex,
  stepProgress,
  done,
  warn,
}: {
  steps: RecipeStep[];
  water: number;
  stepIndex: number;
  stepProgress: number;
  done: boolean;
  warn: boolean;
}) {
  const total = steps.reduce((s, x) => s + x.seconds, 0) || 1;
  const pours = steps.map((s, i) => s.waterPct > (i ? steps[i - 1].waterPct : 0));
  return (
    <div className="mt-2.5 flex gap-1.5">
      {steps.map((s, i) => {
        const isDone = done || i < stepIndex;
        const cur = !done && i === stepIndex;
        const fill = isDone ? 100 : cur ? stepProgress * 100 : 0;
        return (
          <div key={s.id} className="flex min-w-0 flex-col gap-2" style={{ flex: s.seconds / total }}>
            <div
              className="motion-move h-3 overflow-hidden rounded-md bg-raised"
              style={cur && warn ? { animation: "pulse-bar 1s ease-in-out infinite" } : undefined}
            >
              <i className="block h-full rounded-md bg-sage" style={{ width: `${fill}%` }} />
            </div>
            <div
              className={`truncate text-sm font-semibold ${cur ? "text-ink" : isDone ? "text-mute" : "text-faint"}`}
            >
              {s.label}
              <span
                className={`num block text-[13px] font-normal tracking-normal ${cur ? "text-water" : ""}`}
              >
                {fmtTime(s.seconds)}
                {pours[i] ? ` · ${Math.round((s.waterPct / 100) * water)} ml` : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PauseSheet() {
  const timer = useTimerClock();
  const { recipe } = usePrepare();
  const { t } = useI18n();
  const step = timer.hasSteps ? recipe?.steps[timer.stepIndex] : null;
  return (
    <Sheet label={t.focus.paused} onClose={timer.resume} layer="top">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">{t.focus.paused}</div>
          <h2 className="mt-1.5 text-[26px] font-bold">{step?.label ?? t.focus.stopwatch}</h2>
        </div>
        <div className="text-right">
          <div className="num text-[56px] leading-none font-medium">{fmtTime(timer.elapsedMs / 1000)}</div>
          <div className="mt-1.5 text-[12.5px] text-faint">{t.focus.elapsed}</div>
        </div>
      </div>
      <div className="flex gap-2.5">
        <Button variant="primary" size="lg" icon="play" className="flex-1" onClick={timer.resume}>
          {t.focus.resume}
        </Button>
        {timer.hasSteps ? (
          <Button size="lg" icon="skip" className="flex-1" onClick={() => (timer.skip(), timer.resume())}>
            {t.focus.nextStep}
          </Button>
        ) : null}
      </div>
      <div className="flex items-center justify-between border-t border-line pt-4">
        <Button variant="text" icon="reset" onClick={() => (timer.reset(), timer.start())}>
          {t.focus.restart}
        </Button>
        <Button variant="danger" icon="stop" onClick={timer.finish}>
          {t.focus.end}
        </Button>
      </div>
    </Sheet>
  );
}

function DoneSheet() {
  const timer = useTimerClock();
  const prep = usePrepare();
  const { saveLog, select } = useLogs();
  const { go } = useNavigation();
  const toast = useToast();
  const { t, lang } = useI18n();
  const { recipe } = prep;
  const secs = Math.round(timer.elapsedMs / 1000);
  const m = getMethod(recipe?.method ?? prep.method);

  const save = () => {
    const entry = newLogEntry({
      method: m.id,
      recipeName: recipe?.name ?? "",
      dose: doseFromRatio(prep.ratio),
      water: Math.round(prep.water),
      coffee: prep.coffee,
      tempC: recipe?.tempC ?? m.tempC,
      grind: recipe?.grind ?? m.grind,
      timeSec: secs,
    });
    saveLog(entry);
    select(entry.id);
    timer.reset();
    go("log");
    toast(t.focus.savedToast);
  };

  return (
    <Sheet label={t.focus.doneTitle} layer="top" delayMs={700}>
      <div className="flex items-center gap-[18px]">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-sage text-sage-ink">
          <svg
            viewBox="0 0 24 24"
            className="h-[34px] w-[34px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              strokeDasharray={30}
              strokeDashoffset={30}
              className="motion-move"
              style={{ animation: "draw 500ms 950ms var(--ease-out) forwards" }}
            />
          </svg>
        </div>
        <div>
          <h2 className="text-[26px] font-bold">{t.focus.doneTitle}</h2>
          <div className="mt-1 text-mute">
            {recipe?.name ?? t.prepare.free} · <span className="num">{fmtTime(secs)}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {[
          [`${fmtDec(prep.coffee, 1, lang)} g`, t.recipes.coffee],
          [`${Math.round(prep.water)} ml`, t.recipes.water],
          [`1:${fmtDec(prep.ratio, 1, lang)}`, t.recipes.ratio],
          [fmtTime(secs), t.log.time],
        ].map(([v, l]) => (
          <div key={l} className="rounded-[18px] bg-raised px-3.5 py-3">
            <b className="num block text-[22px] font-medium">{v}</b>
            <span className="text-[12.5px] text-mute">{l}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2.5">
        <Button variant="text" onClick={timer.reset}>
          {t.common.close}
        </Button>
        <Button variant="primary" size="lg" icon="journal" className="flex-1" onClick={save}>
          {t.focus.saveToLog}
        </Button>
      </div>
    </Sheet>
  );
}
