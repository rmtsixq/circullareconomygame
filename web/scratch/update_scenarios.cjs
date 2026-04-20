const fs = require('fs');
const path = require('path');

// Read the scenario system file
const scenarioSystemPath = path.join(__dirname, '../src/scripts/scenarioSystem.js');
let scenarioCode = fs.readFileSync(scenarioSystemPath, 'utf8');

// The base JSON from the user
const baseGrid = [
  {"x":0,"y":6,"type":"solar-panel"},
  {"x":0,"y":8,"type":"road"},
  {"x":0,"y":9,"type":"road"},
  {"x":0,"y":10,"type":"road"},
  {"x":0,"y":11,"type":"road"},
  {"x":0,"y":12,"type":"road"},
  {"x":0,"y":13,"type":"road"},
  {"x":0,"y":14,"type":"road"},
  {"x":1,"y":0,"type":"road"},
  {"x":1,"y":1,"type":"road"},
  {"x":1,"y":2,"type":"road"},
  {"x":1,"y":3,"type":"road"},
  {"x":1,"y":4,"type":"road"},
  {"x":1,"y":5,"type":"road"},
  {"x":1,"y":7,"type":"road"},
  {"x":1,"y":8,"type":"road"},
  {"x":1,"y":9,"type":"residential","developmentState":"developed"},
  {"x":1,"y":12,"type":"wind-turbine"},
  {"x":1,"y":14,"type":"road"},
  {"x":2,"y":0,"type":"road"},
  {"x":2,"y":3,"type":"residential","developmentState":"developed"},
  {"x":2,"y":5,"type":"road"},
  {"x":2,"y":7,"type":"road"},
  {"x":2,"y":10,"type":"wind-turbine"},
  {"x":2,"y":12,"type":"residential","developmentState":"developed"},
  {"x":2,"y":14,"type":"road"},
  {"x":2,"y":15,"type":"solar-panel"},
  {"x":2,"y":16,"type":"wind-turbine"},
  {"x":2,"y":17,"type":"school"},
  {"x":3,"y":0,"type":"road"},
  {"x":3,"y":4,"type":"road"},
  {"x":3,"y":5,"type":"road"},
  {"x":3,"y":6,"type":"road"},
  {"x":3,"y":7,"type":"road"},
  {"x":3,"y":8,"type":"road"},
  {"x":3,"y":9,"type":"road"},
  {"x":3,"y":10,"type":"road"},
  {"x":3,"y":11,"type":"road"},
  {"x":3,"y":12,"type":"road"},
  {"x":3,"y":13,"type":"road"},
  {"x":3,"y":14,"type":"road"},
  {"x":3,"y":15,"type":"road"},
  {"x":3,"y":16,"type":"road"},
  {"x":4,"y":0,"type":"road"},
  {"x":4,"y":2,"type":"residential","developmentState":"developed"},
  {"x":4,"y":3,"type":"hospital"},
  {"x":4,"y":4,"type":"road"},
  {"x":4,"y":5,"type":"residential","developmentState":"developed"},
  {"x":4,"y":7,"type":"solar-panel"},
  {"x":4,"y":8,"type":"solar-panel"},
  {"x":4,"y":9,"type":"residential","developmentState":"developed"},
  {"x":4,"y":10,"type":"road"},
  {"x":4,"y":12,"type":"wind-turbine"},
  {"x":4,"y":14,"type":"textile-factory"},
  {"x":4,"y":16,"type":"road"},
  {"x":4,"y":17,"type":"road"},
  {"x":4,"y":18,"type":"road"},
  {"x":4,"y":19,"type":"road"},
  {"x":5,"y":0,"type":"road"},
  {"x":5,"y":1,"type":"road"},
  {"x":5,"y":2,"type":"road"},
  {"x":5,"y":3,"type":"road"},
  {"x":5,"y":4,"type":"road"},
  {"x":5,"y":6,"type":"textile-factory"},
  {"x":5,"y":7,"type":"wind-turbine"},
  {"x":5,"y":9,"type":"park"},
  {"x":5,"y":10,"type":"road"},
  {"x":5,"y":11,"type":"residential","developmentState":"developed"},
  {"x":5,"y":12,"type":"solar-panel"},
  {"x":5,"y":13,"type":"residential","developmentState":"developed"},
  {"x":5,"y":14,"type":"residential"},
  {"x":5,"y":15,"type":"commercial","developmentState":"developed"},
  {"x":5,"y":16,"type":"road"},
  {"x":5,"y":19,"type":"road"},
  {"x":6,"y":2,"type":"wind-turbine"},
  {"x":6,"y":3,"type":"solar-panel"},
  {"x":6,"y":4,"type":"road"},
  {"x":6,"y":7,"type":"solar-panel"},
  {"x":6,"y":8,"type":"road"},
  {"x":6,"y":9,"type":"road"},
  {"x":6,"y":10,"type":"road"},
  {"x":6,"y":11,"type":"road"},
  {"x":6,"y":12,"type":"road"},
  {"x":6,"y":16,"type":"road"},
  {"x":6,"y":17,"type":"residential","developmentState":"developed"},
  {"x":6,"y":19,"type":"road"},
  {"x":7,"y":2,"type":"residential","developmentState":"developed"},
  {"x":7,"y":4,"type":"road"},
  {"x":7,"y":5,"type":"textile-factory"},
  {"x":7,"y":8,"type":"road"},
  {"x":7,"y":10,"type":"hospital"},
  {"x":7,"y":11,"type":"park"},
  {"x":7,"y":12,"type":"road"},
  {"x":7,"y":13,"type":"textile-factory"},
  {"x":7,"y":16,"type":"road"},
  {"x":7,"y":19,"type":"road"},
  {"x":8,"y":0,"type":"wind-turbine"},
  {"x":8,"y":1,"type":"solar-panel"},
  {"x":8,"y":4,"type":"road"},
  {"x":8,"y":7,"type":"residential","developmentState":"developed"},
  {"x":8,"y":8,"type":"road"},
  {"x":8,"y":9,"type":"residential"},
  {"x":8,"y":10,"type":"solar-panel"},
  {"x":8,"y":12,"type":"road"},
  {"x":8,"y":14,"type":"park"},
  {"x":8,"y":15,"type":"residential"},
  {"x":8,"y":16,"type":"road"},
  {"x":8,"y":17,"type":"road"},
  {"x":8,"y":18,"type":"road"},
  {"x":8,"y":19,"type":"road"},
  {"x":9,"y":0,"type":"road"},
  {"x":9,"y":1,"type":"road"},
  {"x":9,"y":2,"type":"road"},
  {"x":9,"y":3,"type":"road"},
  {"x":9,"y":4,"type":"road"},
  {"x":9,"y":5,"type":"residential"},
  {"x":9,"y":7,"type":"school"},
  {"x":9,"y":8,"type":"road"},
  {"x":9,"y":11,"type":"solar-panel"},
  {"x":9,"y":12,"type":"road"},
  {"x":9,"y":13,"type":"road"},
  {"x":9,"y":14,"type":"road"},
  {"x":9,"y":15,"type":"road"},
  {"x":9,"y":16,"type":"road"},
  {"x":9,"y":17,"type":"wind-turbine"},
  {"x":9,"y":19,"type":"road"},
  {"x":10,"y":0,"type":"road"},
  {"x":10,"y":3,"type":"residential","developmentState":"developed"},
  {"x":10,"y":4,"type":"road"},
  {"x":10,"y":6,"type":"textile-factory"},
  {"x":10,"y":8,"type":"road"},
  {"x":10,"y":9,"type":"wind-turbine"},
  {"x":10,"y":10,"type":"residential","isPlayerHouse":true,"developmentState":"developed"},
  {"x":10,"y":12,"type":"residential"},
  {"x":10,"y":13,"type":"commercial","developmentState":"developed"},
  {"x":10,"y":14,"type":"wind-turbine"},
  {"x":10,"y":16,"type":"road"},
  {"x":10,"y":17,"type":"residential"},
  {"x":10,"y":19,"type":"road"},
  {"x":11,"y":0,"type":"road"},
  {"x":11,"y":1,"type":"wind-turbine"},
  {"x":11,"y":3,"type":"wind-turbine"},
  {"x":11,"y":4,"type":"road"},
  {"x":11,"y":6,"type":"commercial","developmentState":"developed"},
  {"x":11,"y":7,"type":"wind-turbine"},
  {"x":11,"y":8,"type":"road"},
  {"x":11,"y":9,"type":"road"},
  {"x":11,"y":10,"type":"solar-panel"},
  {"x":11,"y":11,"type":"park"},
  {"x":11,"y":13,"type":"textile-factory"},
  {"x":11,"y":15,"type":"hospital"},
  {"x":11,"y":16,"type":"road"},
  {"x":11,"y":17,"type":"wind-turbine"},
  {"x":11,"y":19,"type":"road"},
  {"x":12,"y":0,"type":"road"},
  {"x":12,"y":2,"type":"residential","developmentState":"developed"},
  {"x":12,"y":4,"type":"road"},
  {"x":12,"y":8,"type":"residential","developmentState":"developed"},
  {"x":12,"y":9,"type":"road"},
  {"x":12,"y":10,"type":"road"},
  {"x":12,"y":11,"type":"road"},
  {"x":12,"y":12,"type":"road"},
  {"x":12,"y":13,"type":"road"},
  {"x":12,"y":14,"type":"road"},
  {"x":12,"y":15,"type":"road"},
  {"x":12,"y":16,"type":"road"},
  {"x":12,"y":17,"type":"wind-turbine"},
  {"x":12,"y":19,"type":"road"},
  {"x":13,"y":0,"type":"road"},
  {"x":13,"y":3,"type":"school"},
  {"x":13,"y":4,"type":"road"},
  {"x":13,"y":5,"type":"residential","developmentState":"developed"},
  {"x":13,"y":6,"type":"solar-panel"},
  {"x":13,"y":7,"type":"residential","developmentState":"developed"},
  {"x":13,"y":9,"type":"road"},
  {"x":13,"y":12,"type":"residential","developmentState":"developed"},
  {"x":13,"y":13,"type":"residential","developmentState":"developed"},
  {"x":13,"y":14,"type":"residential"},
  {"x":13,"y":15,"type":"residential"},
  {"x":13,"y":16,"type":"road"},
  {"x":13,"y":18,"type":"residential"},
  {"x":13,"y":19,"type":"road"},
  {"x":14,"y":0,"type":"road"},
  {"x":14,"y":1,"type":"road"},
  {"x":14,"y":2,"type":"road"},
  {"x":14,"y":3,"type":"road"},
  {"x":14,"y":4,"type":"road"},
  {"x":14,"y":5,"type":"solar-panel"},
  {"x":14,"y":8,"type":"textile-factory"},
  {"x":14,"y":9,"type":"road"},
  {"x":14,"y":10,"type":"solar-panel"},
  {"x":14,"y":11,"type":"residential"},
  {"x":14,"y":16,"type":"road"},
  {"x":14,"y":19,"type":"road"},
  {"x":15,"y":1,"type":"park"},
  {"x":15,"y":2,"type":"residential"},
  {"x":15,"y":3,"type":"park"},
  {"x":15,"y":4,"type":"road"},
  {"x":15,"y":5,"type":"park"},
  {"x":15,"y":6,"type":"wind-turbine"},
  {"x":15,"y":7,"type":"residential"},
  {"x":15,"y":9,"type":"road"},
  {"x":15,"y":11,"type":"wind-turbine"},
  {"x":15,"y":12,"type":"residential","developmentState":"developed"},
  {"x":15,"y":13,"type":"wind-turbine"},
  {"x":15,"y":15,"type":"park"},
  {"x":15,"y":16,"type":"road"},
  {"x":15,"y":17,"type":"road"},
  {"x":15,"y":19,"type":"road"},
  {"x":16,"y":4,"type":"road"},
  {"x":16,"y":5,"type":"road"},
  {"x":16,"y":6,"type":"road"},
  {"x":16,"y":7,"type":"road"},
  {"x":16,"y":8,"type":"road"},
  {"x":16,"y":9,"type":"road"},
  {"x":16,"y":10,"type":"road"},
  {"x":16,"y":11,"type":"road"},
  {"x":16,"y":12,"type":"road"},
  {"x":16,"y":13,"type":"road"},
  {"x":16,"y":14,"type":"road"},
  {"x":16,"y":15,"type":"road"},
  {"x":16,"y":16,"type":"residential","developmentState":"developed"},
  {"x":16,"y":17,"type":"road"},
  {"x":16,"y":18,"type":"road"},
  {"x":16,"y":19,"type":"road"},
  {"x":17,"y":1,"type":"residential"},
  {"x":17,"y":2,"type":"road"},
  {"x":17,"y":3,"type":"road"},
  {"x":17,"y":4,"type":"road"},
  {"x":17,"y":6,"type":"road"},
  {"x":17,"y":8,"type":"park"},
  {"x":17,"y":9,"type":"road"},
  {"x":17,"y":11,"type":"residential"},
  {"x":17,"y":13,"type":"residential"},
  {"x":17,"y":15,"type":"road"},
  {"x":17,"y":16,"type":"road"},
  {"x":17,"y":17,"type":"solar-panel"},
  {"x":17,"y":18,"type":"residential"},
  {"x":18,"y":2,"type":"road"},
  {"x":18,"y":4,"type":"residential"},
  {"x":18,"y":5,"type":"park"},
  {"x":18,"y":6,"type":"road"},
  {"x":18,"y":7,"type":"residential"},
  {"x":18,"y":9,"type":"road"},
  {"x":18,"y":12,"type":"road"},
  {"x":18,"y":13,"type":"road"},
  {"x":18,"y":14,"type":"road"},
  {"x":18,"y":15,"type":"road"},
  {"x":18,"y":16,"type":"solar-panel"},
  {"x":19,"y":2,"type":"road"},
  {"x":19,"y":3,"type":"road"},
  {"x":19,"y":4,"type":"road"},
  {"x":19,"y":5,"type":"road"},
  {"x":19,"y":6,"type":"road"},
  {"x":19,"y":8,"type":"park"},
  {"x":19,"y":9,"type":"road"},
  {"x":19,"y":10,"type":"road"},
  {"x":19,"y":11,"type":"road"},
  {"x":19,"y":12,"type":"road"}
];

const buildingContributions = {
  'residential': { wellbeing: { base: 0.5, perLevel: 0.5 }, health: { base: -0.2, perLevel: 0.1 } },
  'commercial': { wellbeing: { base: 1, perLevel: 0.5 }, health: { base: -0.1, perLevel: 0.1 } },
  'farming': { wellbeing: { base: 1.5, perLevel: 0.5 }, health: { base: 1, perLevel: 0.5 }, sustainability: { base: 2, perLevel: 1 } },
  'textile-factory': { wellbeing: { base: 0.5, perLevel: 0.5 }, health: { base: -1, perLevel: -0.5 }, sustainability: { base: -1.5, perLevel: 0 } },
  'technology-factory': { wellbeing: { base: 1, perLevel: 0.5 }, education: { base: 0.5, perLevel: 0.5 }, health: { base: -0.8, perLevel: -0.3 }, sustainability: { base: -1, perLevel: 0 } },
  'steel-factory': { wellbeing: { base: 0.5, perLevel: 0.5 }, health: { base: -1.5, perLevel: -1 }, sustainability: { base: -2, perLevel: 0 } },
  'automotive-factory': { wellbeing: { base: 1, perLevel: 0.5 }, education: { base: 0.5, perLevel: 0.2 }, health: { base: -1, perLevel: -0.5 }, sustainability: { base: -1.5, perLevel: 0 } },
  'recycling-center': { wellbeing: { base: 1, perLevel: 0.5 }, health: { base: 2, perLevel: 1 }, sustainability: { base: 8, perLevel: 3 } },
  'school': { education: { base: 5, perLevel: 3 } },
  'hospital': { health: { base: 8, perLevel: 4 } },
  'park': { wellbeing: { base: 0.5, perLevel: 0 }, health: { base: 0.2, perLevel: 0 }, sustainability: { base: 0.2, perLevel: 0 } },
  'awareness-center': { education: { base: 4, perLevel: 2 }, sustainability: { base: 2, perLevel: 1 } },
  'mrf': { sustainability: { base: 4, perLevel: 2 } },
  'water-treatment': { sustainability: { base: 3, perLevel: 1.5 } },
  'solar-panel': { wellbeing: { base: 1, perLevel: 0.5 }, health: { base: 1, perLevel: 0.5 }, sustainability: { base: 5, perLevel: 2 } },
  'wind-turbine': { wellbeing: { base: 1, perLevel: 0.5 }, health: { base: 1.5, perLevel: 0.5 }, sustainability: { base: 6, perLevel: 2.5 } },
  'hydro-plant': { wellbeing: { base: 1.5, perLevel: 1 }, health: { base: 1, perLevel: 0.5 }, sustainability: { base: 5, perLevel: 2 } },
  'waste-to-energy': { wellbeing: { base: 1, perLevel: 0.5 }, health: { base: -0.5, perLevel: 0.3 } }
};

function calculateScores(buildings) {
  let w = 0, h = 60, s = 0, resCount=0, commCount=0, pubCount=0, factCount=0;
  for(const b of buildings) {
    if(b.type === 'road') continue;
    const c = buildingContributions[b.type];
    if(c) {
      if(c.wellbeing) w += c.wellbeing.base;
      if(c.health) h += c.health.base;
      if(c.sustainability) s += c.sustainability.base;
    }
    if(b.type === 'residential') resCount++;
    if(b.type === 'commercial') commCount++;
    if(['hospital','school'].includes(b.type)) pubCount++;
    if(['textile-factory','technology-factory','steel-factory','automotive-factory'].includes(b.type)) factCount++;
  }
  if (resCount > 0 && commCount > 0) w += 5;
  if (pubCount > 0) w += 3;
  return { w, h, s };
}

function processScenario1() {
  // Scenario 1: Waste Crisis
  // Base map but very few clean energies
  let layout = JSON.parse(JSON.stringify(baseGrid));
  let solarKept = 0;
  layout = layout.filter(b => {
    if (['solar-panel', 'wind-turbine'].includes(b.type)) {
      if(solarKept < 3) {
        solarKept++;
        b.type = 'solar-panel'; // Convert any kept wind to solar just in case
        return true;
      }
      return false; // remove others
    }
    return true;
  });
  console.log("Scenario 1 Scores:", calculateScores(layout));
  return layout;
}

function processScenario2() {
  // Resource Scarcity
  // Remove most factories and parks to force the player to build them from scratch.
  let layout = JSON.parse(JSON.stringify(baseGrid));
  
  let recy = 0;
  let renewablesKept = 0;
  
  layout = layout.filter(b => {
    if(b.type === 'textile-factory') {
      if (recy === 0) {
        b.type = 'recycling-center';
        recy++;
        return true;
      }
      return false; // delete others
    } else if (b.type === 'park' || b.type === 'solar-panel' || b.type === 'wind-turbine') {
      if ((b.type === 'solar-panel' || b.type === 'wind-turbine') && renewablesKept < 9) {
        renewablesKept++;
        return true;
      }
      // Remove all parks and extra renewables so they start poor
      return false; 
    }
    return true;
  });
  
  console.log("Scenario 2 Scores:", calculateScores(layout));
  return layout;
}

function processScenario3() {
  // Scenario 3: Industrial Transition
  // Replace all renewable and parks with steel/automotive. Keep some residentials.
  let layout = JSON.parse(JSON.stringify(baseGrid));
  let steel = 0;
  
  layout.forEach(b => {
    if(['solar-panel', 'wind-turbine', 'park'].includes(b.type)) {
      if (steel % 4 === 0) {
        b.type = 'hospital'; // We need SOME health so they don't immediately die
      } else {
        b.type = steel % 2 === 0 ? 'steel-factory' : 'automotive-factory';
      }
      steel++;
    } else if (b.type === 'textile-factory') {
      b.type = 'steel-factory';
    }
  });
  
  // Let's verify health
  const scores = calculateScores(layout);
  if (scores.h < 35) {
      console.log("WARNING: Scenario 3 Health too low!! Adding a hospital");
      const badFactoryIndex = layout.findIndex(b => ['steel-factory','automotive-factory'].includes(b.type));
      if (badFactoryIndex > -1) {
          layout[badFactoryIndex].type = 'hospital';
      }
  }
  if (scores.w < 35) {
      console.log("WARNING: Scenario 3 Wellbeing too low!! Adding commercial");
      const badFactoryIndex = layout.findIndex(b => ['steel-factory','automotive-factory'].includes(b.type));
      if (badFactoryIndex > -1) {
          layout[badFactoryIndex].type = 'commercial';
      }
  }

  console.log("Scenario 3 Scores Final:", calculateScores(layout));
  return layout;
}

const s1 = processScenario1();
const s2 = processScenario2();
const s3 = processScenario3();

// Now we need to inject them into scenarioSystem.js
function replaceScenarioData(scenarioId, newData) {
    const startMarkerStr = `id: '${scenarioId}',`;
    const startTag = 'prebuiltBuildings: [';
    const endTag = '],';
    
    let scenarioIndex = scenarioCode.indexOf(startMarkerStr);
    if(scenarioIndex === -1) { 
        console.log("Could not find", scenarioId);
        return;
    }
    
    const startIndex = scenarioCode.indexOf(startTag, scenarioIndex);
    if(startIndex === -1) return;
    
    const endIndex = scenarioCode.indexOf(endTag, startIndex);
    if(endIndex === -1) return;
    
    const formattedData = newData.map(x => '          ' + JSON.stringify(x)).join(',\\n');
    const replacement = startTag + '\\n' + formattedData + '\\n        ],';
    
    scenarioCode = scenarioCode.substring(0, startIndex) + replacement + scenarioCode.substring(endIndex + endTag.length);
}

replaceScenarioData('waste-crisis', s1);
replaceScenarioData('resource-scarcity', s2);
replaceScenarioData('industrial-transition', s3);

fs.writeFileSync(scenarioSystemPath, scenarioCode, 'utf8');
console.log('Saved scenarioSystem.js!');
