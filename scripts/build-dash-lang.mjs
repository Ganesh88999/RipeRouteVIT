/**
 * Validates dash.ta.json / dash.hi.json against _en_dash_extract.json
 * and confirms dash.ts / translations.ts merge wiring.
 *
 * Usage:
 *   node scripts/build-dash-lang.mjs
 *   node scripts/build-dash-lang.mjs --check
 *
 * To regenerate ta/hi JSON from the full translation tables + English extract:
 *   node scripts/gen-dash-ta-hi.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const i18n = path.join(root, "src/i18n")

const en = JSON.parse(fs.readFileSync(path.join(i18n, "_en_dash_extract.json"), "utf8"))
const ta = JSON.parse(fs.readFileSync(path.join(i18n, "dash.ta.json"), "utf8"))
const hi = JSON.parse(fs.readFileSync(path.join(i18n, "dash.hi.json"), "utf8"))

const enKeys = Object.keys(en)

function missingKeys(obj) {
  return enKeys.filter((k) => obj[k] == null || String(obj[k]).trim() === "")
}

function extraKeys(obj) {
  return Object.keys(obj).filter((k) => !(k in en))
}

/** Same merge shape as translations.ts: dash: { ...en.dash, ...lang } */
export function mergeDash(langDash) {
  return { ...en, ...langDash }
}

const taMissing = missingKeys(ta)
const hiMissing = missingKeys(hi)
const report = {
  en: enKeys.length,
  ta: Object.keys(ta).length,
  hi: Object.keys(hi).length,
  taMissing: taMissing.length,
  hiMissing: hiMissing.length,
  taExtra: extraKeys(ta).length,
  hiExtra: extraKeys(hi).length,
  mergedTaKeys: Object.keys(mergeDash(ta)).length,
  mergedHiKeys: Object.keys(mergeDash(hi)).length,
}

console.log("dash lang build report")
console.log(JSON.stringify(report, null, 2))

if (taMissing.length) {
  console.error("ta missing:", taMissing.join(", "))
  process.exitCode = 1
}
if (hiMissing.length) {
  console.error("hi missing:", hiMissing.join(", "))
  process.exitCode = 1
}

const dashTs = fs.readFileSync(path.join(i18n, "dash.ts"), "utf8")
const translationsTs = fs.readFileSync(path.join(i18n, "translations.ts"), "utf8")

const checks = [
  [/import taJson from "\.\/dash\.ta\.json"/, "dash.ts imports dash.ta.json"],
  [/import hiJson from "\.\/dash\.hi\.json"/, "dash.ts imports dash.hi.json"],
  [/export const dashByLang/, "dash.ts exports dashByLang"],
  [/dash:\s*\{\s*\.\.\.en\.dash,\s*\.\.\.dashByLang\.ta\s*\}/, "translations.ts merges en.dash + ta"],
  [/dash:\s*\{\s*\.\.\.en\.dash,\s*\.\.\.dashByLang\.hi\s*\}/, "translations.ts merges en.dash + hi"],
  [/dash:\s*\{\s*\.\.\.en\.dash,\s*\.\.\.dashByLang\.te\s*\}/, "translations.ts merges en.dash + te"],
]

for (const [re, label] of checks) {
  if (!re.test(dashTs) && !re.test(translationsTs)) {
    console.error("FAIL:", label)
    process.exitCode = 1
  } else {
    console.log("OK:", label)
  }
}

if (!process.exitCode) {
  console.log("Ready — dashByLang.ta/hi load from JSON; other langs keep in-file partials.")
}
