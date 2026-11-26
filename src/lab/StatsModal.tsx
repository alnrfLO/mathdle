import { useEffect, useState } from "react";
import type { GridRow } from "../hooks/useMathdle";
import { loadStats, totals, MODE_LABELS, shareText, SITE } from "./stats";
import { todayKey } from "../game/seededRandom";
import "./lab.css";

export function StatsModal({ onClose }: { onClose: () => void }) {
  const all = loadStats();
  const t = totals(all);
  const entries = Object.entries(all).sort((a, b) => b[1].played - a[1].played);
  return (
    <div className="legal-overlay" role="dialog" aria-modal="true" aria-label="Statistiques" onClick={onClose}>
      <div className="legal-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Statistiques</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center", marginBottom: 12 }}>
          {[
            [t.played, "parties"],
            [`${t.pct} %`, "réussite"],
            [t.best, "meilleure série"],
          ].map(([v, l]) => (
            <div key={l as string}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>{l}</div>
            </div>
          ))}
        </div>
        {entries.length === 0 ? (
          <p style={{ fontSize: "0.85rem" }}>Pas encore de partie enregistrée. Lance un mode et reviens ici</p>
        ) : (
          <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.7 }}>
                <th>Mode</th>
                <th>Joué</th>
                <th>%</th>
                <th>Série</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([id, s]) => (
                <tr key={id} style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                  <td style={{ padding: "4px 0" }}>{MODE_LABELS[id] ?? id.replace("daily-prog-", "Énigme du jour, code ")}</td>
                  <td>{s.played}</td>
                  <td>{Math.round((s.won / s.played) * 100)}</td>
                  <td>{s.streak}</td>
                  <td>{s.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ fontSize: "0.7rem", opacity: 0.7 }}>Les stats restent sur cet appareil (aucun compte, rien n'est envoyé).</p>
        <button type="button" className="science-btn science-btn--primary" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}

const SQUARE: Record<string, string> = { correct: "🟩", present: "🟧", absent: "⬛", empty: "⬛" };
const LAUNCH = Date.UTC(2026, 10, 1);
const BAR = 10;

export function puzzleNumber(day = todayKey()): number {
  const [y, m, d] = day.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - LAUNCH) / 86_400_000) + 1;
}

function rowLine(result: GridRow["result"]): string {
  if (result.length <= BAR) return result.map((c) => SQUARE[c] ?? "⬛").join("");
  const count = (st: string) => result.filter((c) => c === st).length;
  const ok = count("correct");
  const scale = (n: number) => Math.round((n / result.length) * BAR);
  const g = scale(ok);
  const o = Math.min(BAR - g, scale(count("present")));
  return "🟩".repeat(g) + "🟧".repeat(o) + "⬛".repeat(BAR - g - o) + ` ${ok}/${result.length}`;
}

export function gridToEmoji(rows: GridRow[]): string {
  return rows.map((r) => rowLine(r.result)).join("\n");
}

export function buildShareText({ title, won, rows, max, extra }: { title: string; won: boolean; rows?: GridRow[]; max: number; extra?: string }): string {
  const tries = rows ? rows.length : Number(extra);
  const score = won ? `${tries}/${max}` : `X/${max}`;
  return [`Mathdle #${puzzleNumber()} ${title} ${score}`, rows ? gridToEmoji(rows) : "", SITE].filter(Boolean).join("\n");
}

const shareKey = (title: string) => `mathdle_share_${title}`;

export function ShareButton(props: { title: string; won: boolean; rows?: GridRow[]; max: number; extra?: string }) {
  const text = buildShareText(props);
  useEffect(() => {
    try {
      localStorage.setItem(shareKey(props.title), JSON.stringify({ day: todayKey(), text }));
    } catch {
    }
  }, [props.title, text]);
  return <ShareCard text={text} />;
}

export function StoredShareButton({ title }: { title: string }) {
  try {
    const raw = localStorage.getItem(shareKey(title));
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.day === todayKey()) return <ShareCard text={saved.text} />;
  } catch {
  }
  return null;
}

function ShareCard({ text }: { text: string }) {
  const [state, setState] = useState("");
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  return (
    <div className="share">
      <pre className="share__preview" aria-label="Aperçu du message partagé">
        {text}
      </pre>
      <button
        type="button"
        className="science-btn science-btn--primary share-btn"
        onClick={async () => {
          const r = await shareText(text);
          if (r === "cancelled") return;
          setState(r === "copied" ? "Copié dans le presse-papiers" : r === "shared" ? "Envoyé" : "Copie impossible");
          setTimeout(() => setState(""), 2000);
        }}
      >
        {state || (canShare ? "Partager" : "Copier le résultat")}
      </button>
    </div>
  );
}
