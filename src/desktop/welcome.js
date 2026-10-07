import {
    osSound
} from "./soundmanager.js";


export class WelcomeScreen {
    constructor(container) {
        this.container =
            container;

        this.keyHandler =
            null;
    }


    show() {
        this.container.classList.remove(
            "hidden"
        );


        this.container.innerHTML = `
            <div
                class="
                    fixed
                    inset-0
                    z-[8500]

                    flex
                    items-center
                    justify-center

                    pointer-events-none
                "
            >

                <div
                    data-welcome-window

                    class="
                        pointer-events-auto

                        w-[390px]
                        max-w-[90vw]

                        border
                        border-black

                        bg-[#d6d6d6]

                        text-black

                        shadow-[3px_3px_0_rgba(0,0,0,0.45)]
                    "
                >

                    <!-- title bar -->

                    <div
                        class="
                            flex
                            h-[22px]
                            items-center

                            border-b
                            border-black

                            bg-[repeating-linear-gradient(to_bottom,#fff_0px,#fff_1px,#999_1px,#999_2px)]
                        "
                    >

                        <div
                            class="
                                mx-auto

                                bg-[#d6d6d6]

                                px-3

                                text-[11px]
                                font-bold
                            "
                        >
                            Welcome
                        </div>

                    </div>


                    <!-- body -->

                    <div
                        class="
                            flex
                            gap-4

                            p-5
                        "
                    >

                        <img
                            src="/icons/computer.svg"

                            draggable="false"

                            class="
                                h-14
                                w-14

                                shrink-0

                                object-contain

                                grayscale
                                contrast-125

                                [image-rendering:pixelated]
                            "
                        />


                        <div
                            class="flex-1"
                        >

                            <div
                                class="
                                    text-[14px]
                                    font-bold
                                "
                            >
                                Welcome to jujuOS
                            </div>


                            <p
                                class="
                                    mt-3

                                    text-[11px]
                                    leading-[18px]

                                    text-[#333]
                                "
                            >
                                Welcome to my system.
                                This portfolio is built like a small
                                desktop environment, so feel free to
                                explore it like one.
                            </p>


                            <p
                                class="
                                    mt-3

                                    text-[10px]
                                    leading-[16px]

                                    text-[#666]
                                "
                            >
                                Open files, launch projects, use the
                                terminal, right-click the desktop, and
                                mess around with the windows.
                            </p>


                            <div
                                class="
                                    mt-5

                                    flex
                                    justify-end
                                "
                            >

                                <button
                                    data-welcome-close

                                    class="
                                        min-w-[70px]

                                        border
                                        border-black

                                        bg-[#d6d6d6]

                                        px-4
                                        py-1

                                        text-[11px]
                                        font-bold

                                        shadow-[inset_1px_1px_0_white,inset_-1px_-1px_0_#777]

                                        active:shadow-[inset_1px_1px_0_#777,inset_-1px_-1px_0_white]
                                    "
                                >
                                    OK
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;


        osSound(
            "open"
        );


        const closeButton =
            this.container.querySelector(
                "[data-welcome-close]"
            );


        closeButton.addEventListener(
            "click",
            () => {

                osSound(
                    "select"
                );

                this.hide();

            }
        );


        this.keyHandler =
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === "Escape"
                ) {
                    this.hide();
                }

            };


        window.addEventListener(
            "keydown",
            this.keyHandler
        );
    }


    hide() {
        if (this.keyHandler) {

            window.removeEventListener(
                "keydown",
                this.keyHandler
            );

        }


        this.container.innerHTML =
            "";


        this.container.classList.add(
            "hidden"
        );
    }
}