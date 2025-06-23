// update-version.js
const fs = require("fs");

const pxtJson = JSON.parse(fs.readFileSync("pxt.json", "utf8"));
const version = pxtJson.version;

const content = `// This file is auto-generated from pxt.json
//% block="Erweiterungsversion"
export const EXTENSION_VERSION = "${version}";
`;

fs.writeFileSync("version.ts", content, "utf8");
console.log(`✅ version.ts aktualisiert: Version ${version}`);
