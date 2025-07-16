// ==UserScript==
// @name         Save and Load Buttons
// @namespace    http://tampermonkey.net/
// @version      v1.0
// @description  Adds Save/Load Buttons to the Purity Test Questions so you don't have to redo them from scratch every time.
// @author       Adowrath
// @match        https://ricepuritytest.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ricepuritytest.com
// @downloadURL  https://github.com/Adowrath/Useful-Misc/raw/main/RicePurityTest.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.gtag = () => {};

    const makeButton = (text, cb) => {
        let btn = document.createElement("button");
        btn.textContent = text;
        btn.classList.add("button");
        btn.addEventListener("click", cb);
        return btn;
    };

    const saveButton = makeButton("Save Data", () => {
        let boxes = [...document.querySelectorAll("input[type=\"checkbox\"]")];
        let checks = boxes.map(box => box.checked);

        localStorage.setItem("CHECKED_BOXES", JSON.stringify(checks));
    });
    const loadButton = makeButton("Load Data", () => {
        let boxes = [...document.querySelectorAll("input[type=\"checkbox\"]")];
        let checks = JSON.parse(localStorage.getItem("CHECKED_BOXES"));

        boxes.forEach((box, i) => {
            box.checked = checks[i];
        });
    });

    document.querySelector("#reset").insertAdjacentElement("afterend", saveButton);
    saveButton.insertAdjacentElement("afterend", loadButton);
})();
