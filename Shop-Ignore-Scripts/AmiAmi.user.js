// ==UserScript==
// @name         Shop Ignore Compatibility
// @version      v1.0
// @description  Compatibility for my Shop Ignore extension. Unlikely to be useful to anyone else.
// @author       Adowrath
// @match        https://www.amiami.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amiami.com
// @require      https://raw.githubusercontent.com/Adowrath/Useful-Misc/refs/heads/main/Shop-Ignore-Scripts/Framework.js
// @grant        window.close
// ==/UserScript==

"use strict";

const routes = [
    {
        pattern: [
            /^\/eng\/search\//,
        ],
        ...titleChanger(async () => {
            try {
                let result = await (await fetch(`http://localhost:4001/search${location.search}&page=0`, {
                    "body": null,
                    "method": "GET",
                    "mode": "cors",
                    "credentials": "omit"
                })).json();

                return `[Search: ${formatNumber(result.Search.total_results)}] ${document.title}`;
            } catch(e) {
                console.log(e);
                alert("Error fetching total results! " + e);
                location.reload();
            }
        }),
        menuItems: [{
            text: "Check and Close",
            async action(event, cb) {
                alert("Nothing");
                return;
                let productElems = [...document.querySelectorAll(".col-inner .product-small")];

                let unprocessed = () => productElems.filter(e => !e.classList.contains("processed"));
                cb(`Check and Close: ${unprocessed().length}`);

                if(event.ctrlKey) {
                    while(unprocessed().length > 0) {
                        await sleep(100);
                    }
                }

                if(unprocessed().length === 0) {
                    await sleep(2000);
                    window.close();
                    await sleep(5000);
                    alert("Tried to close tab, was unsuccessful!");
                }
            }
        }],
    },
    {
        pattern: /^\/eng\/detail\//,
        ...titleChanger(() => `[Product: TODO] ${document.title}`),
        menuItems: [{
            text: "Ignore and Close",
            async action(cb) {
                let ignoreBtn = document.querySelector(".btn-ignore button");

                while(true) {
                    while(ignoreBtn.disabled) {
                        await sleep(100);
                    }

                    if(ignoreBtn.textContent === "Unignore Item") {
                        break;
                    }

                    ignoreBtn.click();
                    await sleep(100);
                }

                await sleep(2000);
                window.close();
                await sleep(5000);
                alert("Tried to close tab, was unsuccessful!");
            }
        }],
    },
];

(async function () {
    'use strict';

    // Your code here...
    createFloatingMenu("AmiAmi+", "#ea5b04", "#e37b3c", routes);
    await sleep(2000);
})();
