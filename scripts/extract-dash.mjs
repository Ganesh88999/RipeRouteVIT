import fs from "fs"

const en = fs.readFileSync("src/i18n/en.ts", "utf8")
const start = en.indexOf("  dash: {")
let i = start + "  dash: {".length
let depth = 1
let body = ""
while (i < en.length && depth > 0) {
  const ch = en[i++]
  if (ch === "{") depth++
  else if (ch === "}") {
    depth--
    if (depth === 0) break
  }
  body += ch
}

const entries = []
const re = /([a-zA-Z0-9_]+):\s*("(?:\\.|[^"\\])*")/g
let m
while ((m = re.exec(body))) {
  entries.push([m[1], JSON.parse(m[2])])
}

const obj = Object.fromEntries(entries)
fs.writeFileSync("src/i18n/_en_dash_extract.json", JSON.stringify(obj, null, 2))
console.log("parsed", entries.length)
