import {
    renderProject
} from "../apps/projects.js";


import {
    osSound,
    resizeScratch
} from "./soundmanager.js";


export class WindowManager {

    constructor(
        container,
        taskbar,
        apps
    ) {
        this.container =
            container;

        this.taskbar =
            taskbar;

        this.apps =
            new Map(
                apps.map(
                    app => [
                        app.id,
                        app
                    ]
                )
            );

        this.windows =
            new Map();

        this.zIndex =
            100;

        this.instanceCounter =
            0;

        this.cascade =
            0;
    }



    /*
     * =========================
     * OPEN
     * =========================
     */

    open(id) {

        const app =
            this.apps.get(id);


        if (!app) {

            console.error(
                `Application not found: ${id}`
            );


            osSound(
                "error"
            );


            return;
        }

        const multiple =
            app.allowMultipleInstances !==
            false;


        /*
         * Apps create independent windows by default.
         * Special system windows can explicitly opt out.
         */

        if (
            !multiple &&
            this.windows.has(id)
        ) {
            this.restore(id);
            return id;
        }


        /*
         * Keep the first window's app ID for startup layout.
         * Additional windows receive unique instance IDs.
         */

        let windowId = id;

        while (
            this.windows.has(windowId) ||
            (windowId !== id && this.apps.has(windowId))
        ) {
            windowId =
                `${id}__${++this.instanceCounter}`;
        }


        const element =
            document.createElement(
                "section"
            );



        const containerWidth =
            this.container.clientWidth;


        const containerHeight =
            this.container.clientHeight;



        const requestedWidth =
            app.width ||
            600;


        const requestedHeight =
            app.height ||
            400;



        const width =
            Math.min(
                requestedWidth,
                containerWidth - 20
            );


        const height =
            Math.min(
                requestedHeight,
                containerHeight - 20
            );



        /*
         * =========================
         * INITIAL POSITION
         * =========================
         */

        let x =
            Math.max(
                5,

                Math.min(
                    80 +
                    this.cascade,

                    containerWidth -
                    width -
                    10
                )
            );


        let y =
            Math.max(
                5,

                Math.min(
                    40 +
                    this.cascade,

                    containerHeight -
                    height -
                    10
                )
            );



        /*
         * Center special windows
         * such as Welcome.
         */

        if (
            app.centered
        ) {

            x =
                Math.round(
                    (
                        containerWidth -
                        width
                    ) / 2
                );


            y =
                Math.round(
                    (
                        containerHeight -
                        height
                    ) / 2
                );
        }



        /*
         * Only normal windows affect
         * the cascade position.
         */

        if (
            !app.centered
        ) {

            this.cascade =
                (
                    this.cascade +
                    22
                ) % 130;
        }



        /*
         * =========================
         * WINDOW CLASS
         * =========================
         */

        if (
            app.frameless
        ) {

            element.className = `
                pointer-events-auto

                absolute

                flex
                flex-col

                overflow-hidden
            `;

        }

        else {

            element.className = `
                retro-window

                pointer-events-auto

                absolute

                flex
                flex-col

                overflow-hidden
            `;

        }



        /*
         * Used by ContextMenu.
         */

        element.dataset.appId =
            id;


        element.dataset.windowId =
            windowId;


        element.style.left =
            `${x}px`;


        element.style.top =
            `${y}px`;


        element.style.width =
            `${width}px`;


        element.style.height =
            `${height}px`;



        /*
         * =========================
         * FRAMELESS WINDOW
         * =========================
         */

        if (
            app.frameless
        ) {

            element.innerHTML = `

                <div
                    data-window-content

                    class="
                        h-full
                        w-full
                        overflow-hidden
                    "
                >
                    ${this.getContent(app)}
                </div>

            `;

        }



        /*
         * =========================
         * NORMAL WINDOW
         * =========================
         */

        else {

            element.innerHTML = `

                <header
                    data-titlebar
                    class="retro-titlebar"
                >

                    <button
                        data-close
                        class="retro-window-button"
                        aria-label="Close"
                    ></button>


                    <div
                        class="
                            flex
                            flex-1
                            items-center
                            justify-center
                            overflow-hidden
                        "
                    >

                        <span
                            class="retro-title"
                        >
                            ${app.filename}
                        </span>

                    </div>


                    <button
                        data-minimize
                        class="retro-window-button"
                        aria-label="Minimize"
                    >
                        _
                    </button>


                    <button
                        data-maximize
                        class="retro-window-button"
                        aria-label="Maximize"
                    >
                        □
                    </button>

                </header>



                <div
                    data-window-content

                    class="
                        os-scrollbar

                        min-h-0

                        flex-1

                        overflow-auto
                    "
                >
                    ${this.getContent(app)}
                </div>



                <!--
                    Bottom resize strip
                -->

                <div
                    class="retro-window-bottom"
                >

                    <div
                        data-resize="bottom"
                        class="retro-resize-bottom-zone"
                    ></div>


                    <div
                        data-resize="corner"
                        class="retro-resize-corner"
                    ></div>

                </div>



                <!--
                    Right resize edge
                -->

                <div
                    data-resize="right"
                    class="retro-resize-edge-right"
                ></div>

            `;

        }



        /*
         * =========================
         * ADD TO DESKTOP
         * =========================
         */

        this.container.appendChild(
            element
        );



        this.windows.set(
            windowId,
            {

                app,

                element,


                minimized:
                    false,


                maximized:
                    false,


                previousRect:
                    null,


                angle:
                    0,


                angularVelocity:
                    0,


                targetAngle:
                    0,


                physicsFrame:
                    null

            }
        );



        /*
         * Special windows like Welcome
         * don't need a taskbar entry.
         */

        if (
            app.showInTaskbar !==
            false
        ) {

            this.taskbar.addApp(
                app,
                windowId
            );
        }



        this.bindWindow(
            windowId
        );



        const content =
            element.querySelector(
                "[data-window-content]"
            );



        /*
         * Terminal/etc. can initialize
         * after their DOM exists.
         */

        if (
            app.mount
        ) {

            const cleanup = app.mount(
                content,

                {
                    openApp:
                        appId =>
                            this.open(
                                appId
                            )
                }
            );

            if (typeof cleanup === "function") {
                this.windows.get(windowId).cleanup = cleanup;
            }

        }



        osSound(
            "open"
        );



        this.focus(
            windowId
        );

        return windowId;
    }




    getContent(app) {

        if (
            app.type ===
            "project"
        ) {

            return renderProject(
                app
            );

        }



        if (
            app.render
        ) {

            return app.render();

        }



        return `
            <div class="p-6">
                Unable to open file.
            </div>
        `;
    }



    /*
     * =========================
     * WINDOW EVENTS
     * =========================
     */

    bindWindow(id) {

        const windowData =
            this.windows.get(id);


        const element =
            windowData.element;


        const app =
            windowData.app;



        /*
         * Focus when clicked.
         */

        element.addEventListener(
            "pointerdown",

            () => {

                this.focus(
                    id
                );

            }
        );



        /*
         * =========================
         * NORMAL WINDOW BUTTONS
         * =========================
         */

        if (
            !app.frameless
        ) {

            const closeButton =
                element.querySelector(
                    "[data-close]"
                );


            const minimizeButton =
                element.querySelector(
                    "[data-minimize]"
                );


            const maximizeButton =
                element.querySelector(
                    "[data-maximize]"
                );



            closeButton?.addEventListener(
                "click",

                event => {

                    event.stopPropagation();


                    this.close(
                        id
                    );

                }
            );



            minimizeButton?.addEventListener(
                "click",

                event => {

                    event.stopPropagation();


                    this.minimize(
                        id
                    );

                }
            );



            maximizeButton?.addEventListener(
                "click",

                event => {

                    event.stopPropagation();


                    this.toggleMaximize(
                        id
                    );

                }
            );

        }



        /*
         * =========================
         * INTERNAL FILES
         * =========================
         */

        if (app.openFilesOnClick) {
            element.addEventListener("click", event => {
                const target = event.target.closest("[data-open-app]");
                if (target && event.detail < 2) {
                    this.open(target.dataset.openApp);
                }
            });
        }

        element.addEventListener(
            "dblclick",

            event => {

                const target =
                    event.target.closest(
                        "[data-open-app]"
                    );


                if (
                    !target || app.openFilesOnClick
                ) {

                    return;

                }


                this.open(
                    target.dataset.openApp
                );

            }
        );

        element.addEventListener("keydown", event => {
            const target = event.target.closest("[data-open-app]");
            if (event.key !== "Enter" || event.repeat || !target) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.open(target.dataset.openApp);
        });



        /*
         * =========================
         * DRAGGING
         * =========================
         */

        if (
            app.draggable !== false &&
            !app.frameless
        ) {

            this.makeDraggable(
                id
            );

        }



        /*
         * =========================
         * RESIZING
         * =========================
         */

        if (
            app.resizable !== false &&
            !app.frameless
        ) {

            this.makeResizable(
                id
            );

        }

    }



    /*
     * =========================
     * DRAGGING
     * =========================
     */

    makeDraggable(id) {

        const windowData =
            this.windows.get(id);


        const element =
            windowData.element;


        const titlebar =
            element.querySelector(
                "[data-titlebar]"
            );



        if (
            !titlebar
        ) {

            return;

        }



        let dragging =
            false;


        let offsetX =
            0;


        let offsetY =
            0;


        let lastX =
            0;


        let lastY =
            0;


        let lastTime =
            0;



        /*
         * =========================
         * MOVE
         * =========================
         */

        const move =
            event => {

                if (
                    !dragging
                ) {

                    return;

                }



                const containerRect =
                    this.container
                        .getBoundingClientRect();



                /*
                 * NO CLAMPING.
                 *
                 * Windows can freely move
                 * partially or completely
                 * off-screen.
                 */

                const x =
                    event.clientX -
                    containerRect.left -
                    offsetX;



                const y =
                    event.clientY -
                    containerRect.top -
                    offsetY;



                element.style.left =
                    `${x}px`;


                element.style.top =
                    `${y}px`;



                /*
                 * =========================
                 * SWING MOMENTUM
                 * =========================
                 */

                const now =
                    performance.now();



                const dt =
                    Math.max(
                        now -
                        lastTime,

                        1
                    );



                const velocityX =
                    (
                        event.clientX -
                        lastX
                    ) / dt;



                const velocityY =
                    (
                        event.clientY -
                        lastY
                    ) / dt;



                /*
                 * Horizontal motion
                 * contributes most.
                 */

                let target =
                    velocityX *
                    7;



                /*
                 * Small vertical influence.
                 */

                target +=
                    velocityY *
                    1.2;



                /*
                 * Limit max tilt.
                 */

                target =
                    Math.max(
                        -10,

                        Math.min(
                            10,
                            target
                        )
                    );



                windowData.targetAngle =
                    target;



                windowData.angularVelocity +=
                    (
                        windowData.targetAngle -
                        windowData.angle
                    ) * 0.16;



                lastX =
                    event.clientX;


                lastY =
                    event.clientY;


                lastTime =
                    now;



                this.startWindowPhysics(
                    windowData
                );

            };



        /*
         * =========================
         * RELEASE
         * =========================
         */

        const up =
            () => {

                if (
                    !dragging
                ) {

                    return;

                }



                dragging =
                    false;



                osSound(
                    "drag-end"
                );



                /*
                 * Keep a tiny swing,
                 * but don't let it fly
                 * around after release.
                 */

                windowData.angularVelocity *=
                    0.35;



                windowData.targetAngle =
                    0;



                this.startWindowPhysics(
                    windowData
                );



                window.removeEventListener(
                    "pointermove",
                    move
                );


                window.removeEventListener(
                    "pointerup",
                    up
                );


                window.removeEventListener(
                    "pointercancel",
                    up
                );

            };



        /*
         * =========================
         * START DRAG
         * =========================
         */

        titlebar.addEventListener(
            "pointerdown",

            event => {

                if (
                    event.button !== 0
                ) {

                    return;

                }



                /*
                 * Buttons shouldn't drag.
                 */

                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;

                }



                event.preventDefault();



                this.focus(
                    id
                );



                osSound(
                    "drag-start"
                );



                /*
                 * =========================
                 * DRAG FROM MAXIMIZED
                 * =========================
                 */

                if (
                    windowData.maximized
                ) {

                    const containerRect =
                        this.container
                            .getBoundingClientRect();



                    const pointerX =
                        event.clientX -
                        containerRect.left;



                    const percentageX =
                        pointerX /
                        this.container
                            .clientWidth;



                    const old =
                        windowData.previousRect;



                    let restoredWidth =
                        parseFloat(
                            old?.width
                        ) || 600;



                    let restoredHeight =
                        parseFloat(
                            old?.height
                        ) || 400;



                    restoredWidth =
                        Math.min(
                            restoredWidth,

                            this.container
                                .clientWidth
                        );



                    restoredHeight =
                        Math.min(
                            restoredHeight,

                            this.container
                                .clientHeight
                        );



                    element.style.width =
                        `${restoredWidth}px`;


                    element.style.height =
                        `${restoredHeight}px`;



                    /*
                     * Restore underneath
                     * cursor position.
                     */

                    let newLeft =
                        pointerX -
                        restoredWidth *
                        percentageX;



                    newLeft =
                        Math.max(
                            0,

                            Math.min(
                                newLeft,

                                this.container
                                    .clientWidth -
                                restoredWidth
                            )
                        );



                    element.style.left =
                        `${newLeft}px`;



                    element.style.top =
                        "0px";



                    windowData.maximized =
                        false;



                    const restoredRect =
                        element
                            .getBoundingClientRect();



                    offsetX =
                        event.clientX -
                        restoredRect.left;



                    offsetY =
                        event.clientY -
                        restoredRect.top;

                }

                else {

                    const rect =
                        element
                            .getBoundingClientRect();



                    offsetX =
                        event.clientX -
                        rect.left;



                    offsetY =
                        event.clientY -
                        rect.top;

                }



                dragging =
                    true;



                lastX =
                    event.clientX;


                lastY =
                    event.clientY;


                lastTime =
                    performance.now();



                window.addEventListener(
                    "pointermove",
                    move
                );


                window.addEventListener(
                    "pointerup",
                    up
                );


                window.addEventListener(
                    "pointercancel",
                    up
                );

            }
        );
    }



    /*
     * =========================
     * WINDOW SWING PHYSICS
     * =========================
     */

    startWindowPhysics(
        windowData
    ) {

        /*
         * Physics loop already active.
         */

        if (
            windowData.physicsFrame
        ) {

            return;

        }



        const step =
            () => {

                /*
                 * Original spring feel.
                 */

                const spring =
                    0.11;



                const damping =
                    0.82;



                const difference =
                    windowData.targetAngle -
                    windowData.angle;



                windowData.angularVelocity +=
                    difference *
                    spring;



                windowData.angularVelocity *=
                    damping;



                windowData.angle +=
                    windowData.angularVelocity;



                windowData.angle =
                    Math.max(
                        -12,

                        Math.min(
                            12,
                            windowData.angle
                        )
                    );



                windowData.element
                    .style
                    .transform =
                    `rotate(${windowData.angle}deg)`;



                /*
                 * Swing around top area
                 * like it's hanging.
                 */

                windowData.element
                    .style
                    .transformOrigin =
                    "50% 10px";



                const settled =
                    Math.abs(
                        windowData.angle -
                        windowData.targetAngle
                    ) < 0.02 &&

                    Math.abs(
                        windowData.angularVelocity
                    ) < 0.02;



                if (
                    settled
                ) {

                    windowData.angle =
                        windowData.targetAngle;



                    if (
                        windowData.angle ===
                        0
                    ) {

                        windowData.element
                            .style
                            .transform =
                            "";

                    }

                    else {

                        windowData.element
                            .style
                            .transform =
                            `rotate(${windowData.angle}deg)`;

                    }



                    windowData.physicsFrame =
                        null;



                    return;

                }



                windowData.physicsFrame =
                    requestAnimationFrame(
                        step
                    );

            };



        windowData.physicsFrame =
            requestAnimationFrame(
                step
            );
    }



    /*
     * =========================
     * RESIZING
     * =========================
     */

    makeResizable(id) {

        const windowData =
            this.windows.get(id);


        const element =
            windowData.element;



        const right =
            element.querySelector(
                '[data-resize="right"]'
            );


        const bottom =
            element.querySelector(
                '[data-resize="bottom"]'
            );


        const corner =
            element.querySelector(
                '[data-resize="corner"]'
            );



        this.bindResizeHandle(
            id,
            right,
            "right",
            "resize-ew"
        );


        this.bindResizeHandle(
            id,
            bottom,
            "bottom",
            "resize-ns"
        );


        this.bindResizeHandle(
            id,
            corner,
            "corner",
            "resize-nwse"
        );
    }



    /*
     * =========================
     * RESIZE HANDLE
     * =========================
     */

    bindResizeHandle(
        id,
        handle,
        mode,
        cursorMode
    ) {

        if (
            !handle
        ) {

            return;

        }



        handle.addEventListener(
            "pointerenter",

            () => {

                window.dispatchEvent(
                    new CustomEvent(
                        "retro-cursor",

                        {
                            detail:
                                cursorMode
                        }
                    )
                );

            }
        );



        handle.addEventListener(
            "pointerleave",

            () => {

                window.dispatchEvent(
                    new CustomEvent(
                        "retro-cursor",

                        {
                            detail:
                                "default"
                        }
                    )
                );

            }
        );



        handle.addEventListener(
            "pointerdown",

            event => {

                if (
                    event.button !== 0
                ) {

                    return;

                }



                event.stopPropagation();


                event.preventDefault();



                this.beginResize(
                    id,
                    mode,
                    event
                );

            }
        );
    }



    /*
     * =========================
     * RESIZE
     * =========================
     */

    beginResize(
        id,
        mode,
        event
    ) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData ||
            windowData.maximized
        ) {

            return;

        }



        this.focus(
            id
        );



        const element =
            windowData.element;



        /*
         * Bring any existing swing
         * back toward neutral.
         */

        windowData.targetAngle =
            0;



        const startX =
            event.clientX;


        const startY =
            event.clientY;



        const startWidth =
            element.offsetWidth;


        const startHeight =
            element.offsetHeight;



        const startLeft =
            parseFloat(
                element.style.left
            ) || 0;



        const startTop =
            parseFloat(
                element.style.top
            ) || 0;



        const minWidth =
            300;


        const minHeight =
            160;



        /*
         * Keep resizing sane even though
         * dragging can leave the screen.
         */

        const maxWidth =
            Math.max(
                minWidth,

                this.container
                    .clientWidth -
                startLeft
            );



        const maxHeight =
            Math.max(
                minHeight,

                this.container
                    .clientHeight -
                startTop
            );



        let previewWidth =
            startWidth;


        let previewHeight =
            startHeight;



        /*
         * =========================
         * SCRATCH SOUND TRACKING
         * =========================
         */

        let lastMouseX =
            event.clientX;


        let lastMouseY =
            event.clientY;


        let lastScratchTime =
            0;



        /*
         * =========================
         * PREVIEW FRAME
         * =========================
         */

        const frame =
            document.createElement(
                "div"
            );



        frame.className =
            "retro-resize-frame";



        frame.style.left =
            `${startLeft}px`;


        frame.style.top =
            `${startTop}px`;


        frame.style.width =
            `${startWidth}px`;


        frame.style.height =
            `${startHeight}px`;



        this.container.appendChild(
            frame
        );



        /*
         * =========================
         * RESIZE MOVE
         * =========================
         */

        const move =
            moveEvent => {

                /*
                 * PAPER SCRATCH
                 */

                const dx =
                    moveEvent.clientX -
                    lastMouseX;



                const dy =
                    moveEvent.clientY -
                    lastMouseY;



                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );



                const now =
                    performance.now();



                if (
                    distance > 1 &&

                    now -
                    lastScratchTime >
                    20
                ) {

                    const speed =
                        Math.min(
                            distance / 5,
                            3
                        );



                    resizeScratch(
                        speed
                    );



                    lastScratchTime =
                        now;

                }



                lastMouseX =
                    moveEvent.clientX;


                lastMouseY =
                    moveEvent.clientY;



                /*
                 * Calculate size.
                 */

                const deltaX =
                    moveEvent.clientX -
                    startX;



                const deltaY =
                    moveEvent.clientY -
                    startY;



                if (
                    mode === "right" ||
                    mode === "corner"
                ) {

                    previewWidth =
                        Math.max(
                            minWidth,

                            Math.min(
                                maxWidth,

                                startWidth +
                                deltaX
                            )
                        );

                }



                if (
                    mode === "bottom" ||
                    mode === "corner"
                ) {

                    previewHeight =
                        Math.max(
                            minHeight,

                            Math.min(
                                maxHeight,

                                startHeight +
                                deltaY
                            )
                        );

                }



                frame.style.width =
                    `${previewWidth}px`;


                frame.style.height =
                    `${previewHeight}px`;

            };



        /*
         * =========================
         * FINISH RESIZE
         * =========================
         */

        const finishResize =
            () => {

                element.style.width =
                    `${previewWidth}px`;


                element.style.height =
                    `${previewHeight}px`;



                frame.remove();



                window.removeEventListener(
                    "pointermove",
                    move
                );


                window.removeEventListener(
                    "pointerup",
                    finishResize
                );


                window.removeEventListener(
                    "pointercancel",
                    finishResize
                );



                window.dispatchEvent(
                    new CustomEvent(
                        "retro-cursor",

                        {
                            detail:
                                "default"
                        }
                    )
                );

            };



        window.addEventListener(
            "pointermove",
            move
        );


        window.addEventListener(
            "pointerup",
            finishResize
        );


        window.addEventListener(
            "pointercancel",
            finishResize
        );
    }



    /*
     * =========================
     * FOCUS
     * =========================
     */

    focus(id) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData
        ) {

            return;

        }



        this.zIndex++;



        /*
         * Only regular windows get
         * active striped styling.
         */

        for (
            const [
                windowId,
                data
            ] of this.windows
        ) {

            data.element
                .classList
                .toggle(
                    "active",

                    windowId ===
                    id
                );

        }



        windowData.element
            .style
            .zIndex =
            this.zIndex;



        /*
         * Don't try to activate a
         * taskbar entry that doesn't exist.
         */

        if (
            windowData.app
                .showInTaskbar !==
            false
        ) {

            this.taskbar.setActive(
                id
            );

        }

        else {

            this.taskbar.clearActive?.();

        }
    }



    /*
     * =========================
     * CLOSE
     * =========================
     */

    close(id) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData
        ) {

            return;

        }



        osSound(
            "close"
        );



        /*
         * Stop physics.
         */

        if (
            windowData.physicsFrame
        ) {

            cancelAnimationFrame(
                windowData.physicsFrame
            );



            windowData.physicsFrame =
                null;

        }



        windowData.cleanup?.();

        windowData.element.remove();



        this.windows.delete(
            id
        );



        if (
            windowData.app
                .showInTaskbar !==
            false
        ) {

            this.taskbar.removeApp(
                id
            );

        }



        this.taskbar.clearActive?.();
    }



    /*
     * =========================
     * MINIMIZE
     * =========================
     */

    minimize(id) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData
        ) {

            return;

        }



        /*
         * Special persistent windows
         * can disable minimizing.
         */

        if (
            windowData.app
                .minimizable ===
            false
        ) {

            return;

        }



        osSound(
            "minimize"
        );



        windowData.minimized =
            true;



        windowData.element
            .style
            .display =
            "none";



        this.taskbar.clearActive?.();
    }



    /*
     * =========================
     * RESTORE
     * =========================
     */

    restore(id) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData
        ) {

            return;

        }



        windowData.minimized =
            false;



        windowData.element
            .style
            .display =
            "flex";



        this.focus(
            id
        );
    }



    /*
     * =========================
     * TASKBAR TOGGLE
     * =========================
     */

    toggle(id) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData
        ) {

            return;

        }



        if (
            windowData.minimized
        ) {

            this.restore(
                id
            );


            return;

        }



        const z =
            Number(
                windowData
                    .element
                    .style
                    .zIndex
            );



        if (
            z ===
            this.zIndex
        ) {

            this.minimize(
                id
            );

        }

        else {

            this.focus(
                id
            );

        }

    }



    /*
     * =========================
     * MAXIMIZE / RESTORE
     * =========================
     */

    toggleMaximize(id) {

        const windowData =
            this.windows.get(id);



        if (
            !windowData
        ) {

            return;

        }



        /*
         * Frameless / special windows
         * don't maximize.
         */

        if (
            windowData.app
                .maximizable ===
            false ||

            windowData.app
                .frameless
        ) {

            return;

        }



        const element =
            windowData.element;



        /*
         * Kill rotation before geometry
         * changes.
         */

        windowData.targetAngle =
            0;


        windowData.angle =
            0;


        windowData.angularVelocity =
            0;



        if (
            windowData.physicsFrame
        ) {

            cancelAnimationFrame(
                windowData.physicsFrame
            );


            windowData.physicsFrame =
                null;

        }



        element.style.transform =
            "";



        /*
         * =========================
         * MAXIMIZE
         * =========================
         */

        if (
            !windowData.maximized
        ) {

            osSound(
                "maximize"
            );



            windowData.previousRect = {

                left:
                    element.style.left,


                top:
                    element.style.top,


                width:
                    element.style.width,


                height:
                    element.style.height

            };



            element.style.left =
                "0px";


            element.style.top =
                "0px";


            element.style.width =
                "100%";


            element.style.height =
                "100%";



            windowData.maximized =
                true;

        }



        /*
         * =========================
         * RESTORE
         * =========================
         */

        else {

            osSound(
                "minimize"
            );



            const old =
                windowData.previousRect;



            if (
                old
            ) {

                element.style.left =
                    old.left;


                element.style.top =
                    old.top;


                element.style.width =
                    old.width;


                element.style.height =
                    old.height;

            }



            windowData.maximized =
                false;

        }



        this.focus(
            id
        );
    }
}