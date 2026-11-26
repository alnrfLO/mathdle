import type { ReactNode } from "react";
import type { MessageState } from "../hooks/useMathdle";
import "./lab.css";

// Squelette commun : titre, message, boutons Passer / Valider / Suivant.
export function LabShell({
  eyebrow,
  children,
  message,
  done,
  onSkip,
  onCheck,
  onNext,
  checkLabel = "Valider",
}: {
  eyebrow: string;
  children: ReactNode;
  message: MessageState;
  done: boolean;
  onSkip: () => void;
  onCheck: () => void;
  onNext: () => void;
  checkLabel?: string;
}) {
  return (
    <div className="lab">
      <p className="lab__eyebrow">{eyebrow}</p>
      {children}
      <div className={"message" + (message.variant ? ` message--${message.variant}` : "")}>{message.text}</div>
      <div className="science__actions">
        {done ? (
          <button type="button" className="science-btn science-btn--primary" onClick={onNext}>
            Suivant →
          </button>
        ) : (
          <>
            <button type="button" className="science-btn" onClick={onSkip}>
              Passer
            </button>
            <button type="button" className="science-btn science-btn--primary" onClick={onCheck}>
              {checkLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const NO_MSG: MessageState = { text: "", variant: "" };
export const err = (text: string): MessageState => ({ text, variant: "error" });
export const ok = (text: string): MessageState => ({ text, variant: "success" });
export const info = (text: string): MessageState => ({ text, variant: "" });

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function randInt(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
