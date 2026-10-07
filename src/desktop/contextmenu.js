import {
    osSound
} from "./soundmanager.js";


export class ContextMenu {
    constructor(
        container,
        openApp,
        windowManager
    ) {
        this.container =
            container;

        this.openApp =
            openApp;

        this.windowManager =
            windowManager;


        this.bind();
    }


    bind() {
        document.addEventListener(
            "contextmenu",
            event => {
                event.preventDefault();


                /*
                 * =========================
                 * WINDOW TITLE BAR
                 * =========================
                 */

                const titlebar =
                    event.target.closest(
                        "[data-titlebar]"
                    );


                if (titlebar) {

                    const windowElement =
                        titlebar.closest(
                            ".retro-window"
                        );


                    const appId =
                        windowElement?.dataset
                            .appId;


                    if (appId) {

                        this.showWindowMenu(
                            event.clientX,
                            event.clientY,
                            appId
                        );

                    }


                    return;
                }



                /*
                 * =========================
                 * DESKTOP ICON
                 * =========================
                 */

                const icon =
                    event.target.closest(
                        ".desktop-icon"
                    );


                if (icon) {

                    const appId =
                        icon.dataset.appId;


                    if (appId) {

                        this.showIconMenu(
                            event.clientX,
                            event.clientY,
                            appId
                        );

                    }


                    return;
                }



                /*
                 * =========================
                 * INSIDE WINDOW
                 * =========================
                 *
                 * Don't show desktop menu
                 * inside normal window content.
                 */

                if (
                    event.target.closest(
                        ".retro-window"
                    )
                ) {

                    this.hide();

                    return;
                }



                /*
                 * =========================
                 * DESKTOP
                 * =========================
                 */

                this.showDesktopMenu(
                    event.clientX,
                    event.clientY
                );
            }
        );



        /*
         * Normal left click closes menu.
         */

        document.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.button === 2
                ) {
                    return;
                }


                if (
                    this.container.contains(
                        event.target
                    )
                ) {
                    return;
                }


                this.hide();
            }
        );



        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {
                    this.hide();
                }

            }
        );


        window.addEventListener(
            "resize",
            () => this.hide()
        );
    }



    /*
     * =========================
     * WINDOW MENU
     * =========================
     */

    showWindowMenu(
        x,
        y,
        appId
    ) {
        const windowData =
            this.windowManager
                .windows
                .get(appId);


        if (!windowData) {
            return;
        }


        this.show(
            [
                {
                    label:
                        "Minimize",

                    action:
                        () => {
                            this.windowManager
                                .minimize(
                                    appId
                                );
                        }
                },


                {
                    label:
                        windowData.maximized
                            ? "Restore"
                            : "Maximize",

                    action:
                        () => {
                            this.windowManager
                                .toggleMaximize(
                                    appId
                                );
                        }
                },


                {
                    separator:
                        true
                },


                {
                    label:
                        "Delete Window",

                    bold:
                        true,

                    action:
                        () => {
                            this.windowManager
                                .close(
                                    appId
                                );
                        }
                }
            ],

            x,
            y
        );
    }



    /*
     * =========================
     * DESKTOP MENU
     * =========================
     */

    showDesktopMenu(
        x,
        y
    ) {
        this.show(
            [
                {
                    label:
                        "Projects",

                    icon:
                        "/icons/folder.svg",

                    action:
                        () => {
                            this.openApp(
                                "projects"
                            );
                        }
                },


                {
                    label:
                        "Terminal",

                    icon:
                        "/icons/terminal.svg",

                    action:
                        () => {
                            this.openApp(
                                "terminal"
                            );
                        }
                },


                {
                    label:
                        "About This Computer",

                    icon:
                        "/icons/text.svg",

                    action:
                        () => {
                            this.openApp(
                                "about"
                            );
                        }
                },


                {
                    separator:
                        true
                },


                {
                    label:
                        "Refresh Desktop",

                    action:
                        () => {
                            window.location.reload();
                        }
                }
            ],

            x,
            y
        );
    }



    /*
     * =========================
     * ICON MENU
     * =========================
     */

    showIconMenu(
        x,
        y,
        appId
    ) {
        this.show(
            [
                {
                    label:
                        "Open",

                    bold:
                        true,

                    action:
                        () => {
                            this.openApp(
                                appId
                            );
                        }
                },


                {
                    separator:
                        true
                },


                {
                    label:
                        "Get Info",

                    action:
                        () => {

                            console.log(
                                "Info:",
                                appId
                            );

                        }
                }
            ],

            x,
            y
        );
    }



    /*
     * =========================
     * RENDER MENU
     * =========================
     */

    show(
        items,
        x,
        y
    ) {
        this.container.innerHTML = `
            <div
                data-context-panel
                class="retro-context-menu"
            >

                ${items
                    .map(
                        (
                            item,
                            index
                        ) => {

                            if (
                                item.separator
                            ) {

                                return `
                                    <div
                                        class="
                                            retro-context-separator
                                        "
                                    ></div>
                                `;

                            }


                            return `
                                <button
                                    data-context-item="${index}"

                                    class="
                                        retro-context-item

                                        ${
                                            item.bold
                                                ? "font-bold"
                                                : ""
                                        }
                                    "
                                >

                                    ${
                                        item.icon
                                            ? `
                                                <img
                                                    src="${item.icon}"

                                                    draggable="false"

                                                    class="
                                                        h-4
                                                        w-4

                                                        object-contain

                                                        grayscale
                                                        contrast-125

                                                        [image-rendering:pixelated]
                                                    "
                                                />
                                            `
                                            : `
                                                <span
                                                    class="
                                                        h-4
                                                        w-4
                                                    "
                                                ></span>
                                            `
                                    }

                                    <span>
                                        ${item.label}
                                    </span>

                                </button>
                            `;
                        }
                    )
                    .join("")}

            </div>
        `;



        this.container.classList.remove(
            "hidden"
        );


        this.container.style.left =
            `${x}px`;

        this.container.style.top =
            `${y}px`;



        /*
         * Keep menu inside screen.
         */

        requestAnimationFrame(
            () => {

                const panel =
                    this.container
                        .querySelector(
                            "[data-context-panel]"
                        );


                if (!panel) {
                    return;
                }


                const rect =
                    panel
                        .getBoundingClientRect();


                let finalX =
                    x;

                let finalY =
                    y;


                if (
                    rect.right >
                    window.innerWidth
                ) {

                    finalX =
                        window.innerWidth -
                        rect.width -
                        5;

                }


                if (
                    rect.bottom >
                    window.innerHeight
                ) {

                    finalY =
                        window.innerHeight -
                        rect.height -
                        5;

                }


                this.container.style.left =
                    `${Math.max(
                        2,
                        finalX
                    )}px`;


                this.container.style.top =
                    `${Math.max(
                        28,
                        finalY
                    )}px`;

            }
        );



        /*
         * Actions
         */

        items.forEach(
            (
                item,
                index
            ) => {

                if (
                    item.separator
                ) {
                    return;
                }


                const button =
                    this.container
                        .querySelector(
                            `[data-context-item="${index}"]`
                        );


                button?.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        osSound(
                            "select"
                        );


                        this.hide();


                        item.action?.();

                    }
                );

            }
        );


        osSound(
            "menu"
        );
    }



    /*
     * =========================
     * HIDE
     * =========================
     */

    hide() {
        this.container.classList.add(
            "hidden"
        );


        this.container.innerHTML =
            "";
    }
}