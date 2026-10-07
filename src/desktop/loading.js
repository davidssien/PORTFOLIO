export class LoadingScreen {
    constructor(container) {
        this.container =
            container;
    }


    async start() {
        this.container.innerHTML = `

            <div
                class="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center

                    bg-[#111]

                    text-white
                "
            >

                <div
                    class="
                        w-[360px]
                        max-w-[80vw]

                        text-center
                    "
                >

                    <div
                        class="
                            mb-5

                            text-[28px]
                            font-bold

                            tracking-[0.12em]
                        "
                    >
                        jujuOS
                    </div>


                    <div
                        class="
                            mx-auto

                            h-[14px]
                            w-full

                            border
                            border-black

                            bg-white

                            p-[2px]
                        "
                    >

                        <div
                            data-loading-bar

                            class="
                                h-full
                                w-0

                                bg-black
                            "
                        ></div>

                    </div>


                    <div
                        data-loading-text

                        class="
                            mt-3

                            text-[10px]

                            text-[#555]
                        "
                    >
                        Starting...
                    </div>

                </div>

            </div>

        `;


        const bar =
            this.container.querySelector(
                "[data-loading-bar]"
            );


        const text =
            this.container.querySelector(
                "[data-loading-text]"
            );


        const steps = [
            {
                percent: 12,
                text: "Initializing system..."
            },

            {
                percent: 27,
                text: "Loading window manager..."
            },

            {
                percent: 43,
                text: "Loading applications..."
            },

            {
                percent: 58,
                text: "Loading desktop..."
            },

            {
                percent: 72,
                text: "Loading icons..."
            },

            {
                percent: 87,
                text: "Starting interface..."
            },

            {
                percent: 100,
                text: "Ready."
            }
        ];


        for (
            const step of steps
        ) {
            bar.style.width =
                `${step.percent}%`;

            text.textContent =
                step.text;


            await this.sleep(
                180 +
                Math.random() * 160
            );
        }


        await this.sleep(
            250
        );


        this.container.style.transition =
            "opacity 280ms ease";


        this.container.style.opacity =
            "0";


        await this.sleep(
            280
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