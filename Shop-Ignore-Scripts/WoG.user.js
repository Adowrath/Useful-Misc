// ==UserScript==
// @name         Shop Ignore Compatibility - WoG
// @version      v1.0
// @description  Compatibility for my Shop Ignore extension. Unlikely to be useful to anyone else.
// @author       Adowrath
// @match        https://www.wog.ch/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wog.com
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
        pattern: /^\/index\.cfm\/details\/product\//,
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
                    div.product-highlight:has(> article              > a[href*=\"index.cfm/details\"]):not(.processed),
                    div.horizontal-scroller__product-slide:has(        a[href*=\"index.cfm/details\"].product-tile__tile-link) > div.product-tile:not(.processed),
                    div.product-tile:has(> div.product-tile__content > a[href*=\"index.cfm/details\"].product-tile__tile-link):not(.processed),

                     :not( .product-detail-header__rating
                    , .footer__link-item, #ratings
                    , .product-tile__badge-container
                    , .product-tile__subtitle
                    ) >
                    a:not( [href*="index.cfm/details"]
                        , [href*="index.cfm/my"]
                        , [href*="index.cfm/home"]
                        , [href*="index.cfm/logout"]
                        , [href*="index.cfm/login/"]
                        , [href*="index.cfm/cart"]
                        , [href*="/mainProductsOnly"]
                        , [href*="index.cfm/search/type/"][href*="/term/"]
                        , [href*="index.cfm/search/searchTerm/"]
                        , .sidenav__link, .sidenav__firstlevel-element
                        , .header-toolbar__link, .header-toolbar__language-link
                        , [href$="/index.cfm/home"], .breadcrumb__link
                        , .product-detail-header__wog-tip
                        , .product-detail-header__rating-stars
                        , [href*="/productRating"]
                        , [href*="/charts/"]
                    ):not(._si_checked_)
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
    createFloatingMenu("WoG+", "rgb(55 65 119)", "rgb(79 81 141)", routes);
    await sleep(2000);
})();
