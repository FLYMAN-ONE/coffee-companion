import { describe, expect, it } from "vitest";
import { splitNotes } from "./notes";

describe("splitNotes", () => {
  it("splits sentences and pulls out the source", () => {
    expect(
      splitNotes("60 g/L (30 g to 500 g). Rinse the paper. Bloom 45 s. Sources: The World Atlas of Coffee.", [
        "Source:",
        "Sources:",
      ])
    ).toEqual({
      points: ["60 g/L (30 g to 500 g).", "Rinse the paper.", "Bloom 45 s."],
      source: "The World Atlas of Coffee",
    });
  });

  it("keeps decimals and ratios inside a sentence", () => {
    expect(splitNotes("Dilute 1:1 to serve. Use 2.5 times the coffee.", []).points).toEqual([
      "Dilute 1:1 to serve.",
      "Use 2.5 times the coffee.",
    ]);
  });

  it("uses one point per line when there are line breaks", () => {
    expect(splitNotes("- Grind fine\n- Pour slowly. Then swirl.", []).points).toEqual([
      "Grind fine",
      "Pour slowly. Then swirl.",
    ]);
  });

  it("handles empty notes", () => {
    expect(splitNotes("  ", [])).toEqual({ points: [], source: null });
  });
});
