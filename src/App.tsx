import { useEffect, useState } from "react";
import { SoftkeyTabs } from "./components/SoftkeyTabs";
import { ModeSwitch } from "./components/ModeSwitch";
import { InfoPanel } from "./components/InfoPanel";
import { ScienceInfoPanel } from "./components/ScienceInfoPanel";
import { Grid } from "./components/Grid";
import { Banner } from "./components/Banner";
import { CibleLibre } from "./components/CibleLibre";
import { ScienceScreen } from "./components/ScienceScreen";
import { ChemistryScreen } from "./components/ChemistryScreen";
import { PhysicsScreen } from "./components/PhysicsScreen";
import { SubjectMenu } from "./components/SubjectMenu";
import { LangMenu } from "./components/LangMenu";
import { PlayModeMenu } from "./components/PlayModeMenu";
import { DailyScreen } from "./components/DailyScreen";
import { ScienceDailyScreen } from "./components/ScienceDailyScreen";
import { ProgScreen } from "./components/ProgScreen";
import { ProgTrousScreen } from "./components/ProgTrousScreen";
import { ProgDailyScreen } from "./components/ProgDailyScreen";
import { ProgInfoPanel } from "./components/ProgInfoPanel";
import { LegalNotice } from "./components/LegalNotice";
import { Keyboard } from "./components/Keyboard";
import { useMathdle } from "./hooks/useMathdle";
import { useScience } from "./hooks/useScience";
import { useChemistry } from "./hooks/useChemistry";
import { usePhysicsFormulas } from "./hooks/usePhysicsFormulas";
import { useMathDaily } from "./hooks/useMathDaily";
import { useScienceDaily } from "./hooks/useScienceDaily";
import { useProgPageBlanche } from "./hooks/useProgPageBlanche";
import { useProgATrous } from "./hooks/useProgATrous";
import { useProgDaily } from "./hooks/useProgDaily";
import { LEVELS } from "./game/config";
import { PROG_LANG_LABELS } from "./game/programming";
import type { ProgLang, ProgLevel } from "./game/programming";
import type { Subject } from "./game/types";
import { Suites } from "./lab/Suites";
import { CiblePi } from "./lab/CiblePi";
import { Courbes } from "./lab/Courbes";
import { ElementMystere, MasseMolaire, Redox } from "./lab/Chimie";
import { Unites, Applications, Chaine } from "./lab/Physique";
import { Console } from "./lab/Console";
import { StatsModal } from "./lab/StatsModal";
import "./lab/lab.css";
import "./App.css";

type ScienceGame = "conversions" | "chimie" | "formules";
type MathExtra = "grille" | "suites" | "pi" | "courbes";
type SciSub = "equilibrage" | "element" | "masse" | "redox" | "formules" | "conversions" | "unites" | "an" | "chaine";
type LabLevel = "facile" | "moyen" | "difficile";

const MATH_EXTRAS: { id: MathExtra; label: string }[] = [
  { id: "grille", label: "Grille" },
  { id: "suites", label: "Suites" },
  { id: "pi", label: "Cible π" },
  { id: "courbes", label: "Courbes" },
];
const CHIMIE_SUBS: { id: SciSub; label: string }[] = [
  { id: "equilibrage", label: "Équilibrage" },
  { id: "element", label: "Élément mystère" },
  { id: "masse", label: "Masse molaire" },
  { id: "redox", label: "Oxydoréduction" },
];
const PHYSIQUE_SUBS: { id: SciSub; label: string }[] = [
  { id: "formules", label: "Formules" },
  { id: "conversions", label: "Conversions" },
  { id: "unites", label: "Unités" },
  { id: "an", label: "Applications num." },
  { id: "chaine", label: "Conversions en chaîne" },
];
const LEGACY_SCI: Partial<Record<SciSub, ScienceGame>> = { equilibrage: "chimie", formules: "formules", conversions: "conversions" };
type ProgType = "blanche" | "trous";
type PlayMode = "menu" | "serie" | "daily";

const SCIENCE_LEVELS = [
  { id: "facile" as const, label: "Facile", f: "F1" },
  { id: "moyen" as const, label: "Moyen", f: "F2" },
  { id: "difficile" as const, label: "Difficile", f: "F3" },
];

function App() {
  const [subject, setSubjectState] = useState<Subject | "menu">("menu");
  const [playMode, setPlayMode] = useState<PlayMode>("menu");
  const [sciSub, setSciSub] = useState<SciSub>("equilibrage");
  const scienceGame: ScienceGame = LEGACY_SCI[sciSub] ?? "conversions";
  const sciIsLab = !LEGACY_SCI[sciSub];
  const sciFamily = CHIMIE_SUBS.some((c) => c.id === sciSub) ? "chimie" : "physique";
  const [labLevel, setLabLevel] = useState<LabLevel>("facile");
  const [mathExtra, setMathExtra] = useState<MathExtra>("grille");
  const [showStats, setShowStats] = useState(false);
  const [dailyHub, setDailyHub] = useState(false);
  const [pendingProgDaily, setPendingProgDaily] = useState(false);
  const [scienceStreak, setScienceStreak] = useState(0);
  const [progLang, setProgLang] = useState<ProgLang | null>(null);
  const [progLevel, setProgLevel] = useState<ProgLevel>("facile");
  const [progType, setProgType] = useState<ProgType>("blanche");
  const [progStreak, setProgStreak] = useState(0);
  const [showLegal, setShowLegal] = useState(false);
  const onCorrect = () => setScienceStreak((s) => s + 1);
  const onStreakReset = () => setScienceStreak(0);
  const onProgCorrect = () => setProgStreak((s) => s + 1);
  const onProgStreakReset = () => setProgStreak(0);

  const setSubject = (s: Subject | "menu") => {
    setSubjectState(s);
    setPlayMode("menu");
    if (s !== "prog") setProgLang(null);
  };

  const mathdle = useMathdle();
  const conversions = useScience(onCorrect);
  const chemistry = useChemistry(onCorrect, onStreakReset);
  const physics = usePhysicsFormulas(onCorrect);
  const mathDaily = useMathDaily();
  const scienceDaily = useScienceDaily();
  const progPageBlanche = useProgPageBlanche(progLang ?? "javascript", progLevel, onProgCorrect);
  const progATrous = useProgATrous(progLang ?? "javascript", progLevel, onProgCorrect, onProgStreakReset);
  const progDailyJs = useProgDaily("javascript");
  const progDailyPy = useProgDaily("python");
  const progDailyJava = useProgDaily("java");
  const progDailyCpp = useProgDaily("cpp");
  const progDailyByLang: Record<ProgLang, typeof progDailyJs> = {
    javascript: progDailyJs,
    python: progDailyPy,
    java: progDailyJava,
    cpp: progDailyCpp,
  };
  const progDaily = progDailyByLang[progLang ?? "javascript"];

  const chooseLang = (lang: ProgLang) => {
    setProgLang(lang);
    setPlayMode(pendingProgDaily ? "daily" : "menu");
    setPendingProgDaily(false);
  };
  const progRunnable = progLang === "python" || progLang === "javascript";
  const progEffective = progType === "blanche" && progRunnable ? "console" : progType;
  const mathGrid = mathExtra === "grille";

  const isSymbolic = mathdle.level === "impossible";
  const levelCfg =
    mathdle.mode === "classique"
      ? LEVELS[mathdle.level]
      : LEVELS[mathdle.level === "impossible" ? "difficile" : mathdle.level];

  const activeScience =
    scienceGame === "conversions" ? conversions : scienceGame === "chimie" ? chemistry : physics;

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      if (playMode === "serie" && ((subject === "math" && mathExtra !== "grille") || (subject === "science" && sciIsLab) || (subject === "prog" && progEffective === "console"))) return;
      if (playMode === "daily" && subject === "math") {
        if (e.key === "Backspace") {
          e.preventDefault();
          mathDaily.backspace();
          return;
        }
        if (e.key === "Enter") {
          mathDaily.submitGuess();
          return;
        }
        if (/^[0-9+\-*/()=]$/.test(e.key)) mathDaily.typeChar(e.key);
        return;
      }
      if (playMode === "daily" && subject === "science") {
        if (e.key === "Backspace") {
          e.preventDefault();
          scienceDaily.backspace();
          return;
        }
        if (e.key === "Enter") {
          scienceDaily.check();
          return;
        }
        if (/^[0-9,.]$/.test(e.key)) scienceDaily.typeChar(e.key === "." ? "," : e.key);
        return;
      }
      if (playMode !== "serie") return;

      if (subject === "math") {
        if (e.key === "Backspace") {
          e.preventDefault();
          if (mathdle.mode === "classique") mathdle.classique.backspace();
          else mathdle.cible.backspace();
          return;
        }
        if (e.key === "Enter") {
          if (mathdle.mode === "classique") mathdle.classique.submitGuess();
          else mathdle.cible.check();
          return;
        }
        if (!isSymbolic && /^[0-9+\-*/()=]$/.test(e.key)) {
          if (mathdle.mode === "classique") mathdle.classique.typeChar(e.key);
          else mathdle.cible.typeChar(e.key);
        }
      } else if (subject === "science") {
        if (scienceGame === "conversions") {
          if (e.key === "Backspace") {
            e.preventDefault();
            conversions.backspace();
            return;
          }
          if (e.key === "Enter") {
            conversions.check();
            return;
          }
          if (/^[0-9,.]$/.test(e.key)) {
            conversions.typeChar(e.key === "." ? "," : e.key);
          }
        } else if (scienceGame === "chimie") {
          if (e.key === "Backspace") {
            e.preventDefault();
            chemistry.backspace();
            return;
          }
          if (e.key === "Enter") {
            chemistry.check();
            return;
          }
          if (e.key === "ArrowRight" || e.key === " ") {
            e.preventDefault();
            chemistry.typeChar("→");
            return;
          }
          if (/^[0-9]$/.test(e.key)) {
            chemistry.typeChar(e.key);
          }
        } else if (scienceGame === "formules") {
          if (e.key === "Backspace") {
            e.preventDefault();
            physics.backspace();
            return;
          }
          if (e.key === "Enter") {
            physics.submitGuess();
            return;
          }
          if (/^[0-9]$/.test(e.key)) {
            physics.typeChar(e.key);
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [subject, playMode, isSymbolic, mathdle, scienceGame, conversions, chemistry, physics, mathDaily, scienceDaily, mathExtra, sciIsLab, progEffective]);

  return (
    <div className="scene">
      <div className="calculator">
        <div className="calculator__brandrow">
          {subject === "menu" && !dailyHub ? (
            <span className="calculator__brand">
              <img src="/favicon.svg" alt="" width={14} height={14} className="calculator__brand-logo" />
              MATHDLE-92
            </span>
          ) : (
            <button
              type="button"
              className="calculator__menu-btn"
              onClick={() => {
                if (subject === "menu") {
                  setDailyHub(false);
                  return;
                }
                if (playMode !== "menu") {
                  setPlayMode("menu");
                  return;
                }
                if (subject === "prog" && progLang) {
                  setProgLang(null);
                  return;
                }
                setSubject("menu");
              }}
            >
              ← MENU
            </button>
          )}
          {playMode === "serie" && subject === "math" && mathGrid && (
            <span className="calculator__lives" aria-label={`${mathdle.lives} vies sur ${mathdle.maxLives}`}>
              {"♥".repeat(mathdle.lives)}
              {"♡".repeat(mathdle.maxLives - mathdle.lives)}
            </span>
          )}
          {playMode === "serie" && subject === "science" && sciSub === "equilibrage" && (
            <span className="calculator__lives" aria-label={`${chemistry.lives} vies sur ${chemistry.maxLives}`}>
              {"♥".repeat(chemistry.lives)}
              {"♡".repeat(chemistry.maxLives - chemistry.lives)}
            </span>
          )}
          {playMode === "serie" && subject === "prog" && progEffective === "trous" && (
            <span className="calculator__lives" aria-label={`${progATrous.lives} vies sur ${progATrous.maxLives}`}>
              {"♥".repeat(progATrous.lives)}
              {"♡".repeat(progATrous.maxLives - progATrous.lives)}
            </span>
          )}
          {playMode === "serie" && (
            <span className="calculator__streak">
              SÉRIE{" "}
              <strong>
                {subject === "science" ? scienceStreak : subject === "prog" ? progStreak : mathdle.streak}
              </strong>
            </span>
          )}
          {playMode === "daily" && (
            <span className="calculator__streak">
              JOURS{" "}
              <strong>
                {subject === "science"
                  ? scienceDaily.dayStreak
                  : subject === "prog"
                    ? progDaily.dayStreak
                    : mathDaily.dayStreak}
              </strong>
            </span>
          )}
        </div>

        <div className="calculator__screen-frame">
          <div className="calculator__screen">
            {subject === "menu" && !dailyHub && (
              <SubjectMenu
                onChoose={setSubject}
                onDaily={() => setDailyHub(true)}
                onStats={() => setShowStats(true)}
                dailyDone={mathDaily.alreadyPlayedToday}
                dayStreak={mathDaily.dayStreak}
              />
            )}

            {subject === "menu" && dailyHub && (
              <div className="subject-menu daily-hub">
                <p className="subject-menu__hint">ÉNIGMES DU JOUR · les mêmes pour tout le monde</p>
                {[
                  { id: "math" as const, title: "MATHS", done: mathDaily.alreadyPlayedToday, streak: mathDaily.dayStreak },
                  { id: "science" as const, title: "SCIENCES", done: scienceDaily.alreadyPlayedToday, streak: scienceDaily.dayStreak },
                  { id: "prog" as const, title: "CODE", done: false, streak: 0 },
                ].map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    className="subject-menu__item"
                    onClick={() => {
                      setDailyHub(false);
                      setSubject(d.id);
                      if (d.id === "prog") setPendingProgDaily(true);
                      else setPlayMode("daily");
                    }}
                  >
                    <span className="subject-menu__num">{i + 1}</span>
                    <span className="subject-menu__text">
                      <span className="subject-menu__title">{d.title}</span>
                      <span className="subject-menu__desc">
                        {d.id === "prog" ? "Choisis ton langage" : d.done ? "Terminée ✓" : "À faire"}
                        {d.streak > 0 && ` · série ${d.streak} j`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {subject === "prog" && !progLang && <LangMenu onChoose={chooseLang} />}

            {subject !== "menu" && (subject !== "prog" || progLang) && playMode === "menu" && (
              <PlayModeMenu
                subjectLabel={
                  subject === "math" ? "Maths" : subject === "science" ? "Sciences" : PROG_LANG_LABELS[progLang!]
                }
                dayStreak={
                  subject === "science" ? scienceDaily.dayStreak : subject === "prog" ? progDaily.dayStreak : mathDaily.dayStreak
                }
                alreadyPlayedToday={
                  subject === "science"
                    ? scienceDaily.alreadyPlayedToday
                    : subject === "prog"
                      ? progDaily.alreadyPlayedToday
                      : mathDaily.alreadyPlayedToday
                }
                onChoose={setPlayMode}
              />
            )}

            {subject === "math" && playMode === "daily" && (
              <DailyScreen
                kind="math"
                target={mathDaily.target}
                rows={mathDaily.rows}
                currentGuess={mathDaily.currentGuess}
                rowIndex={mathDaily.rowIndex}
                maxAttempts={mathDaily.maxAttempts}
                gameOver={mathDaily.gameOver}
                won={mathDaily.won}
                message={mathDaily.message}
                alreadyPlayedToday={mathDaily.alreadyPlayedToday}
                dayStreak={mathDaily.dayStreak}
                lastWon={mathDaily.lastWon}
              />
            )}

            {subject === "science" && playMode === "daily" && (
              <ScienceDailyScreen
                question={scienceDaily.question}
                input={scienceDaily.input}
                message={scienceDaily.message}
                attempts={scienceDaily.attempts}
                maxAttempts={scienceDaily.maxAttempts}
                gameOver={scienceDaily.gameOver}
                won={scienceDaily.won}
                alreadyPlayedToday={scienceDaily.alreadyPlayedToday}
                dayStreak={scienceDaily.dayStreak}
                lastWon={scienceDaily.lastWon}
              />
            )}

            {subject === "prog" && progLang && playMode === "daily" && (
              <ProgDailyScreen
                langLabel={PROG_LANG_LABELS[progLang]}
                enonce={progDaily.exercise.enonce}
                target={progDaily.target}
                rows={progDaily.rows}
                currentGuess={progDaily.currentGuess}
                rowIndex={progDaily.rowIndex}
                maxAttempts={progDaily.maxAttempts}
                gameOver={progDaily.gameOver}
                won={progDaily.won}
                message={progDaily.message}
                alreadyPlayedToday={progDaily.alreadyPlayedToday}
                dayStreak={progDaily.dayStreak}
                lastWon={progDaily.lastWon}
              />
            )}

            {subject === "math" && playMode === "serie" && (
              <>
                <SoftkeyTabs level={mathdle.level} onChange={mathdle.setLevel} />
                <div className="sub-switch" role="tablist" aria-label="Type de jeu">
                  {MATH_EXTRAS.map((m) => (
                    <button key={m.id} type="button" className={mathExtra === m.id ? "is-active" : ""} onClick={() => setMathExtra(m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {mathGrid && <ModeSwitch mode={mathdle.mode} disabled={isSymbolic} onChange={mathdle.setMode} />}

                {mathExtra === "suites" ? (
                  <Suites level={mathdle.level} />
                ) : mathExtra === "pi" ? (
                  <CiblePi level={mathdle.level} />
                ) : mathExtra === "courbes" ? (
                  <Courbes level={mathdle.level} />
                ) : mathdle.mode === "classique" ? (
                  <div className="play-area">
                    {isSymbolic && mathdle.classique.nature && (
                      <p className="impossible-hint">
                        Indice : <strong>{mathdle.classique.nature}</strong>
                      </p>
                    )}
                    <div
                      className={
                        "message" +
                        (mathdle.classique.message.variant
                          ? ` message--${mathdle.classique.message.variant}`
                          : "")
                      }
                    >
                      {mathdle.classique.message.text}
                    </div>
                    <Grid
                      target={mathdle.classique.target}
                      rows={mathdle.classique.rows}
                      currentGuess={mathdle.classique.currentGuess}
                      rowIndex={mathdle.classique.rowIndex}
                      maxAttempts={mathdle.classique.maxAttempts}
                      gameOver={mathdle.classique.gameOver}
                      isSymbolic={isSymbolic}
                      shakeRow={mathdle.classique.shakeRow}
                      popRow={mathdle.classique.popRow}
                    />
                    {mathdle.classique.showBanner && (
                      <Banner
                        won={mathdle.classique.won}
                        target={mathdle.classique.target}
                        isSymbolic={isSymbolic}
                        lives={mathdle.lives}
                        maxLives={mathdle.maxLives}
                        streakJustReset={mathdle.classique.streakJustReset}
                        onNewGame={mathdle.newGame}
                      />
                    )}
                  </div>
                ) : (
                  <CibleLibre
                    target={mathdle.cible.target}
                    input={mathdle.cible.input}
                    config={mathdle.cible.config}
                    message={mathdle.cible.message}
                    onClear={mathdle.cible.clear}
                    onCheck={mathdle.cible.check}
                  />
                )}

                <div className="screen-only-info">
                  <InfoPanel mode={mathdle.mode} level={mathdle.level} />
                </div>
              </>
            )}

            {subject === "science" && playMode === "serie" && (
              <>
                <div className="softkeys">
                  {SCIENCE_LEVELS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={
                        "softkey" +
                        ((sciIsLab ? labLevel : activeScience.level) === t.id ? " softkey--active" : "")
                      }
                      onClick={() => (sciIsLab ? setLabLevel(t.id) : activeScience.setLevel(t.id))}
                    >
                      <span className="softkey__f">{t.f}</span>
                      <span className="softkey__label">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mode-switch">
                  <button
                    type="button"
                    className={"mode-btn" + (sciFamily === "chimie" ? " mode-btn--active" : "")}
                    onClick={() => setSciSub("equilibrage")}
                  >
                    Chimie
                  </button>
                  <button
                    type="button"
                    className={"mode-btn" + (sciFamily === "physique" ? " mode-btn--active" : "")}
                    onClick={() => setSciSub("formules")}
                  >
                    Physique
                  </button>
                </div>
                <div className="sub-switch" aria-label="Exercice">
                  {(sciFamily === "chimie" ? CHIMIE_SUBS : PHYSIQUE_SUBS).map((c) => (
                    <button key={c.id} type="button" className={sciSub === c.id ? "is-active" : ""} onClick={() => setSciSub(c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>

                {sciSub === "element" && <ElementMystere level={labLevel} />}
                {sciSub === "masse" && <MasseMolaire level={labLevel} />}
                {sciSub === "redox" && <Redox level={labLevel} />}
                {sciSub === "unites" && <Unites level={labLevel} />}
                {sciSub === "an" && <Applications level={labLevel} />}
                {sciSub === "chaine" && <Chaine level={labLevel} />}

                {sciSub === "conversions" && (
                  <ScienceScreen
                    question={conversions.question}
                    input={conversions.input}
                    message={conversions.message}
                    streak={scienceStreak}
                    onSkip={conversions.skip}
                    onCheck={conversions.check}
                  />
                )}

                {sciSub === "equilibrage" && (
                  <ChemistryScreen
                    equation={chemistry.equation}
                    coeffs={chemistry.coeffs}
                    activeIndex={chemistry.activeIndex}
                    message={chemistry.message}
                    gameOver={chemistry.gameOver}
                    onSelectSlot={chemistry.selectSlot}
                    onSkip={chemistry.skip}
                    onCheck={chemistry.check}
                  />
                )}

                {sciSub === "formules" && (
                  <PhysicsScreen
                    target={physics.target}
                    domaine={physics.domaine}
                    rows={physics.rows}
                    currentGuess={physics.currentGuess}
                    rowIndex={physics.rowIndex}
                    maxAttempts={physics.maxAttempts}
                    gameOver={physics.gameOver}
                    won={physics.won}
                    message={physics.message}
                    onSkip={physics.skip}
                    onSubmit={physics.submitGuess}
                  />
                )}

                {!sciIsLab && (
                  <div className="screen-only-info">
                    <ScienceInfoPanel subject={scienceGame} />
                  </div>
                )}
              </>
            )}

            {subject === "prog" && progLang && playMode === "serie" && (
              <>
                <div className="softkeys">
                  {SCIENCE_LEVELS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={"softkey" + (progLevel === t.id ? " softkey--active" : "")}
                      onClick={() => setProgLevel(t.id)}
                    >
                      <span className="softkey__f">{t.f}</span>
                      <span className="softkey__label">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mode-switch">
                  <button
                    type="button"
                    className={"mode-btn" + (progType === "trous" ? " mode-btn--active" : "")}
                    onClick={() => setProgType("trous")}
                  >
                    Extrait à trous
                  </button>
                  <button
                    type="button"
                    className={"mode-btn" + (progType === "blanche" ? " mode-btn--active" : "")}
                    onClick={() => setProgType("blanche")}
                  >
                    {progRunnable ? "Console ▶" : "Page blanche"}
                  </button>
                </div>

                {progEffective === "console" && (
                  <Console lang={progLang as "python" | "javascript"} level={progLevel} />
                )}

                {progEffective === "blanche" && (
                  <ProgScreen
                    lang={progLang ?? "javascript"}
                    titre={progPageBlanche.exercise.titre}
                    enonce={progPageBlanche.exercise.enonce}
                    target={progPageBlanche.target}
                    rows={progPageBlanche.rows}
                    currentGuess={progPageBlanche.currentGuess}
                    rowIndex={progPageBlanche.rowIndex}
                    maxAttempts={progPageBlanche.maxAttempts}
                    gameOver={progPageBlanche.gameOver}
                    won={progPageBlanche.won}
                    message={progPageBlanche.message}
                    onSkip={progPageBlanche.skip}
                    onSubmit={progPageBlanche.submitGuess}
                  />
                )}

                {progType === "trous" && (
                  <ProgTrousScreen
                    titre={progATrous.exercise.titre}
                    enonce={progATrous.exercise.enonce}
                    tokens={progATrous.exercise.tokens}
                    answers={progATrous.answers}
                    blanks={progATrous.blanks}
                    activeIndex={progATrous.activeIndex}
                    message={progATrous.message}
                    gameOver={progATrous.gameOver}
                    onSelectSlot={progATrous.selectSlot}
                    onSkip={progATrous.skip}
                    onCheck={progATrous.check}
                  />
                )}

                <div className="screen-only-info">
                  <ProgInfoPanel progType={progType} />
                </div>
              </>
            )}
          </div>
        </div>

        {subject === "math" && playMode === "serie" && mathGrid && (
          <Keyboard
            opKeys={levelCfg.keys}
            extraKeys={mathdle.mode === "classique" ? levelCfg.extraKeys : undefined}
            onKey={mathdle.mode === "classique" ? mathdle.classique.typeChar : mathdle.cible.typeChar}
            onBackspace={mathdle.mode === "classique" ? mathdle.classique.backspace : mathdle.cible.backspace}
            onSubmit={mathdle.mode === "classique" ? mathdle.classique.submitGuess : mathdle.cible.check}
            submitLabel={mathdle.mode === "classique" ? "Valider" : "OK"}
          />
        )}

        {subject === "math" && playMode === "daily" && !mathDaily.alreadyPlayedToday && (
          <Keyboard
            opKeys={["+", "-", "*", "/", "="]}
            onKey={mathDaily.typeChar}
            onBackspace={mathDaily.backspace}
            onSubmit={mathDaily.submitGuess}
            submitLabel="Valider"
          />
        )}

        {subject === "science" && playMode === "serie" && sciSub === "conversions" && (
          <Keyboard
            opKeys={[","]}
            onKey={conversions.typeChar}
            onBackspace={conversions.backspace}
            onSubmit={conversions.check}
            submitLabel="Vérifier"
          />
        )}

        {subject === "science" && playMode === "serie" && sciSub === "equilibrage" && (
          <Keyboard
            opKeys={chemistry.twoDigits ? ["→"] : []}
            onKey={chemistry.typeChar}
            onBackspace={chemistry.backspace}
            onSubmit={chemistry.check}
            submitLabel="Vérifier"
          />
        )}

        {subject === "science" && playMode === "serie" && sciSub === "formules" && (
          <Keyboard
            opKeys={physics.keys}
            extraKeys={physics.extraKeys}
            onKey={physics.typeChar}
            onBackspace={physics.backspace}
            onSubmit={physics.submitGuess}
            submitLabel="Valider"
          />
        )}

        {subject === "science" && playMode === "daily" && !scienceDaily.alreadyPlayedToday && (
          <Keyboard
            opKeys={[","]}
            onKey={scienceDaily.typeChar}
            onBackspace={scienceDaily.backspace}
            onSubmit={scienceDaily.check}
            submitLabel="Vérifier"
          />
        )}

        {subject === "prog" && playMode === "serie" && progEffective === "blanche" && (
          <Keyboard
            opKeys={progPageBlanche.keys}
            extraKeys={progPageBlanche.extraKeys}
            onKey={progPageBlanche.typeChar}
            onBackspace={progPageBlanche.backspace}
            onSubmit={progPageBlanche.submitGuess}
            submitLabel="Valider"
          />
        )}

        {subject === "prog" && playMode === "serie" && progType === "trous" && (
          <Keyboard
            opKeys={progATrous.keys}
            extraKeys={progATrous.extraKeys}
            onKey={progATrous.typeChar}
            onBackspace={progATrous.backspace}
            onSubmit={progATrous.check}
            submitLabel="Vérifier"
          />
        )}

        {subject === "prog" && playMode === "daily" && !progDaily.alreadyPlayedToday && (
          <Keyboard
            opKeys={progDaily.keys}
            extraKeys={progDaily.extraKeys}
            onKey={progDaily.typeChar}
            onBackspace={progDaily.backspace}
            onSubmit={progDaily.submitGuess}
            submitLabel="Valider"
          />
        )}

        <button type="button" className="calculator__legal-link" onClick={() => setShowLegal(true)}>
          Mentions légales
        </button>
      </div>

      {showLegal && <LegalNotice onClose={() => setShowLegal(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}

      {subject !== "menu" && (
        <aside className="desk-note">
          <p className="desk-note__pin">📌</p>
          <h2>Aide-mémoire</h2>
          {subject === "math" ? (
            <InfoPanel mode={mathdle.mode} level={mathdle.level} />
          ) : subject === "science" ? (
            <ScienceInfoPanel subject={scienceGame} />
          ) : (
            <ProgInfoPanel progType={progType} />
          )}
          <p className="desk-note__footer">
            Mathdle — fait pour s'entraîner, pas pour tricher en cours.
          </p>
        </aside>
      )}
    </div>
  );
}

export default App;
