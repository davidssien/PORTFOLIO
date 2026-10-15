export class LoadingScreen {

    constructor(container) {

        this.container =
            container;


        this.lines = [

            {
                type: "ok",
                text:
                    "Reached target System Initialization."
            },

            {
                type: "ok",
                text:
                    "Mounted Kernel Debug File System."
            },

            {
                type: "ok",
                text:
                    "Mounted POSIX Message Queue File System."
            },

            {
                type: "ok",
                text:
                    "Started Apply Kernel Variables."
            },

            {
                type: "plain",
                text:
                    "Starting Load Kernel Modules..."
            },

            {
                type: "ok",
                text:
                    "Finished Load Kernel Modules."
            },

            {
                type: "plain",
                text:
                    "Starting Create System Users..."
            },

            {
                type: "ok",
                text:
                    "Finished Create System Users."
            },

            {
                type: "ok",
                text:
                    "Started Journal Service."
            },

            {
                type: "plain",
                text:
                    "Starting Network Manager..."
            },

            {
                type: "ok",
                text:
                    "Started Network Manager."
            },

            {
                type: "ok",
                text:
                    "Reached target Network."
            },

            {
                type: "plain",
                text:
                    "Starting Graphical Interface..."
            },

            {
                type: "ok",
                text:
                    "Started Window Manager."
            },

            {
                type: "ok",
                text:
                    "Loaded desktop resources."
            },

            {
                type: "ok",
                text:
                    "Mounted /projects."
            },

            {
                type: "plain",
                text:
                    "Starting jujuOS graphical shell..."
            },

            {
                type: "ok",
                text:
                    "Started jujuOS graphical shell."
            },

            {
                type: "ok",
                text:
                    "Reached target Graphical Interface."
            }

        ];
    }


    async start() {
        this.renderBootScreen();

        const log =
            this.container.querySelector(
                "[data-boot-log]"
            );

        for (const line of this.lines) {
            const row =
                document.createElement("div");

            row.className =
                "boot-line";

            if (line.type === "ok") {
                row.innerHTML = `
                <span class="boot-status boot-status-ok">[ OK ]</span>
                <span class="boot-message">${line.text}</span>
            `;
            }

            else if (line.type === "warn") {
                row.innerHTML = `
                <span class="boot-status boot-status-warn">[WARN]</span>
                <span class="boot-message">${line.text}</span>
            `;
            }

            else {
                row.innerHTML = `
                <span class="boot-status boot-status-plain">[ .. ]</span>
                <span class="boot-message">${line.text}</span>
            `;
            }

            log.appendChild(row);
            log.scrollTop = log.scrollHeight;

            await this.sleep(
                40 + Math.random() * 55
            );
        }

        await this.sleep(350);

        await this.fadeOut();
    }

    renderBootScreen() {

        this.container.style.display =
            "block";


        this.container.style.opacity =
            "1";


        this.container.innerHTML = `

            <div
                class="boot-screen"
            >

                <div
                    data-boot-log
                    class="boot-log"
                ></div>

            </div>

        `;
    }



    async showWelcomePhase() {

        this.container.innerHTML = `

            <div
                class="
                    flex
                    h-full
                    w-full

                    items-center
                    justify-center

                    bg-black
                "
            >

                <div
                    class="
                        flex

                        h-[240px]
                        w-[240px]

                        max-h-[65vw]
                        max-w-[65vw]

                        flex-col

                        items-center
                        justify-center

                        bg-white

                        text-black
                    "
                >

                    <div
                        class="
                            text-center

                            text-[20px]

                            font-semibold

                            leading-[1.15]
                        "
                    >
                        Welcome
                    </div>


                    <div
                        class="
                            mt-1

                            text-center

                            text-[20px]

                            font-semibold

                            leading-[1.15]
                        "
                    >
                        to my System
                    </div>


                    <div
                        class="
                            mt-5

                            text-[9px]

                            font-medium

                            tracking-[0.28em]

                            text-[#555]
                        "
                    >
                        JUJUOS
                    </div>

                </div>

            </div>

        `;


        await this.sleep(
            1100
        );
    }



    async fadeOut() {

        this.container.style.transition =
            "opacity 450ms ease";


        this.container.style.opacity =
            "0";


        await this.sleep(
            450
        );


        this.container.style.display =
            "none";
    }



    sleep(ms) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }
}