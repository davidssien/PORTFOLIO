import "./style.css";


import {
    LoadingScreen
} from "./desktop/loading.js";

import {
    WelcomeScreen
} from "./desktop/welcome.js";

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
 * ELEMENTS
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

const welcomeElement =
    document.querySelector(
        "#welcome-screen"
    );


/*
 * =========================
 * APPS
 * =========================
 */

const allApps = [
    projectsApp,
    aboutApp,
    terminalApp,
    ...projectApps
];



/*
 * =========================
 * SOUND
 * =========================
 */

new SoundManager();



/*
 * =========================
 * CURSOR
 *
 * Start this BEFORE booting
 * so the custom cursor also
 * works inside boot manager.
 * =========================
 */

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

const loader =
    new LoadingScreen(
        loadingScreen
    );


await loader.start();

/*
 * =========================
 * DESKTOP SYSTEM
 * =========================
 */

let windowManager;


const taskbar =
    new Taskbar(
        taskbarElement,
        startMenu,
        [
            projectsApp,
            aboutApp,
            terminalApp
        ]
    );


const welcome =
    new WelcomeScreen(
        welcomeElement
    );

welcome.show();

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


new Desktop(
    desktopCanvas,
    desktopIcons,
    allApps,
    openApp
);


new ContextMenu(
    contextMenuElement,
    openApp,
    windowManager
);

taskbar.onLaunch =
    openApp;


taskbar.onToggle =
    id => {
        windowManager.toggle(
            id
        );
    };