import {
    renderProject
} from "../apps/projects.js";


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


        this.zIndex = 100;

        this.cascade = 0;

    }


    open(id) {

        const app =
            this.apps.get(id);


        if (!app) {

            console.error(
                `Application not found: ${id}`
            );

            return;

        }


        if (
            this.windows.has(id)
        ) {

            this.restore(id);

            this.focus(id);

            return;

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
            app.width || 600;


        const requestedHeight =
            app.height || 400;


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


        const x =
            Math.max(
                5,
                Math.min(
                    80 + this.cascade,
                    containerWidth -
                        width -
                        10
                )
            );


        const y =
            Math.max(
                5,
                Math.min(
                    40 + this.cascade,
                    containerHeight -
                        height -
                        10
                )
            );


        this.cascade =
            (this.cascade + 22) %
            130;


        element.className = `
            retro-window

            pointer-events-auto

            absolute

            flex

            flex-col

            overflow-hidden
        `;


        element.style.left =
            `${x}px`;

        element.style.top =
            `${y}px`;

        element.style.width =
            `${width}px`;

        element.style.height =
            `${height}px`;


        element.innerHTML = `

            <header
                data-titlebar
                class="retro-titlebar"
            >

                <button
                    data-close
                    class="retro-window-button"
                >
                </button>


                <div
                    class="
                        flex

                        flex-1

                        items-center

                        justify-center
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
                >
                    _
                </button>


                <button
                    data-maximize
                    class="retro-window-button"
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


            <!-- right edge resize zone -->

            <div
                data-resize="right"
                class="
                    retro-resize-edge-right
                "
            ></div>


            <!-- bottom edge resize zone -->

            <div
                data-resize="bottom"
                class="
                    retro-resize-edge-bottom
                "
            ></div>


            <!-- classic Mac grow box -->

            <div
                data-resize="corner"
                class="
                    retro-resize-corner
                "
            ></div>

        `;


        this.container.appendChild(
            element
        );


        this.windows.set(
            id,
            {

                app,

                element,

                minimized: false,

                maximized: false,

                previousRect: null

            }
        );


        this.taskbar.addApp(app);


        this.bindWindow(id);


        const content =
            element.querySelector(
                "[data-window-content]"
            );


        if (app.mount) {

            app.mount(
                content,
                {

                    openApp:
                        appId =>
                            this.open(
                                appId
                            )

                }
            );

        }


        this.focus(id);

    }


    getContent(app) {

        if (
            app.type === "project"
        ) {

            return renderProject(
                app
            );

        }


        if (app.render) {

            return app.render();

        }


        return `
            <div class="p-6">
                Unable to open file.
            </div>
        `;

    }


    bindWindow(id) {

        const windowData =
            this.windows.get(id);


        const element =
            windowData.element;


        element.addEventListener(
            "pointerdown",
            () => {

                this.focus(id);

            }
        );


        element
            .querySelector(
                "[data-close]"
            )
            .addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.close(id);

                }
            );


        element
            .querySelector(
                "[data-minimize]"
            )
            .addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.minimize(id);

                }
            );


        element
            .querySelector(
                "[data-maximize]"
            )
            .addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.toggleMaximize(
                        id
                    );

                }
            );


        element.addEventListener(
            "dblclick",
            event => {

                const target =
                    event.target.closest(
                        "[data-open-app]"
                    );


                if (!target) {
                    return;
                }


                this.open(
                    target.dataset.openApp
                );

            }
        );


        this.makeDraggable(id);

        this.makeResizable(id);

    }


    makeDraggable(id) {

        const windowData =
            this.windows.get(id);


        const element =
            windowData.element;


        const titlebar =
            element.querySelector(
                "[data-titlebar]"
            );


        let dragging =
            false;


        let offsetX = 0;

        let offsetY = 0;


        const move =
            event => {

                if (!dragging) {
                    return;
                }


                /*
                 * THIS is the important fix.
                 *
                 * styles are relative to
                 * #windows, so convert pointer
                 * coordinates into #windows'
                 * local coordinate system.
                 */

                const containerRect =
                    this.container
                        .getBoundingClientRect();


                let x =
                    event.clientX -
                    containerRect.left -
                    offsetX;


                let y =
                    event.clientY -
                    containerRect.top -
                    offsetY;


                x =
                    Math.max(
                        0,
                        Math.min(
                            x,
                            this.container
                                .clientWidth -
                            element.offsetWidth
                        )
                    );


                y =
                    Math.max(
                        0,
                        Math.min(
                            y,
                            this.container
                                .clientHeight -
                            element.offsetHeight
                        )
                    );


                element.style.left =
                    `${x}px`;

                element.style.top =
                    `${y}px`;

            };


        const up = () => {

            dragging = false;


            window.removeEventListener(
                "pointermove",
                move
            );


            window.removeEventListener(
                "pointerup",
                up
            );

        };


        titlebar.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.button !== 0
                ) {
                    return;
                }


                if (
                    event.target.closest(
                        "button"
                    )
                ) {
                    return;
                }


                if (
                    windowData.maximized
                ) {
                    return;
                }


                event.preventDefault();


                dragging =
                    true;


                const rect =
                    element
                        .getBoundingClientRect();


                /*
                 * Mouse offset INSIDE titlebar.
                 */

                offsetX =
                    event.clientX -
                    rect.left;


                offsetY =
                    event.clientY -
                    rect.top;


                this.focus(id);


                window.addEventListener(
                    "pointermove",
                    move
                );


                window.addEventListener(
                    "pointerup",
                    up
                );

            }
        );

    }


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


    bindResizeHandle(
        id,
        handle,
        mode,
        cursorMode
    ) {

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


        this.focus(id);


        const element =
            windowData.element;


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


        const maxWidth =
            this.container.clientWidth -
            startLeft;


        const maxHeight =
            this.container.clientHeight -
            startTop;


        let previewWidth =
            startWidth;


        let previewHeight =
            startHeight;


        /*
         * Make preview rectangle.
         *
         * Actual window stays completely
         * untouched while dragging.
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


        const move =
            moveEvent => {


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


        const up = () => {

            /*
             * NOW apply future size.
             */

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
                up
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
            up
        );

    }


    focus(id) {

        const windowData =
            this.windows.get(id);


        if (!windowData) {
            return;
        }


        this.zIndex++;


        for (
            const [
                windowId,
                data
            ] of this.windows
        ) {

            data.element.classList.toggle(
                "active",
                windowId === id
            );

        }


        windowData.element.style.zIndex =
            this.zIndex;


        this.taskbar.setActive(
            id
        );

    }


    close(id) {

        const windowData =
            this.windows.get(id);


        if (!windowData) {
            return;
        }


        windowData.element.remove();


        this.windows.delete(
            id
        );


        this.taskbar.removeApp(
            id
        );

    }


    minimize(id) {

        const windowData =
            this.windows.get(id);


        if (!windowData) {
            return;
        }


        windowData.minimized =
            true;


        windowData.element.style.display =
            "none";

    }


    restore(id) {

        const windowData =
            this.windows.get(id);


        if (!windowData) {
            return;
        }


        windowData.minimized =
            false;


        windowData.element.style.display =
            "flex";


        this.focus(id);

    }


    toggle(id) {

        const windowData =
            this.windows.get(id);


        if (!windowData) {
            return;
        }


        if (
            windowData.minimized
        ) {

            this.restore(id);

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
            z === this.zIndex
        ) {

            this.minimize(id);

        } else {

            this.focus(id);

        }

    }


    toggleMaximize(id) {

        const windowData =
            this.windows.get(id);


        if (!windowData) {
            return;
        }


        const element =
            windowData.element;


        if (
            !windowData.maximized
        ) {

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


            /*
             * #windows already starts below
             * the menu bar.
             */

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

        } else {

            const old =
                windowData.previousRect;


            element.style.left =
                old.left;

            element.style.top =
                old.top;

            element.style.width =
                old.width;

            element.style.height =
                old.height;


            windowData.maximized =
                false;

        }


        this.focus(id);

    }

}