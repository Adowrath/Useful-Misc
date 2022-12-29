// ==UserScript==
// @name         Exact view and date in Description
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fixes up inexact view count and dates in collapsed Descriptions on YouTube.
// @author       Adowrath
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function query(q, ctx) {
        return [...(ctx ?? document).querySelectorAll(q)];
    }

    setInterval(() => {
        try {
          let [aufrufe, datum] =
                query("#description-inner tp-yt-paper-tooltip")
                    .filter(e => e.textContent)[0]
                    .textContent.trim()
                    .split("•").map(e => e.trim());

            let viewDateInfoBox = document.querySelector("#description-inner #info");

            viewDateInfoBox.children[0].innerText = aufrufe;
            viewDateInfoBox.children[2].innerText = datum;
        } catch(e) {}
    }, 1000 * 5);
})();
