// ==UserScript==
// @name         Shop Ignore Compatibility - Figuya
// @version      v1.3
// @description  Compatibility for my Shop Ignore extension. Unlikely to be useful to anyone else.
// @author       Adowrath
// @match        https://figuya.com/de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=figuya.com
// @require      https://raw.githubusercontent.com/Adowrath/Useful-Misc/refs/heads/main/Shop-Ignore-Scripts/Framework.js
// @grant        window.close
// ==/UserScript==

"use strict";

const routes = [
    {
        pattern: [
            /^\/de\/taxons\//,
        ],
        ...titleChanger(async () => {
            try {
                let { id: taxonId } = await (await fetch("https://figuya.com/storefront/taxons/abs.json?locale=de&view=show")).json();
                let { meta: {total_pages: totalItems} } = await (await fetch(`https://figuya.com/storefront/products.json?page=1&taxon_ids=${taxonId}&per=1&stock_state=sold_out%2Corder_stop%2Cpreorder%2Cbackorder%2Cstocked`)).json();

                return `[Search: ${formatNumber(totalItems)}] ${document.title}`;
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
        pattern: /^\/de\/products\//,
        ...titleChanger(async () => {
            return `[Product: ${"TODO"}] ${document.title}`;
        }),
        menuItems: [{
            text: "Ignore and Close",
            async action(event, cb) {
                let ignoreBtn = document.querySelector("button.btn-ignore");

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

                let unprocessed = () => [...document.querySelectorAll(`
                    article.chakra-linkbox:has(a):not(.processed),
                    div                   a.css-1sdhvuu:not(.processed),
                    div.chakra-linkbox:has(a):not(.processed),
                    div.css-1jlnwea:has(a):not(.processed),
                    div.css-17kswgc div.css-0:has(a):not(.processed),

                    li.chakra-wrap__listitem a[href*="/taxons/"]:not(._si_checked_)
                `)];

                if(event.ctrlKey) {
                    while(unprocessed().length > 0) {
                        await sleep(100);
                    }
                } else {
                    //unprocessed().map(e => e.querySelector("a[href*=\"/detail\"]")).forEach(e => window.open(e.href));
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
    createFloatingMenu("Figuya+", "#ea5b04", "#e37b3c", routes);
    await sleep(2000);
})();
