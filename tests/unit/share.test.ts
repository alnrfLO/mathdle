import { describe, expect, it } from "vitest";
import { buildShareText, gridToEmoji, puzzleNumber } from "../../src/lab/StatsModal";
import type { CellState } from "../../src/game/types";

const row = (result: CellState[]) => ({ guess: result.map(() => "x"), result });

describe("share text", () => {
  it("when a short row is shared, it keeps one square per cell with orange for misplaced", () => {
    expect(gridToEmoji([row(["correct", "present", "absent"])])).toBe("🟩🟧⬛");
  });

  it("when a code row is longer than ten tokens, it becomes a ten square bar with the score", () => {
    const long: CellState[] = [...Array(15).fill("correct"), ...Array(15).fill("absent")];
    const line = gridToEmoji([row(long)]);
    expect([...line.split(" ")[0]]).toHaveLength(10);
    expect(line).toBe("🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛ 15/30");
  });

  it("when the puzzle is shared, the first line has the puzzle number, the subject and the score", () => {
    const text = buildShareText({ title: "Maths", won: true, rows: [row(["correct"])], max: 6 });
    const [head, grid, site] = text.split("\n");
    expect(head).toMatch(/^Mathdle #\d+ · Maths 1\/6$/);
    expect(grid).toBe("🟩");
    expect(site).toBe("mathdlee.vercel.app");
  });

  it("when the day changes, the puzzle number goes up by one", () => {
    expect(puzzleNumber("2026-11-01")).toBe(1);
    expect(puzzleNumber("2026-11-26")).toBe(26);
    expect(puzzleNumber("2027-03-30")).toBe(150);
  });
});
