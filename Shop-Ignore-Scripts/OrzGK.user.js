// ==UserScript==
// @name         Shop Ignore Compatibility - OrzGK
// @version      v1.1
// @description  Compatibility for my Shop Ignore extension. Unlikely to be useful to anyone else.
// @author       Adowrath
// @match        https://www.orzgk.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=orzgk.com
// @require      https://raw.githubusercontent.com/Adowrath/Useful-Misc/refs/heads/main/Shop-Ignore-Scripts/Framework.js
// @downloadURL  https://raw.githubusercontent.com/Adowrath/Useful-Misc/refs/heads/main/Shop-Ignore-Scripts/OrzGK.user.js
// @grant        window.close
// ==/UserScript==

"use strict";

const routes = [
    {
        pattern: [
            /^\/product-category\//,
            /^\/shop\//,
            /^\/ostatus\//,
            /^\/brand\//,
        ],
        ...titleChanger(async () => {
            while(true) {
                let resultElem = document.querySelector(".woocommerce-result-count");
                if(resultElem) {
                    let resultText = resultElem.textContent.trim();
                    let total = /^Showing \d+–\d+ of (\d+) results/.exec(resultText)?.[1]
                    ?? /^Showing all (\d+) results/.exec(resultText)?.[1];

                    return `[Search: ${formatNumber(total)}] ${document.title}`;
                }
                await sleep(1000);
            }
        }),
        menuItems: [{
            text: "Check and Close",
            async action(event, cb) {
                let productElems = [...document.querySelectorAll(".col-inner .product-small")];

                let unprocessed = () => productElems.filter(e => !e.classList.contains("processed"));
                let loadMore = () => [...document.querySelectorAll(".fibofilters-show-more")].filter(e => e.textContent.trim() === "Show more products");
                cb(`Check and Close: ${unprocessed().length}`);

                if(event.ctrlKey) {
                    while(true) {
                        while(unprocessed().length > 0) {
                            await sleep(100);
                        }
                        let resultText = document.querySelector(".woocommerce-result-count").textContent.trim();
                        if(!/^Showing \d+–(\d+) of \1 results/.test(resultText)
                           && !/^Showing all \d+ results/.test(resultText)) {
                            while(loadMore().length === 0) await sleep(100);
                        }

                        let loadMoreButtons = loadMore();
                        if(loadMoreButtons.length === 0) {
                            await sleep(5000);
                            let loadMoreButtons = loadMore();
                        }
                        if(loadMoreButtons.length > 0) {
                            if(location.pathname.indexOf("/page/") !== -1) {
                                location.href = location.href.replace(/\/page\/(\d+)\//, (_, page) => `/page/${+page + 1}/`);
                                return;
                            } else {
                                let lastLocation = location.href;
                                loadMoreButtons[0].click();
                                while(document.querySelector(".fibofilters-product-placeholder") !== null) {
                                    await sleep(100);
                                }
                                while(lastLocation === location.href) {
                                    await sleep(100);
                                }
                                continue;
                            }
                        }
                        break;
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
        pattern: /^\/product\//,
        ...titleChanger(() => `[Product: TODO] ${document.title}`),
        menuItems: [{
            text: "Ignore and Close",
            async action(event, cb) {
                let ignoreBtn = document.querySelector(".btn-ignore");

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
    {
        pattern: /^\/$/,
        ...titleChanger(() => `[Startpage] ${document.title}`),
    },
];



(async function () {
    'use strict';

    // Your code here...
    createFloatingMenu("OrzGK+", "#131517", "#333537", routes);
    await sleep(2000);
    if(!routes[0].pattern.every(p => !p.test(location.pathname))) {
        routes[0].menuItems[0].action.call(routes[0], { ctrlKey: true }, () => {});
    }
})();
