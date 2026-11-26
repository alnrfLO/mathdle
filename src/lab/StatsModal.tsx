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
          <p style={{ fontSize: "0.85rem" }}>Pas encore de partie enregistrée. Lance un mode et reviens ici !</p>
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
                  <td style={{ padding: "4px 0" }}>{MODE_LABELS[id] ?? id.replace("daily-prog-", "Énigme du jour · Code ")}</td>
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

const EMOJI: Record<string, string> = { correct: "🟩", present: "🟨", absent: "⬛", empty: "⬜" };

export function gridToEmoji(rows: GridRow[]): string {
  return rows.map((r) => r.result.map((c) => EMOJI[c] ?? "⬜").join("")).join("\n");
}

const shareKey = (title: string) => `mathdle_share_${title}`;

export function ShareButton({ title, won, rows, max, extra }: { title: string; won: boolean; rows?: GridRow[]; max: number; extra?: string }) {
  const score = won ? `${rows ? rows.length : extra}/${max}` : `X/${max}`;
  const text = `Mathdle ${title} ${todayKey()} ${score}\n${rows ? gridToEmoji(rows) : ""}\n${SITE}`.replace(/\n\n/g, "\n");
  useEffect(() => {
    try {
      localStorage.setItem(shareKey(title), JSON.stringify({ day: todayKey(), text }));
    } catch {
    }
  }, [title, text]);
  return <ShareTextButton text={text} />;
}

export function StoredShareButton({ title }: { title: string }) {
  try {
    const raw = localStorage.getItem(shareKey(title));
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.day === todayKey()) return <ShareTextButton text={saved.text} />;
  } catch {
  }
  return null;
}

function ShareTextButton({ text }: { text: string }) {
  const [state, setState] = useState("");
  return (
    <button
      type="button"
      className="science-btn science-btn--primary share-btn"
      onClick={async () => {
        const r = await shareText(text);
        setState(r === "copied" ? "Copié !" : r === "shared" ? "Partagé !" : "Impossible de copier");
        setTimeout(() => setState(""), 2000);
      }}
    >
      {state || "Partager mon résultat"}
    </button>
  );
}
