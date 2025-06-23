const fs = require("fs");

// Lies die Datei pxt.json ein
const raw = fs.readFileSync("pxt.json", "utf8");
const pxt = JSON.parse(raw);

// Hole nur die Version
const version = pxt.version;

if (!version) {
  console.error("❌ Keine Versionsnummer in pxt.json gefunden!");
  process.exit(1);
}

// Erstelle den Inhalt für version.ts
const tsContent = `// This file is auto-generated from pxt.json
//% block="Erweiterungsversion"
export const EXTENSION_VERSION = "${version}";
`;

fs.writeFileSync("version.ts", tsContent, "utf8");
console.log(`✅ version.ts auf Version ${version} gesetzt.`);
