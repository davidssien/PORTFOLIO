import "./style.css";

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
  aboutApp
} from "./apps/about.js";

import {
  projectsApp,
  projectApps
} from "./apps/projects.js";

import {
  terminalApp
} from "./apps/terminal.js";


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


const allApps = [
  projectsApp,
  aboutApp,
  terminalApp,
  ...projectApps
];


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


function openApp(id) {
  windowManager.open(id);
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


const cursor =
  new Cursor(
    cursorCanvas
  );


taskbar.onLaunch =
  openApp;


taskbar.onToggle =
  id => {
    windowManager.toggle(id);
  };


function render() {
  cursor.render();

  requestAnimationFrame(
    render
  );
}


render();