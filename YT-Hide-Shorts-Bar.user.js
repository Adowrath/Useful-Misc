// ==UserScript==
// @name         YT Hide Shorts in subscription page
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Hides the Shorts bar from your subcription page
// @author       Midtan
// @icon         https://www.youtube.com/favicon.ico
// @match        *://*.youtube.com/feed/subscriptions*
// @run-at       document-start
// @grant        none
// @downloadURL  https://github.com/Adowrath/Useful-Misc/raw/main/YT-Hide-Shorts-Bar.user.js
// ==/UserScript==

'use strict';

window.addEventListener("yt-service-request-completed", () => {
  document.querySelectorAll(`
     ytd-rich-section-renderer:has(ytd-rich-shelf-renderer),
     ytd-item-section-renderer:has(ytd-reel-shelf-renderer)
  `).forEach(shelf => shelf.style.display = 'none');
});
