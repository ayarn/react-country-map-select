import fs from "node:fs";
import path from "node:path";

const targets = ["dist/index.js", "dist/index.cjs"];
const directive = '"use client";\n';

for (const file of targets) {
  const full = path.resolve(file);
  if (!fs.existsSync(full)) {
    console.warn(`[add-use-client] skip (not found): ${file}`);
    continue;
  }
  const current = fs.readFileSync(full, "utf8");
  if (
    current.startsWith('"use client"') ||
    current.startsWith("'use client'")
  ) {
    console.log(`[add-use-client] already present: ${file}`);
    continue;
  }
  fs.writeFileSync(full, directive + current);
  console.log(`[add-use-client] injected into: ${file}`);
}
