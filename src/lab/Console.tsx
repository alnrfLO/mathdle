import { useState } from "react";
import type { ProgLevel } from "../game/programming";
import { NO_MSG, err, ok, info, pick } from "./LabShell";
import { EXERCISES, STARTER, bannedUsed, bannedFor, type Exercise } from "./exercises";
import { runCode, deepEqual, show, TIMEOUT_MS, type RunResult } from "./runner";
import { recordResult } from "./stats";
import "./lab.css";

type Lang = "python" | "javascript";

interface Line {
  args: unknown[];
  expected: unknown;
  got?: { ok: boolean; v?: unknown; e?: string };
  hidden: boolean;
}

const pyShow = (v: unknown, lang: Lang) => {
  const s = show(v);
  return lang === "python" ? s.replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None") : s;
};

export function Console({ lang, level }: { lang: Lang; level: ProgLevel }) {
  const pool = EXERCISES.filter((e) => e.level === level);
  const [ex, setEx] = useState<Exercise>(() => pick(pool));
  const [key, setKey] = useState(`${lang}-${level}`);
  const [code, setCode] = useState(() => STARTER[lang](ex));
  const [lines, setLines] = useState<Line[] | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [msg, setMsg] = useState(NO_MSG);
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(false);
  const [counted, setCounted] = useState(false);

  const load = (e: Exercise) => {
    setEx(e);
    setCode(STARTER[lang](e));
    setLines(null);
    setLogs([]);
    setMsg(NO_MSG);
    setSolved(false);
    setCounted(false);
  };
  if (key !== `${lang}-${level}`) {
    setKey(`${lang}-${level}`);
    const e = pick(pool);
    setEx(e);
    setCode(STARTER[lang](e));
    setLines(null);
    setLogs([]);
    setMsg(NO_MSG);
    setSolved(false);
    setCounted(false);
  }

  const name = lang === "python" ? ex.py : ex.js;

  const run = async () => {
    if (busy) return;
    const banned = bannedUsed(ex, code, lang);
    if (banned) return setMsg(err(`Interdit dans cet exercice : ${banned.startsWith("[") ? banned : banned + "()"}. Écris l'algorithme toi-même.`));
    const visible = ex.visible;
    const hidden = ex.hidden();
    const all = [...visible, ...hidden];
    setBusy(true);
    setMsg(info("…"));
    const res: RunResult = await runCode({ lang, code, name, nparams: ex.params.length, tests: all }, (s) => setMsg(info(s)));
    setBusy(false);
    setLogs(res.logs ?? []);
    if (res.fatal || !res.results) {
      setLines(null);
      setMsg(err(res.fatal ?? "Erreur inconnue"));
      return;
    }
    const ls: Line[] = all.map((args, i) => ({
      args,
      expected: (ex.ref as (...a: unknown[]) => unknown)(...structuredClone(args)),
      got: res.results![i],
      hidden: i >= visible.length,
    }));
    setLines(ls);
    const passed = ls.filter((l) => l.got?.ok && deepEqual(l.got.v, l.expected)).length;
    if (passed === ls.length) {
      setMsg(ok(`${passed}/${ls.length} tests réussis, dont ${hidden.length} cachés tirés au hasard`));
      setSolved(true);
      if (!counted) recordResult("console", true);
      setCounted(true);
    } else {
      const visOk = ls.filter((l) => !l.hidden && l.got?.ok && deepEqual(l.got.v, l.expected)).length;
      setMsg(err(visOk === visible.length ? `Les tests visibles passent mais ${ls.length - passed} test(s) caché(s) échouent : résultat écrit en dur ou cas oublié ?` : `${passed}/${ls.length} tests réussis`));
    }
  };

  const giveUp = () => {
    if (!counted && !solved) recordResult("console", false);
    load(pick(pool.filter((e) => e.id !== ex.id).length ? pool.filter((e) => e.id !== ex.id) : pool));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === "Tab") {
      e.preventDefault();
      const t = e.currentTarget;
      const s = t.selectionStart;
      const indent = lang === "python" ? "    " : "  ";
      const next = code.slice(0, s) + indent + code.slice(t.selectionEnd);
      setCode(next);
      requestAnimationFrame(() => (t.selectionStart = t.selectionEnd = s + indent.length));
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
  };

  return (
    <div className="lab">
      <p className="lab__eyebrow">
        CONSOLE {lang === "python" ? "PYTHON" : "JAVASCRIPT"}, {ex.visible.length} TESTS VISIBLES ET DES TESTS CACHÉS
      </p>
      <div className="lab__card" style={{ textAlign: "left" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--ink)" }}>
          <b>
            {name}({ex.params.join(", ")})
          </b>
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--ink)", marginTop: 4 }}>{ex.enonce}</div>
        {bannedFor(ex, lang).length > 0 && (
          <div className="lab__small" style={{ marginTop: 4 }}>
            Interdit : {bannedFor(ex, lang).join(", ")}
          </div>
        )}
      </div>
      <textarea
        className="code-editor"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Éditeur de code"
      />
      <div className={"message" + (msg.variant ? ` message--${msg.variant}` : "")}>{msg.text}</div>
      {lines && (
        <ul className="lab__history">
          {lines.map((l, i) => {
            const pass = !!l.got?.ok && deepEqual(l.got.v, l.expected);
            return (
              <li key={i}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.hidden ? "test caché" : `${name}(${l.args.map((a) => pyShow(a, lang)).join(", ")})`}
                </span>
                <span className={pass ? "lab__ok" : "lab__ko"}>
                  {pass
                    ? "OK"
                    : l.hidden
                      ? "raté"
                      : l.got?.ok
                        ? `${pyShow(l.got.v, lang)} au lieu de ${pyShow(l.expected, lang)}`
                        : `${l.got?.e ?? "erreur"}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {logs.length > 0 && (
        <pre className="code-console" aria-label="Sortie console">
          {logs.join("\n")}
        </pre>
      )}
      <div className="science__actions">
        {solved ? (
          <button type="button" className="science-btn science-btn--primary" onClick={() => load(pick(pool.filter((e) => e.id !== ex.id)))}>
            Exercice suivant →
          </button>
        ) : (
          <>
            <button type="button" className="science-btn" onClick={giveUp}>
              Passer
            </button>
            <button type="button" className="science-btn science-btn--primary" onClick={run} disabled={busy}>
              {busy ? "…" : "Exécuter"}
            </button>
          </>
        )}
      </div>
      <p className="lab__small" style={{ textAlign: "center", margin: 0 }}>
        Les tests appellent ta fonction directement : {lang === "python" ? "print" : "console.log"} ne sert qu'à déboguer. Délai max {TIMEOUT_MS / 1000} s. Ctrl+Entrée pour exécuter.
      </p>
    </div>
  );
}
