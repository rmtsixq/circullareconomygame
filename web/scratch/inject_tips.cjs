
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../src/scripts/scenarioSystem.js");
let d = fs.readFileSync(p, "utf8");

const s1_tips = "\n        tips: [\n          \"Upgrade energy sources to handle industrial load.\",\n          \"Buy starting raw materials from the Trade Panel.\",\n          \"Focus on keeping Health and Sustainability up.\"\n        ],\n        winConditions";

const s2_tips = "\n        tips: [\n          \"You only have one recycling center. Close the material loops quickly!\",\n          \"Expand energy grid WITHOUT using dirty sources.\",\n          \"Maximize Sustainability to hit your Management Goal.\"\n        ],\n        winConditions";

const s3_tips = "\n        tips: [\n          \"Destroy highly polluting factories gradually.\",\n          \"Offset job/money loss by switching to Eco-Commercial zones.\",\n          \"Use your massive wealth to jumpstart the transformation.\"\n        ],\n        winConditions";

let count = 0;
d = d.replace(/\n\s*winConditions/g, (match) => {
  count++;
  if (count === 1) return s1_tips;
  if (count === 2) return s2_tips;
  if (count === 3) return s3_tips;
  return match;
});

fs.writeFileSync(p, d, "utf8");
console.log("Successfully injected tips via node module!");

