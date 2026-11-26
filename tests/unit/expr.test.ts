import { describe, expect, it } from "vitest";
import { closeEnough, compile, ExprError, fmt, parseNumber } from "../../src/lab/expr";

describe("expression evaluator", () => {
  it("when given basic arithmetic, it follows operator precedence", () => {
    expect(compile("2+3*4").fn(0)).toBe(14);
    expect(compile("(2+3)*4").fn(0)).toBe(20);
    expect(compile("2^3^2").fn(0)).toBe(512);
    expect(compile("-2^2").fn(0)).toBe(-4);
  });

  it("when terms are written side by side, it multiplies them implicitly", () => {
    expect(compile("2x").fn(3)).toBe(6);
    expect(compile("3π").fn(0)).toBeCloseTo(3 * Math.PI);
    expect(compile("2(x+1)").fn(4)).toBe(10);
    expect(compile("x(x-1)").fn(5)).toBe(20);
    expect(compile("xsin(x)").fn(1)).toBeCloseTo(Math.sin(1));
  });

  it("when using functions and constants, it evaluates them", () => {
    expect(compile("sqrt(16)+abs(-2)").fn(0)).toBe(6);
    expect(compile("ln(e)").fn(0)).toBeCloseTo(1);
    expect(compile("√(9)").fn(0)).toBe(3);
    expect(compile("pi/2").fn(0)).toBeCloseTo(Math.PI / 2);
    expect(compile("x²").fn(3)).toBe(9);
  });

  it("when the input is broken, it throws a readable error instead of evaluating", () => {
    expect(() => compile("")).toThrow(ExprError);
    expect(() => compile("sin(x")).toThrow(/parenthèse/);
    expect(() => compile("2+")).toThrow(ExprError);
    expect(() => compile("alert(1)")).toThrow(/symbole inconnu/);
    expect(() => compile("x;")).toThrow(/caractère interdit/);
  });

  it("when an expression uses x, it reports it and counts its operations", () => {
    expect(compile("3π/4").usesX).toBe(false);
    expect(compile("x+1").usesX).toBe(true);
    expect(compile("π/4+π/4").ops).toBe(3);
  });
});

describe("number input", () => {
  it("when a player types a French or scientific number, it is understood", () => {
    expect(parseNumber("1,5")).toBe(1.5);
    expect(parseNumber(" -2 ")).toBe(-2);
    expect(parseNumber("2,5e-4")).toBe(0.00025);
    expect(parseNumber("1,2×10^4")).toBe(12000);
    expect(parseNumber("3x10^-2")).toBe(0.03);
  });

  it("when the text is not a number, it returns null", () => {
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("1,2,3")).toBeNull();
    expect(parseNumber("")).toBeNull();
  });

  it("when comparing and formatting numbers, it tolerates rounding and uses a comma", () => {
    expect(closeEnough(0.1 + 0.2, 0.3)).toBe(true);
    expect(closeEnough(1, 1.01)).toBe(false);
    expect(fmt(3.14159, 3)).toBe("3,14");
  });
});
