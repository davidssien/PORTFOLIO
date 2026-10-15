import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function loadClass(path) {
    const source = (await readFile(new URL(path, import.meta.url), 'utf8'))
        .replace(/import\s*\{[^}]*\}\s*from\s*"[^"]+";/g, '');
    return import(`data:text/javascript,${encodeURIComponent('const osSound = () => {};\n' + source)}`);
}

const { WindowManager } = await loadClass('../src/desktop/windowmanager.js');
const { Taskbar } = await loadClass('../src/desktop/taskbar.js');
const { ContextMenu } = await loadClass('../src/desktop/contextmenu.js');
const { Desktop } = await loadClass('../src/desktop/desktop.js');

function element() {
    return {
        dataset: {}, style: {}, children: [],
        classList: { toggle() {}, add() {}, remove() {} },
        appendChild(child) { this.children.push(child); },
        querySelector() { return this.content ??= element(); },
        addEventListener(type, callback) { (this.events ??= {})[type] = callback; },
        remove() { this.removed = true; }
    };
}

globalThis.document = { createElement: element };

function setup(app = {}) {
    const holder = element();
    const taskbar = Object.create(Taskbar.prototype);
    taskbar.runningApps = new Map();
    taskbar.container = { querySelector: () => holder };
    const manager = new WindowManager(
        { ...element(), clientWidth: 1200, clientHeight: 900 },
        taskbar,
        [{ id: 'terminal', render: () => '', draggable: false, resizable: false, ...app }]
    );
    taskbar.onToggle = id => manager.toggle(id);
    return { manager, taskbar };
}

test('repeated launches have independent windows, mounts, taskbar buttons and controls', () => {
    const mounts = [];
    const { manager, taskbar } = setup({ mount: content => mounts.push(content) });
    const first = manager.open('terminal');
    const second = manager.open('terminal');
    assert.notEqual(first, second);
    assert.equal(manager.windows.size, 2);
    assert.equal(taskbar.runningApps.size, 2);
    assert.notEqual(mounts[0], mounts[1]);
    assert.equal(manager.windows.get(second).element.dataset.appId, 'terminal');
    assert.equal(manager.windows.get(second).element.dataset.windowId, second);
    taskbar.runningApps.get(second).events.click();
    assert.equal(manager.windows.get(second).minimized, true);
    assert.equal(manager.windows.get(first).minimized, false);
    taskbar.runningApps.get(second).events.click();
    assert.equal(manager.windows.get(second).minimized, false);
    manager.toggleMaximize(second);
    assert.equal(manager.windows.get(second).maximized, true);
    assert.equal(manager.windows.get(first).maximized, false);
    manager.close(first);
    assert.equal(manager.windows.has(second), true);
    assert.equal(taskbar.runningApps.has(second), true);
    const third = manager.open('terminal');
    assert.notEqual(third, second);
    manager.close(second);
    manager.close(third);
    assert.equal(taskbar.runningApps.size, 0);
});

test('explicit single-instance apps restore their existing window', () => {
    const { manager } = setup({ allowMultipleInstances: false });
    const id = manager.open('terminal');
    manager.minimize(id);
    assert.equal(manager.open('terminal'), id);
    assert.equal(manager.windows.size, 1);
    assert.equal(manager.windows.get(id).minimized, false);
});

test('context menu actions target the selected instance', () => {
    const { manager } = setup();
    const first = manager.open('terminal');
    const second = manager.open('terminal');
    const menu = Object.create(ContextMenu.prototype);
    menu.windowManager = manager;
    menu.show = items => { menu.items = items; };
    menu.showWindowMenu(0, 0, second);
    menu.items[0].action();
    assert.equal(manager.windows.get(second).minimized, true);
    assert.equal(manager.windows.get(first).minimized, false);
    menu.items[1].action();
    assert.equal(manager.windows.get(second).maximized, true);
    menu.items[3].action();
    assert.equal(manager.windows.has(second), false);
    assert.equal(manager.windows.has(first), true);
});


test('Enter opens selected icons once, including marquee selections, without global shortcuts', () => {
    const desktop = Object.create(Desktop.prototype);
    desktop.iconContainer = element();
    desktop.icons = [
        { app: { id: 'pictures' }, element: element() },
        { app: { id: 'music' }, element: element() }
    ];
    desktop.selectedIcons = new Set(desktop.icons);
    const opened = [];
    desktop.openApp = id => opened.push(id);
    desktop.bindSelection();
    let prevented = false;
    const event = {
        key: 'Enter', repeat: false,
        target: { closest: () => null },
        preventDefault() { prevented = true; }, stopPropagation() {}
    };
    desktop.iconContainer.events.keydown(event);
    assert.deepEqual(opened, ['pictures', 'music']);
    assert.equal(prevented, true);
    desktop.iconContainer.events.keydown({ ...event, repeat: true });
    assert.equal(opened.length, 2);
    desktop.selectedIcons.clear();
    desktop.iconContainer.events.keydown({
        ...event, target: { closest: () => desktop.icons[0].element }
    });
    assert.deepEqual(opened, ['pictures', 'music', 'pictures']);
});

test('folder Enter opens a file and closing an instance disposes only its resources', () => {
    const disposed = [];
    let mount = 0;
    const { manager } = setup({ mount: () => {
        const instance = ++mount;
        return () => disposed.push(instance);
    } });
    const first = manager.open('terminal');
    const event = {
        key: 'Enter', repeat: false,
        target: { closest: () => ({ dataset: { openApp: 'terminal' } }) },
        preventDefault() {}, stopPropagation() {}
    };
    manager.windows.get(first).element.events.keydown(event);
    assert.equal(manager.windows.size, 2);
    manager.close(first);
    assert.deepEqual(disposed, [1]);
    assert.equal(manager.windows.size, 1);
});

test('media folders open on one click without duplicating a double click', () => {
    const { manager } = setup({ openFilesOnClick: true });
    const first = manager.open('terminal');
    const source = manager.windows.get(first).element;
    const target = { closest: () => ({ dataset: { openApp: 'terminal' } }) };
    source.events.click({ target, detail: 1 });
    source.events.click({ target, detail: 2 });
    source.events.dblclick({ target });
    assert.equal(manager.windows.size, 2);
});
