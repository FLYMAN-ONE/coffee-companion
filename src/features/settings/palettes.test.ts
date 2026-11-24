import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "../../data/storageKeys";
import { applyStoredPalette } from "./palettes";

describe("applyStoredPalette", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
    delete document.documentElement.dataset.palette;
  });

  it("uses the default palette on a fresh install", () => {
    applyStoredPalette();
    expect(document.documentElement.dataset.palette).toBe("ardesia");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#0e1116");
  });

  it("applies the saved palette", () => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ sound: true, palette: "abisso" }));
    applyStoredPalette();
    expect(document.documentElement.dataset.palette).toBe("abisso");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#090c0d");
  });

  it("falls back to the default on corrupted settings", () => {
    localStorage.setItem(STORAGE_KEYS.settings, "{broken");
    applyStoredPalette();
    expect(document.documentElement.dataset.palette).toBe("ardesia");
  });
});
