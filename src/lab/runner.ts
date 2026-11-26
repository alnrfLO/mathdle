export interface RunRequest {
  lang: "python" | "javascript";
  code: string;
  name: string;
  nparams: number;
  tests: unknown[][];
}

export interface RunResult {
  fatal?: string;
  results?: { ok: boolean; v?: unknown; e?: string }[];
  logs: string[];
}

const PYODIDE: string = import.meta.env.VITE_PYODIDE_URL ?? "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";

const JS_WORKER = `
self.onmessage = (ev) => {
  const { code, name, nparams, tests } = ev.data;
  const logs = [];
  const fmt = (a) => a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");
  const console = { log: (...a) => logs.push(fmt(a)), error: (...a) => logs.push(fmt(a)), warn: (...a) => logs.push(fmt(a)) };
  let fn;
  try {
    fn = new Function("console", code + "\\n;return typeof " + name + " === 'function' ? " + name + " : undefined;")(console);
  } catch (e) {
    self.postMessage({ fatal: (e && e.name ? e.name + " : " : "") + (e && e.message ? e.message : String(e)), logs });
    return;
  }
  if (typeof fn !== "function") {
    self.postMessage({ fatal: "Fonction « " + name + " » introuvable : garde le nom donné dans l'énoncé.", logs });
    return;
  }
  if (fn.length !== nparams) {
    self.postMessage({ fatal: "La fonction « " + name + " » doit prendre " + nparams + " paramètre(s), la tienne en prend " + fn.length + ".", logs });
    return;
  }
  const results = tests.map((args) => {
    try {
      return { ok: true, v: fn(...structuredClone(args)) };
    } catch (e) {
      return { ok: false, e: (e && e.name ? e.name + " : " : "") + (e && e.message ? e.message : String(e)) };
    }
  });
  self.postMessage({ results, logs });
};
`;

const PY_WORKER = `
let py = null;
let logs = [];
try {
  importScripts("${PYODIDE}pyodide.js");
} catch (e) {
  self.postMessage({ loadError: String(e) });
}
const ready = typeof loadPyodide === "undefined" ? Promise.resolve() : loadPyodide({ indexURL: "${PYODIDE}" }).then((p) => {
  py = p;
  py.setStdout({ batched: (s) => logs.push(s) });
  py.setStderr({ batched: (s) => logs.push(s) });
  self.postMessage({ ready: true });
}).catch((e) => self.postMessage({ loadError: String(e) }));

const RUNNER = \`
import json, copy, inspect
def __run(code, name, nparams, tests_json):
    ns = {"__name__": "__joueur__"}
    try:
        exec(code, ns)
    except Exception as e:
        return json.dumps({"fatal": type(e).__name__ + " : " + str(e)})
    f = ns.get(name)
    if not callable(f):
        return json.dumps({"fatal": "Fonction « " + name + " » introuvable : garde le nom donné dans l'énoncé."})
    try:
        n = len(inspect.signature(f).parameters)
    except Exception:
        n = nparams
    if n != nparams:
        return json.dumps({"fatal": "La fonction « " + name + " » doit prendre " + str(nparams) + " paramètre(s), la tienne en prend " + str(n) + "."})
    out = []
    for args in json.loads(tests_json):
        try:
            v = f(*copy.deepcopy(args))
            try:
                json.dumps(v)
            except Exception:
                v = repr(v)
            out.append({"ok": True, "v": v})
        except Exception as e:
            out.append({"ok": False, "e": type(e).__name__ + " : " + str(e)})
    return json.dumps({"results": out})
\`;

self.onmessage = async (ev) => {
  await ready;
  if (!py) return;
  logs = [];
  const { code, name, nparams, tests } = ev.data;
  try {
    py.runPython(RUNNER);
    const run = py.globals.get("__run");
    const raw = run(code, name, nparams, JSON.stringify(tests));
    run.destroy();
    self.postMessage({ ...JSON.parse(raw), logs });
  } catch (e) {
    self.postMessage({ fatal: String(e), logs });
  }
};
`;

function makeWorker(src: string) {
  const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  const w = new Worker(url);
  URL.revokeObjectURL(url);
  return w;
}

let pyWorker: Worker | null = null;
let pyReady: Promise<void> | null = null;

function getPython(onStatus?: (s: string) => void): Promise<Worker> {
  if (!pyWorker) {
    pyWorker = makeWorker(PY_WORKER);
    const w = pyWorker;
    onStatus?.("Chargement de Python (une seule fois, quelques secondes)…");
    pyReady = new Promise((resolve, reject) => {
      const fail = () => {
        w.terminate();
        pyWorker = null;
        reject(new Error("Impossible de charger Python : vérifie ta connexion puis réessaie."));
      };
      const t = setTimeout(fail, 45000);
      w.addEventListener("error", () => {
        clearTimeout(t);
        fail();
      });
      const h = (ev: MessageEvent) => {
        if (ev.data?.ready) {
          clearTimeout(t);
          w.removeEventListener("message", h);
          resolve();
        } else if (ev.data?.loadError) {
          clearTimeout(t);
          w.removeEventListener("message", h);
          fail();
        }
      };
      w.addEventListener("message", h);
    });
  }
  const w = pyWorker;
  return pyReady!.then(() => w);
}

export const TIMEOUT_MS = 4000;

export async function runCode(req: RunRequest, onStatus?: (s: string) => void): Promise<RunResult> {
  let worker: Worker;
  if (req.lang === "python") {
    try {
      worker = await getPython(onStatus);
    } catch (e) {
      return { fatal: (e as Error).message, logs: [] };
    }
  } else worker = makeWorker(JS_WORKER);
  onStatus?.("Exécution des tests…");

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate();
      if (req.lang === "python") pyWorker = null;
      resolve({ fatal: `Délai dépassé (${TIMEOUT_MS / 1000} s) : boucle infinie ?`, logs: [] });
    }, TIMEOUT_MS);
    worker.onmessage = (ev) => {
      if (ev.data?.ready) return;
      clearTimeout(timer);
      if (req.lang === "javascript") worker.terminate();
      resolve(ev.data as RunResult);
    };
    worker.onerror = (ev) => {
      clearTimeout(timer);
      if (req.lang === "javascript") worker.terminate();
      resolve({ fatal: ev.message || "Erreur d'exécution", logs: [] });
    };
    worker.postMessage(req);
  });
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  return a === b;
}

export function show(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (v === undefined) return "undefined";
  return JSON.stringify(v);
}
