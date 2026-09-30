import type { ReactNode } from "react";
import { useApp } from "../../app/store";
import { methods, getMethod } from "../../data/methods";
import { uid } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { GlassCard } from "../../components/ui/GlassCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { NumberField } from "../../components/inputs/NumberField";
import { Slider } from "../../components/inputs/Slider";
import { describeStrength, rangeMax } from "./logic/calculations";
import type { LogEntry, Recipe } from "../../types";

const quickWater = [200, 250, 350, 500, 1000];

function FieldCard({
  title,
  hint,
  active,
  children,
}: {
  title: string;
  hint: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <GlassCard active={active} className="grid items-center gap-x-8 gap-y-3 !p-5 lg:grid-cols-[9rem_1fr]">
      <div>
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-sm text-mute">{hint}</div>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </GlassCard>
  );
}

export function BrewCalculator() {
  const { calc, go, setRecipeDraft, setLogDraft, timer } = useApp();
  const method = getMethod(calc.method);

  const saveAsRecipe = () => {
    const draft: Recipe = {
      id: uid(),
      name: "",
      method: calc.method,
      dose: calc.dose,
      water: calc.water,
      tempC: method.tempC,
      grind: method.grind,
      notes: "",
      steps: [],
      favorite: false,
      createdAt: new Date().toISOString(),
    };
    setRecipeDraft(draft);
    go("recipes");
  };

  const logBrew = () => {
    const draft: LogEntry = {
      id: uid(),
      date: new Date().toISOString(),
      method: calc.method,
      recipeName: "",
      beans: "",
      dose: calc.dose,
      water: calc.water,
      coffee: calc.coffee,
      tempC: method.tempC,
      grind: method.grind,
      timeSec: 0,
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
        title="Brew Calculator"
        subtitle="Change any value — the others follow"
        actions={
          <Button variant="ghost" icon="reset" onClick={calc.reset}>
            Reset
          </Button>
        }
      />

      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1">
        {methods.map((m) => (
          <Chip key={m.id} selected={calc.method === m.id} onClick={() => calc.setMethod(m.id)}>
            {m.label}
          </Chip>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <FieldCard title="Dose" hint="coffee per litre" active={calc.activeField === "dose"}>
            <NumberField
              size="lg"
              label="Dose"
              value={calc.dose}
              unit="g/L"
              step={1}
              min={10}
              max={1000}
              onChange={calc.setDose}
            />
            <Slider
              label="Dose slider"
              value={calc.dose}
              min={20}
              max={rangeMax(calc.dose, 150)}
              step={1}
              onChange={calc.setDose}
            />
          </FieldCard>

          <FieldCard title="Water" hint="total brew water" active={calc.activeField === "water"}>
            <NumberField
              size="lg"
              label="Water"
              value={calc.water}
              unit="ml"
              step={calc.water < 100 ? 1 : 10}
              min={10}
              max={5000}
              onChange={calc.setWater}
            />
            <Slider
              label="Water slider"
              value={calc.water}
              min={10}
              max={rangeMax(calc.water, 1000)}
              step={1}
              onChange={calc.setWater}
            />
          </FieldCard>

          <FieldCard title="Coffee" hint="ground coffee" active={calc.activeField === "coffee"}>
            <NumberField
              size="lg"
              label="Coffee"
              value={calc.coffee}
              unit="g"
              step={0.5}
              min={1}
              max={500}
              decimals={1}
              onChange={calc.setCoffee}
            />
            <Slider
              label="Coffee slider"
              value={calc.coffee}
              min={1}
              max={rangeMax(calc.coffee, 100)}
              step={0.1}
              onChange={calc.setCoffee}
            />
          </FieldCard>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <GlassCard className="text-center">
            <div className="text-sm text-mute">Brew ratio</div>
            <div className="tabular my-2 text-7xl font-semibold tracking-tight text-accent">
              1:{calc.ratio}
            </div>
            <div className="text-lg text-mute">
              {describeStrength(calc.dose)} · {method.label}
            </div>
            <div className="mt-4 flex justify-center gap-6 text-base">
              <span>
                <b className="tabular text-xl">{method.tempC}°</b>
                <span className="block text-sm text-mute">water</span>
              </span>
              <span>
                <b className="text-xl">{method.grind}</b>
                <span className="block text-sm text-mute">grind</span>
              </span>
            </div>
          </GlassCard>

          <GlassCard className="!p-5">
            <div className="mb-3 text-sm text-mute">Quick water</div>
            <div className="flex flex-wrap gap-2">
              {quickWater.map((w) => (
                <Chip key={w} selected={calc.water === w} onClick={() => calc.setWater(w)}>
                  {w} ml
                </Chip>
              ))}
            </div>
          </GlassCard>

          <div className="mt-auto flex flex-col gap-3">
            <Button variant="primary" size="lg" icon="play" onClick={() => go("timer")}>
              {timer.status === "running" || timer.status === "paused" ? "Open timer" : "Start brewing"}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button icon="book" onClick={saveAsRecipe}>
                Save recipe
              </Button>
              <Button icon="log" onClick={logBrew}>
                Log brew
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
