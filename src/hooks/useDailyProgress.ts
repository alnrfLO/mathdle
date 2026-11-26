import { useCallback, useEffect, useState } from "react";
import { todayKey } from "../game/seededRandom";
import { recordResult } from "../lab/stats";

interface DailyRecord {
  streak: number;
  lastDate: string;
  lastWon: boolean;
}

const DEFAULT_RECORD: DailyRecord = { streak: 0, lastDate: "", lastWon: false };

// Suivi très simple de la série de jours réussis, persisté en localStorage
// (c'est un vrai site déployé, pas un artifact — le stockage navigateur
// est donc tout à fait approprié ici).
export function useDailyProgress(storageKey: string) {
  const key = `mathdle_daily_${storageKey}`;
  const [record, setRecord] = useState<DailyRecord>(DEFAULT_RECORD);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setRecord(JSON.parse(raw));
    } catch {
      // localStorage indisponible (navigation privée, etc.) : on continue
      // simplement sans persistance plutôt que de planter.
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const today = todayKey();
  const alreadyPlayedToday = record.lastDate === today;

  const complete = useCallback(
    (won: boolean) => {
      recordResult(`daily-${storageKey}`, won);
      setRecord((prev) => {
        const next: DailyRecord = {
          // La série ne continue que si la veille a aussi été réussie
          streak: won ? (prev.lastDate === todayKey(-1) && prev.lastWon ? prev.streak + 1 : 1) : 0,
          lastDate: today,
          lastWon: won,
        };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // idem : tant pis si on ne peut pas persister
        }
        return next;
      });
    },
    [key, today, storageKey]
  );

  // Une série qui date d'avant-hier est cassée : on affiche 0
  const alive = record.lastWon && (record.lastDate === today || record.lastDate === todayKey(-1));
  return { record: { ...record, streak: alive ? record.streak : 0 }, alreadyPlayedToday, complete, loaded };
}
