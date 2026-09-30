import type { Grind, MethodId } from "../types";
import type { IconName } from "../components/ui/Icon";

export interface Method {
  id: MethodId;
  label: string;
  dose: number; // default g/L
  tempC: number;
  grind: Grind;
}

export const methods: Method[] = [
  { id: "v60", label: "V60", dose: 60, tempC: 95, grind: "Medium" },
  { id: "chemex", label: "Chemex", dose: 60, tempC: 95, grind: "Medium-coarse" },
  { id: "aeropress", label: "AeroPress", dose: 75, tempC: 94, grind: "Medium-fine" },
  { id: "french-press", label: "French Press", dose: 75, tempC: 95, grind: "Medium" },
  { id: "moka", label: "Moka", dose: 200, tempC: 95, grind: "Medium-fine" },
  { id: "espresso", label: "Espresso", dose: 500, tempC: 93, grind: "Fine" },
  { id: "cold-brew", label: "Cold Brew", dose: 125, tempC: 4, grind: "Coarse" },
  { id: "other", label: "Other", dose: 60, tempC: 93, grind: "Medium" },
];

export const grinds: Grind[] = [
  "Extra fine",
  "Fine",
  "Medium-fine",
  "Medium",
  "Medium-coarse",
  "Coarse",
];

export const tastes = [
  "Sweet",
  "Fruity",
  "Floral",
  "Chocolate",
  "Nutty",
  "Balanced",
  "Sour",
  "Bitter",
  "Astringent",
  "Weak",
  "Strong",
];

export const getMethod = (id: MethodId): Method =>
  methods.find((m) => m.id === id) ?? methods[methods.length - 1];

export const methodIcon: IconName = "coffee";
