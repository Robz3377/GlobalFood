#!/usr/bin/env node
/**
 * Audit qualité post-normalisation — détecte les résidus tutoiement,
 * vouvoiement et faux positifs (verbes 3e pers transformés en infinitif).
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRIES_DIR = join(__dirname, "..", "data", "countries");

const PATTERNS = [
  ["Résidu vous/votre/vos", /\bvous\b|\bvotre\b|\bvos\b/gi],
  [
    "Résidu tutoiement (tu/te/tes/ton/ta/toi)",
    /(?<![\p{L}'’])(?:tu|te|tes|ton|ta|toi)(?![\p{L}’])/giu,
  ],
  [
    "« qu'on/qu'il + infinitif » (3e pers transformé à tort)",
    /\bqu['’](?:on|ils?|elles?)\s+\w+er\b/gi,
  ],
  [
    "« la/le + verbe » (nom transformé à tort)",
    /\b(la|le|du|au|une?)\s+(souper|mélanger|former)\b/gi,
  ],
];

let totalProblems = 0;
for (const [label, re] of PATTERNS) {
  let total = 0;
  const ex = [];
  for (const f of readdirSync(COUNTRIES_DIR)) {
    if (!f.endsWith(".json")) continue;
    const c = JSON.parse(readFileSync(join(COUNTRIES_DIR, f), "utf8"));
    for (const r of c.recipes) {
      for (const key of ["steps", "commisSteps"]) {
        for (const s of r[key] || []) {
          re.lastIndex = 0;
          let m;
          while ((m = re.exec(s)) !== null) {
            total++;
            if (ex.length < 5) {
              ex.push(
                `${c.slug}/${r.slug} : « ${s.slice(Math.max(0, m.index - 20), m.index + 50)} »`
              );
            }
          }
        }
      }
    }
  }
  totalProblems += total;
  console.log(`${total === 0 ? "✓" : "⚠"} ${label} : ${total}`);
  ex.forEach((e) => console.log(`    ${e}`));
}

console.log(`\n${totalProblems === 0 ? "🎉" : "📋"} Total problèmes : ${totalProblems}`);
