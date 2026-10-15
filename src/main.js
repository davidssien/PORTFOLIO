import "./style.css";

import { mediaApps } from "./apps/media.js";


import {
    LoadingScreen
} from "./desktop/loading.js";

import {
    readmeApp
} from "./apps/readme.js";

import {
    welcomeApp
} from "./apps/welcome.js";


import {
    SoundManager
} from "./desktop/soundmanager.js";


import {
    Desktop
} from "./desktop/desktop.js";


import {
    Cursor
} from "./desktop/cursor.js";


import {
    Taskbar
} from "./desktop/taskbar.js";


import {
    WindowManager
} from "./desktop/windowmanager.js";


import {
    ContextMenu
} from "./desktop/contextmenu.js";


import {
    aboutApp
} from "./apps/about.js";


import {
    projectsApp,
    projectApps
} from "./apps/projects.js";


import {
    terminalApp
} from "./apps/terminal.js";



/*
 * =========================
 * DOM
 * =========================
 */

const loadingScreen =
    document.querySelector(
        "#loading-screen"
    );


const desktopCanvas =
    document.querySelector(
        "#desktop-canvas"
    );


const cursorCanvas =
    document.querySelector(
        "#cursor-canvas"
    );


const desktopIcons =
    document.querySelector(
        "#desktop-icons"
    );


const windows =
    document.querySelector(
        "#windows"
    );


const taskbarElement =
    document.querySelector(
        "#taskbar"
    );


const startMenu =
    document.querySelector(
        "#start-menu"
    );


const contextMenuElement =
    document.querySelector(
        "#context-menu"
    );



/*
 * =========================
 * APPLICATIONS
 * =========================
 */

const allApps = [
    welcomeApp,
    projectsApp,
    aboutApp,
    readmeApp,
    terminalApp,
    ...projectApps,
    ...mediaApps
];



/*
 * =========================
 * SOUND
 * =========================
 */

new SoundManager();



/*
 * =========================
 * TASKBAR
 * =========================
 */

const taskbar =
    new Taskbar(
        taskbarElement,
        startMenu,

        [
            projectsApp,
            aboutApp,
            terminalApp,
            ...mediaApps.filter(app => app.desktop)
        ]
    );



/*
 * =========================
 * WINDOW MANAGER
 * =========================
 */

let windowManager;


function openApp(id) {

    windowManager.open(
        id
    );

}


windowManager =
    new WindowManager(
        windows,
        taskbar,
        allApps
    );



/*
 * =========================
 * DESKTOP
 * =========================
 */

new Desktop(
    desktopCanvas,
    desktopIcons,
    allApps,
    openApp
);



/*
 * =========================
 * CONTEXT MENU
 * =========================
 */

new ContextMenu(
    contextMenuElement,
    openApp,
    windowManager
);



/*
 * =========================
 * TASKBAR EVENTS
 * =========================
 */

taskbar.onLaunch =
    openApp;


taskbar.onToggle =
    id => {

        windowManager.toggle(
            id
        );

    };



/*
 * =========================
 * CURSOR
 * =========================
 */

function startCursor() {

    const cursor =
        new Cursor(
            cursorCanvas
        );


    function renderCursor() {

        cursor.render();


        requestAnimationFrame(
            renderCursor
        );

    }


    renderCursor();

}



/*
 * =========================
 * DEFAULT OPEN APPS
 * =========================
 */

/*
 * =========================
 * DEFAULT OPEN APPS
 * =========================
 */

function openDefaultApps() {

    const defaultApps = [
        "terminal",
        "readme",
        "projects"
    ];


    /*
     * Open all three first so
     * their dimensions exist.
     */

    for (
        const appId of defaultApps
    ) {
        windowManager.open(
            appId
        );
    }


    const screenWidth =
        windows.clientWidth;


    const screenHeight =
        windows.clientHeight;



    /*
     * =========================
     * TERMINAL
     * LEFT SIDE
     * =========================
     */

    const terminal =
        windowManager.windows.get(
            "terminal"
        );


    if (terminal) {

        const element =
            terminal.element;


        const y =
            screenHeight *
            0.18;


        element.style.left =
            "30px";


        element.style.top =
            `${Math.round(y)}px`;

    }



    /*
     * =========================
     * README
     * CENTER
     * =========================
     */

    const readme =
        windowManager.windows.get(
            "readme"
        );


    if (readme) {

        const element =
            readme.element;


        const width =
            element.offsetWidth;


        const height =
            element.offsetHeight;


        const x =
            (
                screenWidth -
                width
            ) / 2;


        const y =
            (
                screenHeight -
                height
            ) / 2;


        element.style.left =
            `${Math.round(x)}px`;


        element.style.top =
            `${Math.round(y)}px`;

    }



    /*
     * =========================
     * PROJECTS
     * BOTTOM AREA
     * =========================
     */

    const projects =
        windowManager.windows.get(
            "projects"
        );


    if (projects) {

        const element =
            projects.element;


        const width =
            element.offsetWidth;


        const height =
            element.offsetHeight;


        const x =
            screenWidth -
            width -
            40;


        const y = 0


        element.style.left =
            `${Math.round(
                Math.max(
                    20,
                    x
                )
            )}px`;


        element.style.top =
            `${Math.round(
                Math.max(
                    20,
                    y
                )
            )}px`;

    }



    /*
     * Keep Welcome on top.
     */

    if (
        windowManager.windows.has(
            "welcome"
        )
    ) {

        windowManager.focus(
            "welcome"
        );

    }
}
/*
 * =========================
 * WELCOME
 * =========================
 */

/*
 * =========================
 * WELCOME
 * =========================
 */

function showWelcome() {

    windowManager.open(
        "welcome"
    );


    const dismissWelcome =
        () => {

            const welcome =
                windowManager.windows.get(
                    "welcome"
                );


            if (!welcome) {
                return;
            }


            welcome.element.remove();


            windowManager.windows.delete(
                "welcome"
            );

        };


    window.addEventListener(
        "pointerdown",
        dismissWelcome,
        {
            once: true,
            capture: true
        }
    );

}


/*
 * =========================
 * START SYSTEM
 * =========================
 */
/*
 * =========================
 * START SYSTEM
 * =========================
 */

async function startSystem() {

    const loader =
        new LoadingScreen(
            loadingScreen
        );


    await loader.start();


    /*
     * Welcome appears first.
     */

    showWelcome();


    /*
     * Half a second later,
     * background apps appear.
     */

    setTimeout(
        () => {

            openDefaultApps();

        },
        500
    );


    /*
     * Cursor starts after boot.
     */

    startCursor();

}

/*
 * =========================
 * BOOT
 * =========================
 */

startSystem();
