export type Subject = "math" | "science" | "prog";

export type Difficulty = "facile" | "moyen" | "difficile" | "impossible";

export type GameMode = "classique" | "cible";

export type CellState = "correct" | "present" | "absent" | "empty";

export type TokenType = "num" | "+" | "-" | "*" | "/" | "(" | ")";

export interface Token {
  type: TokenType;
  value?: number;
}

export interface EquationCheckResult {
  valid: boolean;
  value?: number;
  reason?: string;
}

export interface ExpressionCheckResult {
  valid: boolean;
  value?: number;
  reason?: string;
}

export interface LevelConfig {
  maxAttempts: number;
  keys: string[];
}
