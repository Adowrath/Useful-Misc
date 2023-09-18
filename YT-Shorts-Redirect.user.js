// ==UserScript==
// @name         YT Shorts Redirect
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Rewrites and redirects from YouTube Shorts links
// @author       Adowrath
// @icon         https://www.youtube.com/favicon.ico
// @match        *://*.youtube.com/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://github.com/Adowrath/Useful-Misc/raw/main/YT-Shorts-Redirect.user.js
// ==/UserScript==

'use strict';

const shortToWatch = (url) => {
    let urlObject = new URL(url);
    let matchResult = urlObject.pathname.match(/^\/shorts\/([\w\-]+)$/);
    if(matchResult !== null) {
        urlObject.pathname = "/watch"
        urlObject.searchParams.set("v", matchResult[1]);
    }
    return urlObject.toString();
};

const fixElement = (elem) => {
    if(elem instanceof HTMLAnchorElement && elem.href !== "") {
        let newHref = shortToWatch(elem.href);
        if(newHref !== elem.href) {
            elem.href = newHref;
        }
    }
};

let cachedLocation = null;
const locationChanged = (newLocation) => {
    cachedLocation = newLocation;
    const fixedLocation = shortToWatch(cachedLocation);
    if(fixedLocation !== cachedLocation) {
        location.replace(fixedLocation);
    }
};
locationChanged(location.href);

window.addEventListener("load", () => {
    const observer = new MutationObserver((mutations, obs) => {
        if(location.href !== cachedLocation) {
            locationChanged(location.href);
        }

        for(const mutation of mutations) {
            switch(mutation.type) {
                case 'childList':
                    for(const elem of mutation.addedNodes) fixElement(elem);
                    break;
                case 'attributes':
                    fixElement(mutation.target);
                    break;
            }
        }
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: [ 'href' ],
        childList: true,
        subtree: true
    });

    for(let element of document.querySelectorAll("a")) {
        fixElement(element);
    }
});
