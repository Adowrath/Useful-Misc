"use strict";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function element(tag, clz, attrs, children) {
    let elem = document.createElement(tag);
    elem.classList = clz;
    for (let [key, val] of Object.entries(attrs)) {
        if (typeof val === 'function') {
            elem.addEventListener(key, val);
        } else {
            elem.setAttribute(key, val);
        }
    }

    if (children !== undefined) {
        elem.replaceChildren(...children);
    }

    return elem;
}

const el = new Proxy({
    img: (clz, src) => element("img", src === undefined ? '' : clz, src === undefined ? { src: clz } : { src }),
}, {
    get(target, property, receiver) {
        if (property in target) return target;

        return (clz, attrs, children) => {
            if (children === undefined) {
                if (attrs instanceof Array) {
                    [attrs, children] = [children, attrs];
                } else if (clz instanceof Array) {
                    [clz, children] = [children, clz];
                } else {
                    children = [];
                }
            }

            if (attrs === undefined) {
                if (typeof clz === "object") {
                    [clz, attrs] = [attrs, clz];
                } else {
                    attrs = {};
                }
            }

            if (clz === undefined) {
                clz = "";
            }

            return element(
                property,
                clz, attrs, children
            );
        };
    }
});

function formatNumber(num) {
    num = Number(num);
    let subThousand = num % 1000;
    let thousands = Math.floor(num / 1000);

    subThousand = subThousand.toString().padStart(3, "0");
    thousands = thousands.toString().padStart(3, "0");

    return `${thousands}'${subThousand}`;
}

async function createFloatingMenu(name, mainColor, accentColor, routes) {
    let sheet = new CSSStyleSheet();
    sheet.replaceSync(`
        #floating-menu {
            position: fixed;
            border: 1px solid ${accentColor};
            background-color: ${mainColor};
            padding: 6px;
            top: 15px;
            left: 15px;
            z-index: 1000000;
            color: white;
            border-radius: 5px;

            opacity: 0.5;
            transition: opacity 200ms ease-in;
        }
        #floating-menu:hover {
            opacity: 1;
        }
        #floating-menu .placeholder {
            display: none;
        }
        #floating-menu .placeholder:not(:has(~ .menu-group.active)) {
            display: block;
        }
        #floating-menu .menu-group:not(.active) {
            display: none;
        }
        #floating-menu .menu-item {
            padding: 5px;
            border-radius: 5px;
            margin: 2px 0;
            background-color: ${accentColor};

            cursor: pointer;
            transition: filter 250ms ease-in;
        }
        #floating-menu .menu-item:disabled {
            filter: brightness(0.7);
        }
        #floating-menu .menu-item:hover {
            filter: brightness(1.25);
        }
    `);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

    let body = document.querySelector("body");
    let menu = el.div({ id: "floating-menu" }, [
        el.b([name]),
        el.div("placeholder", [el.i(["No active route..."])])
    ]);
    body.insertAdjacentElement("beforeend", menu);

    let GROUP_ELEMENT = Symbol("GROUP_ELEMENT");
    let IS_ACTIVE = Symbol("IS_ACTIVE");

    for (let route of routes) {
        route[IS_ACTIVE] = false;
        if(route.menuItems === undefined || route.menuItems.length === 0) {
            continue;
        }
        let menuGroup = el.div("menu-group active",
            route.menuItems.map(item => {
                let elem = el.div("menu-item", {
                    async click(event) {
                        elem.disabled = true;
                        try {
                            await item.action.call(route, event, newText => elem.innerText = newText);
                        } finally {
                            elem.disabled = false;
                        }
                    }
                });
                elem.innerText = item.text;
                return elem;
            }));
        route[GROUP_ELEMENT] = menuGroup;
        menu.appendChild(menuGroup);
    }

    let tickActions = [];
    const updateRoutes = async (newPath) => {
        tickActions = [];
        
        let disableActions = [];
        let enableActions = [];
        for (let route of routes) {
            let isActive = route[IS_ACTIVE];
            if(isActive) {
                disableActions.push(() => route.disable?.());
            }

            let patterns = route.pattern instanceof Array ? route.pattern : [route.pattern];
            if (!patterns.every(p => !p.test(newPath))) {
                enableActions.push(() => route.enable?.());
                tickActions.push(() => route.tick?.());
                route[GROUP_ELEMENT]?.classList.add("active");
            } else {
                route[GROUP_ELEMENT]?.classList.remove("active");
            }
        }

        await Promise.all(disableActions.map(fun => fun()));
        await Promise.all(enableActions.map(fun => fun()));
    };
    await updateRoutes(location.pathname);

    let lastLocation = location.pathname;
    while (true) {
        if (lastLocation !== location.pathname) {
            lastLocation = location.pathname;
            await updateRoutes(lastLocation);
        }
        await sleep(1000);
        await Promise.all(
            tickActions.map(f => f())
        );
    }
}

function titleChanger(action) {
    return {
        titles: null,
        async enable() {
            let newTitle = await action.call(this);
            if(newTitle !== undefined) {
                this.titles = [
                    document.title,
                    document.title = newTitle
                ];
            }
        },
        tick() {
            if(document.title === this.titles?.[0]) {
                document.title = this.titles?.[1];
            } else if(this.titles != null && document.title !== this.titles?.[1]) {
                this.titles = null;
                this.enable();
            }
        },
        disable() {
            if(this.titles === null) return;
            let [oldTitle, newTitle] = this.titles;
            this.titles = null;
            if(document.title === newTitle) {
                document.title = oldTitle;
            }
        }
    };
}
