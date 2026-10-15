import {
    osSound
} from "./soundmanager.js";


export class Taskbar {
    constructor(
        container,
        startMenu,
        menuApps
    ) {
        this.container =
            container;

        this.startMenu =
            startMenu;

        this.menuApps =
            menuApps;

        this.runningApps =
            new Map();

        this.onLaunch =
            null;

        this.onToggle =
            null;

        this.render();

        this.renderStartMenu();

        this.startClock();
    }


    render() {
        this.container.innerHTML = `

            <div class="retro-menubar">

            <button
        data-start-button
        class="retro-menu-button"
        aria-label="Open David OS menu"
            >
                <img
                    src="/icons/system-logo.svg"
                    alt=""
                    draggable="false"
                    class="
                        h-4
                        w-4
                        object-contain

                        [image-rendering:pixelated]

                    "
                />
            </button>


                <div
                    class="
                        px-2
                        text-[11px]
                        font-bold
                    "
                >
                    David OS
                </div>


                <div
                    data-running-apps
                    class="
                        flex
                        h-full
                        flex-1
                        items-center
                        overflow-x-auto
                    "
                ></div>


                <div
                    data-clock
                    class="
                        flex
                        h-full
                        min-w-[72px]
                        items-center
                        justify-center
                        border-l
                        border-[#aaa]
                        px-2
                        text-[10px]
                    "
                ></div>

            </div>

        `;


        const startButton =
            this.container.querySelector(
                "[data-start-button]"
            );


        startButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                osSound("menu");

                this.startMenu.classList.toggle(
                    "hidden"
                );
            }
        );


        document.addEventListener(
            "click",
            (event) => {
                const clickedInsideMenu =
                    this.startMenu.contains(
                        event.target
                    );

                const clickedStartButton =
                    startButton.contains(
                        event.target
                    );

                if (
                    !clickedInsideMenu &&
                    !clickedStartButton
                ) {
                    this.startMenu.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }


    renderStartMenu() {
        this.startMenu.innerHTML = `

            <div
                class="
                    w-52
                    border
                    border-black
                    bg-[#d6d6d6]
                    text-black
                    shadow-[2px_2px_0_#000]
                "
            >

                <div
                    class="
                        border-b
                        border-black
                        bg-[#bcbcbc]
                        px-3
                        py-2
                        text-[11px]
                        font-bold
                    "
                >
                    David OS
                </div>


                <div class="py-1">

                    ${this.menuApps
                .map(
                    app => `
                                <button
                                    data-start-app="${app.id}"

                                    class="
                                        flex
                                        w-full
                                        items-center
                                        gap-2

                                        px-3
                                        py-2

                                        text-left
                                        text-[11px]

                                        hover:bg-black
                                        hover:text-white
                                    "
                                >

                                    <img
                                        src="${app.icon}"
                                        draggable="false"

                                        class="
                                            h-5
                                            w-5

                                            object-contain

                                            grayscale
                                            contrast-125

                                            [image-rendering:pixelated]
                                        "
                                    />

                                    <span class="truncate">
                                        ${app.filename}
                                    </span>

                                </button>
                            `
                )
                .join("")}

                </div>


                <div
                    class="
                        border-t
                        border-black
                        px-3
                        py-1
                        text-[9px]
                        text-[#555]
                    "
                >
                    jujuOS v1.0
                </div>

            </div>

        `;


        this.startMenu
            .querySelectorAll(
                "[data-start-app]"
            )
            .forEach(
                button => {
                    button.addEventListener(
                        "click",
                        () => {
                            osSound("open");

                            this.startMenu.classList.add(
                                "hidden"
                            );

                            this.onLaunch?.(
                                button.dataset.startApp
                            );
                        }
                    );
                }
            );
    }


    addApp(app, windowId = app.id) {
        if (
            this.runningApps.has(
                windowId
            )
        ) {
            return;
        }


        const holder =
            this.container.querySelector(
                "[data-running-apps]"
            );


        const button =
            document.createElement(
                "button"
            );


        button.dataset.taskApp =
            windowId;


        button.className = `
            flex
            h-full
            max-w-[150px]
            shrink-0
            items-center
            gap-1

            border-none
            border-l
            border-[#aaa]

            bg-transparent

            px-2

            text-left
            text-[10px]
            text-black

            hover:bg-black
            hover:text-white
        `;


        button.innerHTML = `

            <img
                src="${app.icon}"
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

            <span
                class="
                    truncate
                "
            >
                ${app.filename}
            </span>

        `;


        button.addEventListener(
            "click",
            () => {
                osSound("select");

                this.onToggle?.(
                    windowId
                );
            }
        );


        holder.appendChild(
            button
        );


        this.runningApps.set(
            windowId,
            button
        );
    }


    removeApp(id) {
        const button =
            this.runningApps.get(
                id
            );


        if (!button) {
            return;
        }


        button.remove();


        this.runningApps.delete(
            id
        );
    }


    setActive(id) {

        for (
            const [
                appId,
                button
            ] of this.runningApps
        ) {

            button.classList.toggle(
                "taskbar-app-active",
                appId === id
            );

        }

    }


    clearActive() {

        for (
            const button of
            this.runningApps.values()
        ) {

            button.classList.remove(
                "taskbar-app-active"
            );

        }

    }


    startClock() {
        const update = () => {
            const clock =
                this.container.querySelector(
                    "[data-clock]"
                );


            if (!clock) {
                return;
            }


            const now =
                new Date();


            clock.textContent =
                now.toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        };


        update();


        setInterval(
            update,
            1000
        );
    }
}
