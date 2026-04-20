
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../src/scripts/scenarioSystem.js");
let d = fs.readFileSync(p, "utf8");

// 1. Add call to populateObjectivesPanel
d = d.replace(
  "// Place prebuilt buildings\n    this.placePrebuiltBuildings(scenario);",
  "// Place prebuilt buildings\n    this.placePrebuiltBuildings(scenario);\n\n    // Populate Objectives Panel\n    this.populateObjectivesPanel(scenario);"
);

// 2. Add the actual method at the bottom before module exports (or right after placePrebuiltBuildings)
const populateMethod = `
  /**
   * Populates and displays the scenario objectives panel
   */
  populateObjectivesPanel(scenario) {
    const panel = document.getElementById("objectives-panel");
    const content = document.getElementById("objectives-content");
    const toggleBtn = document.getElementById("objectives-toggle-btn");
    const aimsList = document.getElementById("objectives-aim-list");
    const tipsList = document.getElementById("objectives-tips-list");

    if (!panel || !aimsList || !tipsList) return;

    // Clear previous
    aimsList.innerHTML = "";
    tipsList.innerHTML = "";

    // Fill Win Conditions
    if (scenario.winConditions && scenario.winConditions.label) {
      const parts = scenario.winConditions.label.split(" ? ");
      parts.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        aimsList.appendChild(li);
      });
      // Fallback if not using split symbol
      if (parts.length === 1 && scenario.winConditions.label.includes(" • ")) {
        aimsList.innerHTML = "";
        scenario.winConditions.label.split(" • ").forEach(p => {
            const li = document.createElement("li");
            li.textContent = p;
            aimsList.appendChild(li);
        });
      }
    } else {
        const li = document.createElement("li");
        li.textContent = "Survive and thrive!";
        aimsList.appendChild(li);
    }

    // Fill Tips
    if (scenario.tips && scenario.tips.length > 0) {
      scenario.tips.forEach(t => {
        const li = document.createElement("li");
        li.style.marginBottom = "4px";
        li.textContent = "?? " + t;
        tipsList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No specific tips for this scenario.";
      tipsList.appendChild(li);
    }

    // Show the panel
    panel.style.display = "block";
    
    // Ensure content is expanded
    if (content) content.style.display = "block";
    if (toggleBtn) toggleBtn.textContent = "?";
  }
`;

d = d.replace(
  "  placePrebuiltBuildings(scenario) {",
  populateMethod + "\n  placePrebuiltBuildings(scenario) {"
);

fs.writeFileSync(p, d, "utf8");
console.log("Successfully injected populateObjectivesPanel method!");

