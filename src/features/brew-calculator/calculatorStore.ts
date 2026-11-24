import { createStore } from "../../lib/createStore";
import type { BrewCalculatorReturn } from "./types";

export const [CalculatorContext, useCalculator] = createStore<BrewCalculatorReturn>("Calculator");
