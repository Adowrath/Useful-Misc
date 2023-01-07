// ==UserScript==
// @name         Filter Unstarted Games
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a filter option to remove any F-Rank/Unstarted games
// @author       You
// @match        https://psnprofiles.com/*
// @icon         https://psnprofiles.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function setHidden(element) {
        element.style.display = 'none';
    }
    function resetHidden(element) {
        element.style.display = '';
    }

    const modes = {
        started: {
            text: 'Started',
            hides(fRank, sRank) {
                return fRank;
            }
        },
        unstarted: {
            text: 'Unstarted',
            hides(fRank, sRank) {
                return !fRank;
            }
        },
        in_progress: {
            text: 'In Progress',
            hides(fRank, sRank) {
                return fRank || sRank;
            }
        }
    };

    function runFilter(mode) {
        let count = 0;
        for(let element of document.querySelectorAll('table#gamesTable tr')) {
            let fRank = element.querySelector('.game-rank.F') !== null;
            let sRank = element.querySelector('.game-rank.S') !== null;

            if(modes[mode].hides(fRank, sRank)) {
                setHidden(element);
            } else {
                resetHidden(element);
                count++;
            }
        }

        let counter = document.querySelector('#content > div > div.col-xs-8 > div.title > div > h3');
        if(counter) counter.innerText = `Games (${count}${counter.innerText.indexOf('+') !== -1 ? '+' : ''})`;

        document.querySelector('a.dropdown-toggle.completion').innerText = `Completion (${modes[mode].text})`;
        document.querySelector('a.dropdown-toggle.completion').parentElement.classList.remove('open');
    }

    function makeMenuItem(mode) {
        let filter = document.createElement('li');
        filter.style.backgroundColor = '#e0e0e0';

        let filterLink = document.createElement('a');

        filterLink.href = '#';
        filterLink.rel = 'nofollow';
        filterLink.innerText = modes[mode].text;

        filterLink.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            runFilter(mode);
        });

        filter.appendChild(filterLink);

        return filter;
    }

    const EXISTING_FILTERS = 6;
    const ADDED_FILTERS = Object.keys(modes).length;

    setInterval(() => {
        let dropDownMenu = document.querySelector('.dropdown:has(a.dropdown-toggle.completion) ul.dropdown-menu');

        if(!dropDownMenu || dropDownMenu.childElementCount === EXISTING_FILTERS + ADDED_FILTERS) return;

        dropDownMenu.lastElementChild.insertAdjacentElement('beforebegin', makeMenuItem('started'));
        dropDownMenu.lastElementChild.insertAdjacentElement('beforebegin', makeMenuItem('in_progress'));
        dropDownMenu.lastElementChild.insertAdjacentElement('beforebegin', makeMenuItem('unstarted'));
    }, 100);
})();
