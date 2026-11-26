import { useCallback, useEffect, useState } from "react";
import { compareGuess } from "../game/engine";
import { pickProgExercise } from "../game/programming";
import type { ProgExercise, ProgLang, ProgLevel } from "../game/programming";
import type { CellState } from "../game/types";
import type { GridRow, MessageState } from "./useMathdle";

const EMPTY_MESSAGE: MessageState = { text: "", variant: "" };

export function useProgPageBlanche(lang: ProgLang, level: ProgLevel, onCorrect: () => void) {
  const [exercise, setExercise] = useState<ProgExercise>(() => pickProgExercise(lang, level));
  const [rows, setRows] = useState<GridRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [rowIndex, setRowIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState<MessageState>(EMPTY_MESSAGE);

  const target = exercise.tokens;
  const maxAttempts = 8;

  const newExercise = useCallback((l: ProgLang, lvl: ProgLevel) => {
    setExercise(pickProgExercise(l, lvl));
    setRows([]);
    setCurrentGuess([]);
    setRowIndex(0);
    setGameOver(false);
    setWon(false);
    setMessage(EMPTY_MESSAGE);
  }, []);

  useEffect(() => {
    newExercise(lang, level);
  }, [lang, level]);

  const typeChar = useCallback(
    (ch: string) => {
      if (gameOver) return;
      setCurrentGuess((g) => (g.length < target.length ? [...g, ch] : g));
    },
    [gameOver, target.length]
  );

  const backspace = useCallback(() => {
    if (gameOver) return;
    setCurrentGuess((g) => g.slice(0, -1));
  }, [gameOver]);

  const submitGuess = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length !== target.length) {
      setMessage({ text: `Ta réponse doit faire ${target.length} tokens`, variant: "error" });
      return;
    }
    setMessage(EMPTY_MESSAGE);
    const result: CellState[] = compareGuess(currentGuess, target);
    setRows((r) => [...r, { guess: currentGuess, result }]);
    const hasWon = result.every((r) => r === "correct");
    const nextRowIndex = rowIndex + 1;
    setRowIndex(nextRowIndex);
    setCurrentGuess([]);

    if (hasWon) {
      setGameOver(true);
      setWon(true);
      onCorrect();
    } else if (nextRowIndex >= maxAttempts) {
      setGameOver(true);
      setWon(false);
    }
  }, [gameOver, currentGuess, target, rowIndex, onCorrect]);

  const giveUp = useCallback(() => {
    if (gameOver) return;
    setCurrentGuess([]);
    setMessage(EMPTY_MESSAGE);
    setGameOver(true);
    setWon(false);
  }, [gameOver]);

  const skip = useCallback(() => newExercise(lang, level), [lang, level, newExercise]);

  return {
    exercise,
    target,
    rows,
    currentGuess,
    rowIndex,
    gameOver,
    won,
    message,
    maxAttempts,
    keys: exercise.keys,
    extraKeys: exercise.extraKeys,
    typeChar,
    backspace,
    submitGuess,
    skip,
    giveUp,
  };
}
