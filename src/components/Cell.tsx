import type { CellState } from "../game/types";

interface CellProps {
  value?: string;
  state?: CellState | "filled" | "empty";
  isToken?: boolean;
  hint?: string;
}

export function Cell({ value, state = "empty", isToken = false, hint }: CellProps) {
  const classes = ["cell", isToken && "cell--token", state !== "empty" && `cell--${state}`, hint !== undefined && "cell--hint"]
    .filter(Boolean)
    .join(" ");
  return <div className={classes}>{value ?? hint}</div>;
}
