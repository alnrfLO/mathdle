import { describe, expect, it } from "vitest";
import { ELEMENTS, findElement, molarMass } from "../../src/lab/elements";
import { checkBalance, parseFormula, pickChemEquation } from "../../src/science/chemistry";
import { checkEquation, compareGuess } from "../../src/game/engine";
import { generateEquation } from "../../src/game/generator";
import { todayKey, todaySeed, withSeed } from "../../src/game/seededRandom";

describe("periodic table", () => {
  it("when looking up an element, it accepts a symbol, a French name or an atomic number", () => {
    expect(findElement("Fe")?.z).toBe(26);
    expect(findElement("fer")?.sym).toBe("Fe");
    expect(findElement("oxygene")?.sym).toBe("O");
    expect(findElement("26")?.nom).toBe("Fer");
    expect(findElement("zzz")).toBeUndefined();
  });

  it("when listing the elements, it has the first 54 in order with consistent rows and columns", () => {
    expect(ELEMENTS).toHaveLength(54);
    ELEMENTS.forEach((e, i) => {
      expect(e.z).toBe(i + 1);
      expect(e.group).toBeGreaterThanOrEqual(1);
      expect(e.group).toBeLessThanOrEqual(18);
    });
    expect(findElement("Ar")?.period).toBe(3);
    expect(findElement("K")?.group).toBe(1);
  });
});

describe("molar mass", () => {
  it("when given simple formulas, it sums the atomic masses", () => {
    expect(molarMass("H2O")).toBeCloseTo(18.015, 2);
    expect(molarMass("CO2")).toBeCloseTo(44.01, 1);
    expect(molarMass("NaCl")).toBeCloseTo(58.44, 1);
  });

  it("when the formula has brackets or water of crystallisation, it expands them", () => {
    expect(molarMass("Ca(OH)2")).toBeCloseTo(74.09, 1);
    expect(molarMass("Al2(SO4)3")).toBeCloseTo(342.15, 0);
    expect(molarMass("CuSO4·5H2O")).toBeCloseTo(249.69, 0);
  });

  it("when the formula contains an unknown element, it throws", () => {
    expect(() => molarMass("Xx2")).toThrow();
  });
});

describe("chemical equations", () => {
  it("when parsing a formula, it counts every atom", () => {
    expect(parseFormula("Ca(OH)2")).toEqual({ Ca: 1, O: 2, H: 2 });
  });

  it("when checking any equation of the bank with its own coefficients, it is balanced", () => {
    for (const level of ["facile", "moyen", "difficile"] as const) {
      for (let i = 0; i < 200; i++) {
        const eq = pickChemEquation(level);
        expect(checkBalance(eq, eq.coeffs).balanced, eq.reactants.join("+")).toBe(true);
      }
    }
  });

  it("when the coefficients are wrong or not simplified, it says so", () => {
    const eq = { reactants: ["H2", "O2"], products: ["H2O"], coeffs: [2, 1, 2] };
    expect(checkBalance(eq, [1, 1, 1]).balanced).toBe(false);
    expect(checkBalance(eq, [4, 2, 4])).toEqual({ balanced: true, simplified: false });
    expect(checkBalance(eq, [0, 1, 2]).reason).toBeDefined();
  });
});

describe("equation grid", () => {
  it("when an equation is generated, it is always true", () => {
    for (const level of ["facile", "moyen", "difficile"] as const) {
      for (let i = 0; i < 300; i++) {
        const eq = generateEquation(level);
        expect(checkEquation(eq).valid, eq).toBe(true);
      }
    }
  });

  it("when an equation is false or incomplete, it is rejected", () => {
    expect(checkEquation("1+1=3").valid).toBe(false);
    expect(checkEquation("1+1").valid).toBe(false);
  });

  it("when a guess is compared, duplicates are only marked present as many times as they appear", () => {
    expect(compareGuess("11+2=13".split(""), "12+1=13".split(""))).toEqual([
      "correct", "present", "correct", "present", "correct", "correct", "correct",
    ]);
    expect(compareGuess(["1", "1"], ["1", "2"])).toEqual(["correct", "absent"]);
  });
});

describe("daily puzzle seed", () => {
  it("when the same seed is used twice, it generates the same puzzle", () => {
    const a = withSeed(todaySeed(1), () => generateEquation("moyen"));
    const b = withSeed(todaySeed(1), () => generateEquation("moyen"));
    expect(a).toBe(b);
  });

  it("when asking for yesterday's key, it returns the previous date", () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(todayKey(-1)).toBe(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  });
});
