export interface ModeStats {
  played: number;
  won: number;
  streak: number;
  best: number;
}

const KEY = "mathdle_stats_v1";

export const MODE_LABELS: Record<string, string> = {
  "daily-math": "Énigme du jour · Maths",
  "daily-science": "Énigme du jour · Sciences",
  "daily-prog": "Énigme du jour · Programmation",
  suites: "Maths · Suites",
  pi: "Maths · Cible π",
  courbes: "Maths · Courbes",
  element: "Chimie · Élément mystère",
  masse: "Chimie · Masse molaire",
  redox: "Chimie · Oxydoréduction",
  unites: "Physique · Unités",
  an: "Physique · Applications numériques",
  chaine: "Physique · Conversions en chaîne",
  console: "Programmation · Console",
};

export function loadStats(): Record<string, ModeStats> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordResult(mode: string, won: boolean) {
  const all = loadStats();
  const s = all[mode] ?? { played: 0, won: 0, streak: 0, best: 0 };
  s.played += 1;
  if (won) {
    s.won += 1;
    s.streak += 1;
    s.best = Math.max(s.best, s.streak);
  } else {
    s.streak = 0;
  }
  all[mode] = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
  }
}

export function totals(all = loadStats()) {
  let played = 0;
  let won = 0;
  let best = 0;
  for (const s of Object.values(all)) {
    played += s.played;
    won += s.won;
    best = Math.max(best, s.best);
  }
  return { played, won, best, pct: played ? Math.round((won / played) * 100) : 0 };
}

export async function shareText(text: string): Promise<"shared" | "copied" | "failed" | "cancelled"> {
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return "shared";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}

export const SITE = "mathdlee.vercel.app";
