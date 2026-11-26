import { useCallback, useEffect, useState } from "react";
import { todayKey } from "../game/seededRandom";
import { recordResult } from "../lab/stats";

interface DailyRecord {
  streak: number;
  lastDate: string;
  lastWon: boolean;
}

const DEFAULT_RECORD: DailyRecord = { streak: 0, lastDate: "", lastWon: false };

export function useDailyProgress(storageKey: string) {
  const key = `mathdle_daily_${storageKey}`;
  const [record, setRecord] = useState<DailyRecord>(DEFAULT_RECORD);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setRecord(JSON.parse(raw));
    } catch {
    }
    setLoaded(true);
  }, [key]);

  const today = todayKey();
  const alreadyPlayedToday = record.lastDate === today;

  const complete = useCallback(
    (won: boolean) => {
      recordResult(`daily-${storageKey}`, won);
      setRecord((prev) => {
        const next: DailyRecord = {
          streak: won ? (prev.lastDate === todayKey(-1) && prev.lastWon ? prev.streak + 1 : 1) : 0,
          lastDate: today,
          lastWon: won,
        };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
        }
        return next;
      });
    },
    [key, today, storageKey]
  );

  const alive = record.lastWon && (record.lastDate === today || record.lastDate === todayKey(-1));
  return { record: { ...record, streak: alive ? record.streak : 0 }, alreadyPlayedToday, complete, loaded };
}
