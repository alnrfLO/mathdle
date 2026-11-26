export type El = { z: number; sym: string; nom: string; group: number; period: number; mass: number };

const RAW: [string, string, number, number, number][] = [
  ["H", "Hydrogène", 1, 1, 1.008], ["He", "Hélium", 18, 1, 4.003],
  ["Li", "Lithium", 1, 2, 6.94], ["Be", "Béryllium", 2, 2, 9.012], ["B", "Bore", 13, 2, 10.81], ["C", "Carbone", 14, 2, 12.01],
  ["N", "Azote", 15, 2, 14.01], ["O", "Oxygène", 16, 2, 16.0], ["F", "Fluor", 17, 2, 19.0], ["Ne", "Néon", 18, 2, 20.18],
  ["Na", "Sodium", 1, 3, 22.99], ["Mg", "Magnésium", 2, 3, 24.31], ["Al", "Aluminium", 13, 3, 26.98], ["Si", "Silicium", 14, 3, 28.09],
  ["P", "Phosphore", 15, 3, 30.97], ["S", "Soufre", 16, 3, 32.06], ["Cl", "Chlore", 17, 3, 35.45], ["Ar", "Argon", 18, 3, 39.95],
  ["K", "Potassium", 1, 4, 39.1], ["Ca", "Calcium", 2, 4, 40.08], ["Sc", "Scandium", 3, 4, 44.96], ["Ti", "Titane", 4, 4, 47.87],
  ["V", "Vanadium", 5, 4, 50.94], ["Cr", "Chrome", 6, 4, 52.0], ["Mn", "Manganèse", 7, 4, 54.94], ["Fe", "Fer", 8, 4, 55.85],
  ["Co", "Cobalt", 9, 4, 58.93], ["Ni", "Nickel", 10, 4, 58.69], ["Cu", "Cuivre", 11, 4, 63.55], ["Zn", "Zinc", 12, 4, 65.38],
  ["Ga", "Gallium", 13, 4, 69.72], ["Ge", "Germanium", 14, 4, 72.63], ["As", "Arsenic", 15, 4, 74.92], ["Se", "Sélénium", 16, 4, 78.97],
  ["Br", "Brome", 17, 4, 79.9], ["Kr", "Krypton", 18, 4, 83.8],
  ["Rb", "Rubidium", 1, 5, 85.47], ["Sr", "Strontium", 2, 5, 87.62], ["Y", "Yttrium", 3, 5, 88.91], ["Zr", "Zirconium", 4, 5, 91.22],
  ["Nb", "Niobium", 5, 5, 92.91], ["Mo", "Molybdène", 6, 5, 95.95], ["Tc", "Technétium", 7, 5, 98], ["Ru", "Ruthénium", 8, 5, 101.1],
  ["Rh", "Rhodium", 9, 5, 102.9], ["Pd", "Palladium", 10, 5, 106.4], ["Ag", "Argent", 11, 5, 107.9], ["Cd", "Cadmium", 12, 5, 112.4],
  ["In", "Indium", 13, 5, 114.8], ["Sn", "Étain", 14, 5, 118.7], ["Sb", "Antimoine", 15, 5, 121.8], ["Te", "Tellure", 16, 5, 127.6],
  ["I", "Iode", 17, 5, 126.9], ["Xe", "Xénon", 18, 5, 131.3],
];

export const ELEMENTS: El[] = RAW.map(([sym, nom, group, period, mass], i) => ({ z: i + 1, sym, nom, group, period, mass }));

export const BY_SYM: Record<string, El> = Object.fromEntries(ELEMENTS.map((e) => [e.sym, e]));

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function findElement(raw: string): El | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const bySym = ELEMENTS.find((e) => e.sym.toLowerCase() === s.toLowerCase());
  if (bySym) return bySym;
  const n = Number(s);
  if (Number.isInteger(n)) return ELEMENTS[n - 1];
  return ELEMENTS.find((e) => norm(e.nom) === norm(s));
}

export function molarMass(formula: string): number {
  const parts = formula.replace(/\s/g, "").split(/[·.*]/);
  let total = 0;
  for (const part of parts) {
    const m = part.match(/^(\d+)(.*)$/);
    const k = m ? Number(m[1]) : 1;
    total += k * parseGroup(m ? m[2] : part);
  }
  return total;
}

function parseGroup(s: string): number {
  let i = 0;
  function seq(): number {
    let sum = 0;
    while (i < s.length && s[i] !== ")") {
      let v: number;
      if (s[i] === "(") {
        i++;
        v = seq();
        if (s[i] !== ")") throw new Error("parenthèse");
        i++;
      } else {
        const m = s.slice(i).match(/^[A-Z][a-z]?/);
        if (!m || !BY_SYM[m[0]]) throw new Error(`élément inconnu près de « ${s.slice(i)} »`);
        v = BY_SYM[m[0]].mass;
        i += m[0].length;
      }
      const n = s.slice(i).match(/^\d+/);
      if (n) i += n[0].length;
      sum += v * (n ? Number(n[0]) : 1);
    }
    return sum;
  }
  const r = seq();
  if (i < s.length) throw new Error("formule mal formée");
  return r;
}
