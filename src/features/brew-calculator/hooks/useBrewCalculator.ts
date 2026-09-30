import { useCallback, useState } from "react";
import type { MethodId } from "../../../types";
import { getMethod } from "../../../data/methods";
import { useLocalStorage } from "../../../lib/storage";
import type { ActiveField, BrewCalculatorReturn, BrewValues } from "../types";
import {
  calculateCoffee,
  calculateRatio,
  calculateWater,
} from "../logic/calculations";

const initialValues: BrewValues = {
  dose: 60,
  water: 250,
  coffee: 15,
  method: "v60",
};

export function useBrewCalculator(): BrewCalculatorReturn {
  const [values, setValues] = useLocalStorage<BrewValues>("cc:calc:v1", initialValues);
  const [activeField, setActiveField] = useState<ActiveField>(null);

  const setDose = useCallback(
    (dose: number) => {
      setValues((p) => ({ ...p, dose, coffee: calculateCoffee(p.water, dose) }));
      setActiveField("dose");
    },
    [setValues]
  );

  const setWater = useCallback(
    (water: number) => {
      setValues((p) => ({ ...p, water, coffee: calculateCoffee(water, p.dose) }));
      setActiveField("water");
    },
    [setValues]
  );

  const setCoffee = useCallback(
    (coffee: number) => {
      setValues((p) => ({ ...p, coffee, water: calculateWater(coffee, p.dose) }));
      setActiveField("coffee");
    },
    [setValues]
  );

  const setMethod = useCallback(
    (id: MethodId) => {
      const { dose } = getMethod(id);
      // Keep the coffee weight, adapt water to the method's usual dose.
      setValues((p) => {
        const nextDose = id === "other" ? p.dose : dose;
        return { ...p, method: id, dose: nextDose, water: calculateWater(p.coffee, nextDose) };
      });
      setActiveField("dose");
    },
    [setValues]
  );

  const setAll = useCallback(
    (dose: number, water: number, method?: MethodId) => {
      setValues((p) => ({
        method: method ?? p.method,
        dose,
        water,
        coffee: calculateCoffee(water, dose),
      }));
      setActiveField(null);
    },
    [setValues]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setActiveField(null);
  }, [setValues]);

  return {
    ...values,
    activeField,
    ratio: calculateRatio(values.water, values.coffee),
    setDose,
    setWater,
    setCoffee,
    setMethod,
    setAll,
    reset,
  };
}
