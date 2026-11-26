import { beforeEach, describe, expect, it } from "vitest";
import { loadStats, recordResult, totals } from "../../src/lab/stats";

beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe("stats", () => {
  it("when a player wins three times then loses, the streak resets but the record stays", () => {
    recordResult("suites", true);
    recordResult("suites", true);
    recordResult("suites", true);
    recordResult("suites", false);
    expect(loadStats().suites).toEqual({ played: 4, won: 3, streak: 0, best: 3 });
  });

  it("when several modes are played, the totals add them up", () => {
    recordResult("pi", true);
    recordResult("courbes", false);
    expect(totals()).toEqual({ played: 2, won: 1, best: 1, pct: 50 });
  });

  it("when storage is broken, it does not crash", () => {
    globalThis.localStorage.getItem = () => {
      throw new Error("blocked");
    };
    expect(loadStats()).toEqual({});
  });
});
