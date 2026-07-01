import {
  useBrewCalculator
} from "./hooks/useBrewCalculator";

import {
  GlassCard
} from "../../components/ui/GlassCard";

import {
  ValueDisplay
} from "../../components/ui/ValueDisplay";

import {
  PremiumSlider
} from "../../components/inputs/PremiumSlider";

import {
  NumberInput
} from "../../components/inputs/NumberInput";

import {
  BrewCard
} from "./components/BrewCard";


export function BrewCalculator() {

  const {
    dose,
    water,
    coffee,
    ratio,
    activeField,

    setDose,
    setWater,
    setCoffee

  } = useBrewCalculator();

  return (
    <GlassCard
      className="
max-w-5xl
mx-auto
"
    >
      <h2 className="
text-3xl
font-semibold
mb-10
">
        Brew Calculator
      </h2>

      <div className="
grid
grid-cols-2
gap-6
">

        <BrewCard
          title="Dose"
          active={activeField === "dose"}
        >
          <div className="flex flex-col gap-4">
  <NumberInput
    value={dose}
    unit="g/L"
    step={1}
    onChange={setDose}
  />

  <PremiumSlider
    value={dose}
    min={40}
    max={100}
    step={1}
    onChange={setDose}
  />
</div>
        </BrewCard>

        <BrewCard title="Brew Ratio">
          <ValueDisplay
            value={`1:${ratio}`}
            unit=""
          />
        </BrewCard>

        <BrewCard
          title="Water"
          active={activeField === "water"}
        >
          <NumberInput
            label="Water"
            value={water}
            unit="ml"
            step={5}
            onChange={setWater}
          />

          <PremiumSlider
            value={water}
            min={100}
            max={1000}
            step={5}
            onChange={setWater}
          />
        </BrewCard>

        <BrewCard
          title="Coffee"
          active={activeField === "coffee"}
        >
          <NumberInput
            label="Coffee"
            value={coffee}
            unit="g"
            step={0.1}
            onChange={setCoffee}
          />

          <PremiumSlider
            value={coffee}
            min={5}
            max={60}
            step={0.1}
            onChange={setCoffee}
          />
        </BrewCard>

      </div>
    </GlassCard>
  );
}