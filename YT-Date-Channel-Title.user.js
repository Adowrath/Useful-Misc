// ==UserScript==
// @name         Date and Channel in Title
// @namespace    http://tampermonkey.net/
// @version      v1.3
// @description  Adds Date and Channel to the tab's title
// @author       Adowrath
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @downloadURL  https://github.com/Adowrath/Useful-Misc/raw/main/YT-Date-Channel-Title.user.js
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    const nonePolicy = trustedTypes.createPolicy("none", {
        createHTML: (string) => string,
    });
    let parser = new DOMParser();

    async function findTitle() {
        let docContent = await (await fetch(location.href)).text();
        let docHtml = nonePolicy.createHTML(docContent);
        let doc = parser.parseFromString(docHtml, "text/html");

        let channel;
        let date;
        let title;

        let videoObject = doc.querySelector(`div[itemtype*="http://schema.org/VideoObject"]`);
        if(videoObject === null) {
            /*
            let schemaElements =
                [...doc.querySelectorAll("*[type=\"application/ld+json\"]")]
                    .filter(e => e.textContent.indexOf(`{"@context":"https://schema.org"`) !== -1);
            if(schemaElements.length !== 1) {
                return "";
            }

            let schema = JSON.parse(schemaElements[0].textContent);

            channel = "?Unknown?";
            date = schema.uploadDate.split("T")[0];
            title = schema.name;
            */
            return "";
        } else {
            let datePublished = videoObject.querySelector(`[itemprop="datePublished"]`).content;
            let uploadDate = videoObject.querySelector(`[itemprop="uploadDate"]`).content;

            if(datePublished !== uploadDate) throw new Error("Incompatible dates");

            channel = videoObject.querySelector(`[itemprop="author"] [itemprop="name"]`).getAttribute("content");
            date = datePublished.split("T")[0];
            title = videoObject.querySelector(`[itemprop="name"]`).content;
        }

        return `[${date}] - [${channel}] - ${title}`;
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    while(true) {
        await sleep(100);
        let loc = location.href;

        if(location.pathname !== "/watch") {
            await sleep(1000 * 5);
            continue;
        }
        let title;
        try {
            title = await findTitle();
            if(title === "") {
                await sleep(1000);
                continue;
            }
        } catch(e) {
            console.error(e);
            alert("Error!");
            continue;
        }
        while(true) {
            if(location.href !== loc) break;
            if(document.title !== title) document.title = title;
            await sleep(100);
        }
    }
})();
