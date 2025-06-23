const fs = require("fs");

// Lies die Datei pxt.json ein
const raw = fs.readFileSync("pxt.json", "utf8");
const pxt = JSON.parse(raw);

// Hole nur die Version
const version = pxt.version;

// Erstelle den Inhalt für version.ts
const tsContent = `// This file is auto-generated from pxt.json
let versionnumber = "${version}";
`;

fs.writeFileSync("version.ts", tsContent, "utf8");
