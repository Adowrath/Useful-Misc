// ==UserScript==
// @name         Sort Buttons for Todo List
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds Sort Buttons to the Paimon.moe Todo List that can sort the list entries by increasing
// @author       Adowrath
// @match        https://paimon.moe/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=paimon.moe
// @grant        none
// ==/UserScript==

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const THRESHOLD_LOG_CACHE_LIMIT = 2;
let thresholdLogCache = [];
function tLog(...args) {
    if(thresholdLogCache?.length < THRESHOLD_LOG_CACHE_LIMIT) {
        thresholdLogCache.push(args);
        return;
    }
    if(thresholdLogCache?.length >= THRESHOLD_LOG_CACHE_LIMIT) {
        for(let cachedArgs of thresholdLogCache) {
            console.log(...cachedArgs);
        }
        thresholdLogCache = undefined;
    }
    console.log(...args);
}
function restoreTLogCache() { thresholdLogCache = []; }

async function sortCharacters() {
    let itemTexts = [...document.querySelectorAll(".text-gray-500")]
        .filter(e => e.innerText.startsWith("Level "))
        .map((e, i) => {
            let [_, startLevel, endLevel] = e.innerText.match(/^Level (\d+)-(\d+)$/);

            return {
                name: e.closest(".flex").querySelector(".font-bold").innerText,
                startLevel: +startLevel,
                endLevel: +endLevel,
                currentPosition: i,
                levelChanged: +startLevel !== +endLevel
            };
        })
        .sort((a, b) => (!a.levelChanged && b.levelChanged) ? -1 : // a is earlier if its level didn't change but b's did
                        (a.levelChanged && !b.levelChanged) ? 1 : // a is later if its level changed but b's didn't
                        a.startLevel < b.startLevel ? -1 :
                        a.startLevel > b.startLevel ? 1 :
                        a.name.localeCompare(b.name)
             )
        .map((e, i) => {
            e.positionChange = Math.abs(e.currentPosition - i);
            e.finalPosition = i;
            return e;
        })
        .sort((a, b) => a.positionChange < b.positionChange ? -1 :
                        a.positionChange > b.positionChange ? 1 :
                        0
             );

    function nextMove(name, startLevel, endLevel, expectedIndex) {
        tLog(name, startLevel, "to", expectedIndex);
        let header = [...document.querySelectorAll("h1")].filter(e => e.innerText === 'Todo List')[0];
        let container = header.parentElement;

        let allItems = [...container.querySelectorAll(".flex")].filter(e => e.innerText.indexOf("Level") !== -1).map((e, i) => [e, i]);

        let item = allItems.filter(e =>
            e[0].querySelector(".font-bold")?.innerText === name &&
            e[0].querySelector(".text-gray-500")?.innerText?.startsWith(`Level ${startLevel}-${endLevel}`)
        )[0];

        if(item[1] === expectedIndex) {
            tLog("Already in final position");
            return false;
        }
        let btn;
        if(item[1] < expectedIndex) {
            tLog(`Moving from ${item[1]}, +1`);
            btn = item[0].querySelector(".rounded-r-xl");
        } else {
            tLog(`Moving from ${item[1]}, -1`);
            btn = item[0].querySelector(".rounded-l-xl");
        }
        btn.click();
        return true;
    }

    let done = 0, moves = 0;
    for(let {name, startLevel, endLevel, finalPosition} of itemTexts) {
        while(nextMove(name, startLevel, endLevel, finalPosition)) {
            moves++;
            await sleep(10);
        }
        restoreTLogCache();
        console.log(`%cDone with ${++done}/${itemTexts.length}`, "font-size: 1.5em; margin-left: 35%;");
    }
    console.log(`%cNecessary moves: ${moves}`, "font-size: 2em;");
}

function sortTodoListItems() {
    let table = document.querySelector("table.w-full");
    let fixed =
      { "Mora":                    90_000_000_000

      , "Hero's Wit":              89_000_000_000
      , "Adventurer's Experience": 88_000_000_000
      , "Wanderer's Advice":       87_000_000_000

        // Pyro
      , "Agnidus Agate Gemstone": 79_900_000_000
      , "Agnidus Agate Chunk":    79_800_000_000
      , "Agnidus Agate Fragment": 79_700_000_000
      , "Agnidus Agate Sliver":   79_600_000_000
      , "Smoldering Pearl":       79_500_000_000        // Cube
      , "Everflame Seed":         79_400_000_000        // Plant
       
        // Hydro
      , "Varunada Lazurite Gemstone": 78_900_000_000
      , "Varunada Lazurite Chunk":    78_800_000_000
      , "Varunada Lazurite Fragment": 78_700_000_000
      , "Varunada Lazurite Sliver":   78_600_000_000
      , "Dew of Repudiation":         78_500_000_000    // Cube
                                                        // Plant
      , "Cleansing Heart":            78_300_000_000    // Oceanid
       
        // Dendro
      , "Nagadus Emerald Gemstone": 77_900_000_000
      , "Nagadus Emerald Chunk":    77_800_000_000
      , "Nagadus Emerald Fragment": 77_700_000_000
      , "Nagadus Emerald Sliver":   77_600_000_000
      , "Quelled Creeper":          77_500_000_000      // Cube
                                                        // Plant
      , "Majestic Hooked Beak":     77_300_000_000      // Bird
       
        // Electro
      , "Vajrada Amethyst Gemstone": 76_900_000_000
      , "Vajrada Amethyst Chunk":    76_800_000_000
      , "Vajrada Amethyst Fragment": 76_700_000_000
      , "Vajrada Amethyst Sliver":   76_600_000_000
      , "Lightning Prism":           76_500_000_000     // Cube
      , "Thunderclap Fruitcore":     76_400_000_000     // Plant
      , "Storm Beads":               76_300_000_000     // Bird
       
        // Anemo
      , "Vayuda Turquoise Gemstone": 75_900_000_000
      , "Vayuda Turquoise Chunk":    75_800_000_000
      , "Vayuda Turquoise Fragment": 75_700_000_000
      , "Vayuda Turquoise Sliver":   75_600_000_000
      , "Hurricane Seed":            75_500_000_000     // Cube
                                                        // Plant
       
        // Cryo
      , "Shivada Jade Gemstone": 74_900_000_000
      , "Shivada Jade Chunk":    74_800_000_000
      , "Shivada Jade Fragment": 74_700_000_000
      , "Shivada Jade Sliver":   74_600_000_000
      , "Crystalline Bloom":     74_500_000_000         // Cube
      , "Hoarfrost Core":        74_400_000_000         // Plant
       
        // Geo
      , "Prithiva Topaz Gemstone": 73_900_000_000
      , "Prithiva Topaz Chunk":    73_800_000_000
      , "Prithiva Topaz Fragment": 73_700_000_000
      , "Prithiva Topaz Sliver":   73_600_000_000
      , "Basalt Pillar":           73_500_000_000       // Cube
                                                        // Plant
      , "Runic Fang":              73_300_000_000       // Ruin Serpent

        // Mixed Bosses
      , "Juvenile Jade":             72_900_000_000
      , "Marionette Core":           72_800_000_000
      , "Perpetual Heart":           72_700_000_000
      , "Perpetual Caliber":         72_600_000_000
      , "Light Guiding Tetrahedron": 72_500_000_000

        // Slime
      , "Slime Concentrate": 69_900_000_000
      , "Slime Secretions":  69_800_000_000
      , "Slime Condensate":  69_700_000_000

        // All Hilichurls
      , "Ominous Mask": 68_900_000_000
      , "Stained Mask": 68_800_000_000
      , "Damaged Mask": 68_700_000_000

        // Samachurls (Staff mages)
      , "Forbidden Curse Scroll": 67_900_000_000
      , "Sealed Scroll":          67_800_000_000
      , "Divining Scroll":        67_700_000_000

        // Hilichurl Shooters
      , "Weathered Arrowhead": 66_900_000_000
      , "Sharp Arrowhead":     66_800_000_000
      , "Firm Arrowhead":      66_700_000_000

        // Mitachurls and Lawachurls (Big Bois)
      , "Black Crystal Horn": 65_900_000_000
      , "Black Bronze Horn":  65_800_000_000
      , "Heavy Horn":         65_700_000_000

        // Abyss Mages (Shielded mages) & Abyss Lectors and Heralds
      , "Ley Line Sprout":      64_900_000_000
      , "Dead Ley Line Leaves": 64_800_000_000
      , "Dead Ley Line Branch": 64_700_000_000
        // Humanoid Ruined Machines
      , "Chaos Core":    63_900_000_000
      , "Chaos Circuit": 63_800_000_000
      , "Chaos Device":  63_700_000_000
        // Fatui Cicin Mages
      , "Mist Grass Wick":   62_900_000_000
      , "Mist Grass":        62_800_000_000
      , "Mist Grass Pollen": 62_700_000_000
        // Fatui Agents
      , "Inspector's Sacrificial Knife": 61_900_000_000
      , "Agent's Sacrificial Knife":     61_800_000_000
      , "Hunter's Sacrificial Knife":    61_700_000_000
        // Fatui enemies (except Mirror Maiden)
      , "Lieutenant's Insignia": 60_900_000_000
      , "Sergeant's Insignia":   60_800_000_000
      , "Recruit's Insignia":    60_700_000_000
        
      , "Golden Raven Insignia":     59_900_000_000
      , "Silver Raven Insignia":     59_800_000_000
      , "Treasure Hoarder Insignia": 59_700_000_000

      , "Energy Nectar":        58_900_000_000
      , "Shimmering Nectar":    58_800_000_000
      , "Whopperflower Nectar": 58_700_000_000

      , "Fossilized Bone Shard": 57_900_000_000
      , "Sturdy Bone Shard":     57_800_000_000
      , "Fragile Bone Shard":    57_700_000_000

      , "Famed Handguard":    56_900_000_000
      , "Kageuchi Handguard": 56_800_000_000
      , "Old Handguard":      56_700_000_000

      , "Chaos Oculus": 55_900_000_000
      , "Chaos Axis":   55_800_000_000
      , "Chaos Gear":   55_700_000_000

      , "Polarizing Prism": 54_900_000_000
      , "Crystal Prism":    54_800_000_000
      , "Dismal Prism":     54_700_000_000

      , "Spectral Nucleus": 53_900_000_000
      , "Spectral Heart":   53_800_000_000
      , "Spectral Husk":    53_700_000_000

      , "Concealed Talon":  52_900_000_000
      , "Concealed Unguis": 52_800_000_000
      , "Concealed Claw":   52_700_000_000

      , "Deathly Statuette": 51_900_000_000
      , "Dark Statuette":    51_800_000_000
      , "Gloomy Statuette":  51_700_000_000

      , "Crystalline Cyst Dust": 50_900_000_000
      , "Luminescent Pollen":    50_800_000_000
      , "Fungal Spores":         50_700_000_000

      , "Robust Fungal Nucleus":      49_900_000_000
      , "Dormant Fungal Nucleus":     49_800_000_000
      , "Inactivated Fungal Nucleus": 49_700_000_000

      , "Rich Red Brocade": 48_900_000_000
      , "Trimmed Red Silk": 48_800_000_000
      , "Faded Red Satin":  48_700_000_000

      , "Chaos Bolt":    47_900_000_000
      , "Chaos Module":  47_800_000_000
      , "Chaos Storage": 47_700_000_000

      , "Radiant Prism": 46_900_000_000
      , "Turbid Prism":  46_800_000_000
      , "Damaged Prism": 46_700_000_000
      };
    let items =
      [...table.querySelectorAll("tr:not(:has(span.line-through))")]
        .map(e => [ e
                  , fixed[e.querySelector("td:last-child .text-white:first-child").innerText.trim()]
                    ?? +e.querySelector(".text-right")
                         .innerText
                         .replaceAll(/[, ]/g, '')
                  ])
        .sort((a,b) => a[1] < b[1] ? 1 : -1)
    for(let item of items) {
        table.appendChild(item[0]);
    }
}

function insertSortButtons() {
    let resinElement = document.querySelector(".rounded-xl.bg-background:has(img[alt=\"Resin\"i])");
    if(!resinElement) return false; // Not yet ready

    let rowContainer = document.createElement("div");
    rowContainer.classList.add("flex", "items-center", "justify-center", "mb-2", "gap-1");

    const makeButton = (innerText, clickHandler) => {
        let button = document.createElement("button");
        button.classList.add("text-white",
                             "border-2", "border-white", "border-opacity-25",
                             "rounded-xl",
                             "px-2", "py-1",
                             "transition", "duration-100", "hover:border-primary",
                             "focus:border-primary", "focus:outline-none",
                             "disabled:opacity-50", "disabled:border-gray-600");
        button.innerText = innerText;
        button.addEventListener("click", async () => {
            try {
                button.disabled = true;
                await sleep(0);
                await clickHandler();
            } finally {
                button.disabled = false;
            }
        });
        return button;
    };

    rowContainer.appendChild(makeButton("Sort Items", sortTodoListItems));
    rowContainer.appendChild(makeButton("Sort Characters", sortCharacters));

    resinElement.insertAdjacentElement("afterend", rowContainer);

    return true;
}


(function() {
    'use strict';

    let lastLocation = undefined;
    setInterval(() => {
        if(lastLocation !== location.href) {
            if(location.pathname === "/todo") {
                if(insertSortButtons()) {
                    lastLocation = location.href;
                }
            } else {
                lastLocation = location.href;
            }
        }
    }, 1000);
})();
