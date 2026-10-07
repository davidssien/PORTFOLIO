import { Icon } from "./icon.js";

import {
    osSound,
    resizeScratch
} from "./soundmanager.js";


export class Desktop {

    constructor(
        canvas,
        iconContainer,
        apps,
        openApp
    ) {

        this.canvas =
            canvas;

        this.ctx =
            canvas.getContext("2d");


        this.iconContainer =
            iconContainer;

        this.apps =
            apps;

        this.openApp =
            openApp;


        this.icons = [];

        this.selectedIcons =
            new Set();


        this.selectionBox =
            null;

        this.selectionStart =
            null;


        this.resize();

        this.renderIcons();

        this.bindSelection();


        window.addEventListener(
            "resize",
            () => this.resize()
        );

    }


    resize() {

        const dpr =
            window.devicePixelRatio || 1;


        this.canvas.width =
            window.innerWidth * dpr;

        this.canvas.height =
            window.innerHeight * dpr;


        this.canvas.style.width =
            `${window.innerWidth}px`;

        this.canvas.style.height =
            `${window.innerHeight}px`;


        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        this.renderBackground();

    }


    renderBackground() {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        const pixelSize = 5;


        this.ctx.clearRect(
            0,
            0,
            width,
            height
        );


        for (
            let y = 0;
            y < height;
            y += pixelSize
        ) {

            for (
                let x = 0;
                x < width;
                x += pixelSize
            ) {

                const row =
                    Math.floor(
                        y / pixelSize
                    );

                const col =
                    Math.floor(
                        x / pixelSize
                    );


                const isWhite =
                    (row + col) % 2 === 0;


                this.ctx.fillStyle =
                    isWhite
                        ? "#ffffff"
                        : "#bdbdbd";


                this.ctx.fillRect(
                    x,
                    y,
                    pixelSize,
                    pixelSize
                );

            }

        }

    }


    renderIcons() {

        this.iconContainer.innerHTML =
            "";

        this.icons = [];


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className = `
            grid

            w-fit

            grid-flow-col

            grid-rows-6

            gap-1

            p-3
        `;


        const desktopApps =
            this.apps.filter(
                app => app.desktop
            );


        for (
            const app of desktopApps
        ) {

            const icon =
                new Icon(
                    app,
                    this.openApp
                );


            icon.element.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    this.clearSelection();


                    icon.select();


                    this.selectedIcons.add(
                        icon
                    );

                }
            );


            wrapper.appendChild(
                icon.element
            );


            this.icons.push(
                icon
            );

        }


        this.iconContainer.appendChild(
            wrapper
        );

    }

    bindSelection() {
        this.iconContainer.addEventListener(
            "pointerdown",
            (event) => {
                if (event.button !== 0) {
                    return;
                }

                /*
                 * Don't start marquee selection
                 * when clicking directly on an icon.
                 */
                if (
                    event.target.closest(
                        ".desktop-icon"
                    )
                ) {
                    return;
                }

                event.preventDefault();

                this.clearSelection();


                const desktopRect =
                    this.iconContainer
                        .getBoundingClientRect();


                this.selectionStart = {
                    x:
                        event.clientX -
                        desktopRect.left,

                    y:
                        event.clientY -
                        desktopRect.top
                };


                /*
                 * Scratch tracking
                 */
                let lastMouseX =
                    event.clientX;

                let lastMouseY =
                    event.clientY;

                let lastScratchTime =
                    0;


                /*
                 * Create selection rectangle.
                 */
                this.selectionBox =
                    document.createElement(
                        "div"
                    );


                this.selectionBox.className =
                    "desktop-selection-box";


                this.selectionBox.style.left =
                    `${this.selectionStart.x}px`;

                this.selectionBox.style.top =
                    `${this.selectionStart.y}px`;

                this.selectionBox.style.width =
                    "0px";

                this.selectionBox.style.height =
                    "0px";


                this.iconContainer.appendChild(
                    this.selectionBox
                );


                const move =
                    (moveEvent) => {

                        /*
                         * =========================
                         * SCRATCH SOUND
                         * =========================
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


                        /*
                         * Only scratch when the
                         * pointer ACTUALLY moves.
                         *
                         * Holding still = silence.
                         */
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
                         * Update selection rectangle.
                         */
                        this.updateSelectionBox(
                            moveEvent
                        );
                    };


                const up =
                    () => {

                        window.removeEventListener(
                            "pointermove",
                            move
                        );


                        this.selectionBox?.remove();


                        this.selectionBox =
                            null;

                        this.selectionStart =
                            null;
                    };


                window.addEventListener(
                    "pointermove",
                    move
                );


                window.addEventListener(
                    "pointerup",
                    up,
                    {
                        once: true
                    }
                );
            }
        );
    } 

    updateSelectionBox(event) {

        if (
            !this.selectionBox ||
            !this.selectionStart
        ) {
            return;
        }


        const desktopRect =
            this.iconContainer
                .getBoundingClientRect();


        const currentX =
            event.clientX -
            desktopRect.left;


        const currentY =
            event.clientY -
            desktopRect.top;


        const left =
            Math.min(
                this.selectionStart.x,
                currentX
            );


        const top =
            Math.min(
                this.selectionStart.y,
                currentY
            );


        const width =
            Math.abs(
                currentX -
                this.selectionStart.x
            );


        const height =
            Math.abs(
                currentY -
                this.selectionStart.y
            );


        this.selectionBox.style.left =
            `${left}px`;

        this.selectionBox.style.top =
            `${top}px`;

        this.selectionBox.style.width =
            `${width}px`;

        this.selectionBox.style.height =
            `${height}px`;


        const selectionRect = {

            left:
                desktopRect.left +
                left,

            top:
                desktopRect.top +
                top,

            right:
                desktopRect.left +
                left +
                width,

            bottom:
                desktopRect.top +
                top +
                height

        };


        this.updateSelectedIcons(
            selectionRect
        );

    }


    updateSelectedIcons(
        selectionRect
    ) {

        this.selectedIcons.clear();


        for (
            const icon of this.icons
        ) {

            const rect =
                icon.element
                    .getBoundingClientRect();


            const intersects =
                selectionRect.left <
                rect.right &&

                selectionRect.right >
                rect.left &&

                selectionRect.top <
                rect.bottom &&

                selectionRect.bottom >
                rect.top;


            if (intersects) {

                icon.select();

                this.selectedIcons.add(
                    icon
                );

            } else {

                icon.deselect();

            }

        }

    }


    clearSelection() {

        for (
            const icon of this.icons
        ) {

            icon.deselect();

        }


        this.selectedIcons.clear();

    }

}