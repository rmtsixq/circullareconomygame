
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../src/scripts/scenarioSystem.js");
let d = fs.readFileSync(p, "utf8");

// Fix the typo/missing part: Highlight the toolbar button when the panel opens automatically
if (!d.includes("button-objectives")) {
    d = d.replace("panel.style.display = \"block\";", "panel.style.display = \"block\";\n    const toggleToolbarBtn = document.getElementById(\"button-objectives\");\n    if (toggleToolbarBtn) toggleToolbarBtn.classList.add(\"selected\");");
}

fs.writeFileSync(p, d, "utf8");
console.log("Final UI polish applied!");

