import { describe, expect, it } from "vitest";
import { defaultRecipes } from "../data/defaultRecipes";
import { builtinIt } from "./it";
import { localizeRecipe } from "./localizeRecipe";

const v60 = defaultRecipes.find((r) => r.id === "builtin-v60")!;

describe("localizeRecipe", () => {
  it("leaves English untouched", () => {
    expect(localizeRecipe(v60, "en")).toBe(v60);
  });

  it("translates unedited seeded fields", () => {
    const it_ = localizeRecipe(v60, "it");
    expect(it_.name).toBe(builtinIt.recipes["builtin-v60"].name);
    expect(it_.steps[0].label).toBe(builtinIt.steps[v60.steps[0].id]);
  });

  it("keeps text the user edited", () => {
    const edited = { ...v60, notes: "my notes", steps: [{ ...v60.steps[0], label: "Mine" }] };
    const it_ = localizeRecipe(edited, "it");
    expect(it_.notes).toBe("my notes");
    expect(it_.steps[0].label).toBe("Mine");
  });

  it("does not touch user recipes", () => {
    const own = { ...v60, id: "user-1" };
    expect(localizeRecipe(own, "it")).toBe(own);
  });

  it("has an Italian translation for every seeded recipe and step", () => {
    for (const r of defaultRecipes) {
      expect(builtinIt.recipes[r.id], r.id).toBeDefined();
      for (const s of r.steps) expect(builtinIt.steps[s.id], s.id).toBeDefined();
    }
  });
});
