let soundManagerInstance = null;


export class SoundManager {
    constructor() {
        soundManagerInstance = this;

        this.ctx = null;
        this.masterGain = null;

        window.addEventListener(
            "os-sound",
            (event) => {
                const detail =
                    event.detail;

                if (typeof detail === "string") {
                    this.play(detail);
                    return;
                }

                if (!detail) {
                    return;
                }

                const {
                    name,
                    action = "play"
                } = detail;

                if (action === "play") {
                    this.play(name);
                }
            }
        );

        /*
         * Browsers require a user gesture
         * before audio can start.
         */
        window.addEventListener(
            "pointerdown",
            () => this.unlock(),
            {
                once: true
            }
        );
    }


    async unlock() {
        if (!this.ctx) {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            this.ctx =
                new AudioContext();


            this.masterGain =
                this.ctx.createGain();

            /*
             * Overall volume.
             */
            this.masterGain.gain.value =
                0.35;

            this.masterGain.connect(
                this.ctx.destination
            );
        }


        if (
            this.ctx.state === "suspended"
        ) {
            await this.ctx.resume();
        }
    }


    async play(name) {
        await this.unlock();

        if (
            !this.ctx ||
            this.ctx.state !== "running"
        ) {
            return;
        }


        switch (name) {

            /*
             * Click/select sound
             */
            case "select":
                this.tone(
                    620,
                    0.04,
                    "square",
                    0.07,
                    500
                );
                break;


            /*
             * Opening a window
             */
            case "open":
                this.tone(
                    300,
                    0.06,
                    "square",
                    0.10,
                    420
                );

                setTimeout(
                    () => {
                        this.tone(
                            520,
                            0.07,
                            "square",
                            0.08,
                            700
                        );
                    },
                    45
                );

                break;


            /*
             * Deep wrong-buzzer style close.
             */
            case "close":
                this.buzzer();
                break;


            /*
             * Falling pitch
             */
            case "minimize":
                this.tone(
                    430,
                    0.13,
                    "square",
                    0.12,
                    110
                );
                break;


            /*
             * Rising pitch
             */
            case "maximize":
                this.tone(
                    150,
                    0.13,
                    "square",
                    0.12,
                    560
                );
                break;


            /*
             * Window pickup
             */
            case "drag-start":
                this.tone(
                    800,
                    0.025,
                    "square",
                    0.06,
                    600
                );
                break;


            /*
             * Window release
             */
            case "drag-end":
                this.tone(
                    420,
                    0.035,
                    "square",
                    0.07,
                    300
                );
                break;


            /*
             * Start menu
             */
            case "menu":
                this.tone(
                    700,
                    0.03,
                    "square",
                    0.07,
                    550
                );
                break;


            /*
             * Error sound
             */
            case "error":
                this.tone(
                    180,
                    0.20,
                    "square",
                    0.14,
                    100
                );
                break;


            default:
                console.warn(
                    `Unknown OS sound: ${name}`
                );
        }
    }


    /*
     * Deep buzzer for closing windows.
     */
    buzzer() {
        if (!this.ctx) {
            return;
        }


        const now =
            this.ctx.currentTime;


        const gain =
            this.ctx.createGain();


        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.16,
            now + 0.008
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.23
        );


        const osc1 =
            this.ctx.createOscillator();

        const osc2 =
            this.ctx.createOscillator();


        osc1.type =
            "square";

        osc2.type =
            "sawtooth";


        osc1.frequency.setValueAtTime(
            105,
            now
        );

        osc2.frequency.setValueAtTime(
            112,
            now
        );


        osc1.frequency.linearRampToValueAtTime(
            72,
            now + 0.21
        );

        osc2.frequency.linearRampToValueAtTime(
            79,
            now + 0.21
        );


        osc1.connect(gain);
        osc2.connect(gain);

        gain.connect(
            this.masterGain
        );


        osc1.start(now);
        osc2.start(now);

        osc1.stop(
            now + 0.24
        );

        osc2.stop(
            now + 0.24
        );
    }


    /*
     * Short dry scratch burst.
     *
     * IMPORTANT:
     * this is NOT a looping sound.
     *
     * Call it only when the mouse
     * physically moves while resizing.
     */
    paperScratch(speed = 1) {
        if (
            !this.ctx ||
            this.ctx.state !== "running"
        ) {
            return;
        }


        const now =
            this.ctx.currentTime;


        const clampedSpeed =
            Math.max(
                0.2,
                Math.min(
                    speed,
                    3
                )
            );


        /*
         * Faster movement makes a
         * slightly longer scratch.
         */
        const duration =
            Math.min(
                0.048,
                0.016 +
                clampedSpeed * 0.007
            );


        const bufferLength =
            Math.max(
                1,
                Math.floor(
                    this.ctx.sampleRate *
                    duration
                )
            );


        const buffer =
            this.ctx.createBuffer(
                1,
                bufferLength,
                this.ctx.sampleRate
            );


        const data =
            buffer.getChannelData(0);


        /*
         * Generate rough friction noise.
         *
         * A little correlated wobble is mixed
         * with random noise so it doesn't sound
         * like pure radio/static hiss.
         */
        let previousNoise = 0;

        for (
            let i = 0;
            i < bufferLength;
            i++
        ) {
            const random =
                Math.random() * 2 - 1;


            /*
             * Smooth the noise slightly.
             * This makes it more like rubbing
             * material than harsh white noise.
             */
            const smoothed =
                previousNoise * 0.45 +
                random * 0.55;


            previousNoise =
                smoothed;


            const grain =
                Math.sin(
                    i * 0.20
                ) * 0.10;


            data[i] =
                smoothed * 0.75 +
                grain;
        }


        const source =
            this.ctx.createBufferSource();

        source.buffer =
            buffer;


        /*
         * Remove deep rumble.
         */
        const highpass =
            this.ctx.createBiquadFilter();

        highpass.type =
            "highpass";

        highpass.frequency.value =
            650;


        /*
         * Remove sharp hiss.
         */
        const lowpass =
            this.ctx.createBiquadFilter();

        lowpass.type =
            "lowpass";

        lowpass.frequency.value =
            2800;


        /*
         * Tiny mid-range boost helps
         * create the paper/cardboard scrape.
         */
        const mid =
            this.ctx.createBiquadFilter();

        mid.type =
            "peaking";

        mid.frequency.value =
            1400;

        mid.Q.value =
            1.2;

        mid.gain.value =
            3;


        const gain =
            this.ctx.createGain();


        const volume =
            Math.min(
                0.085,
                0.025 +
                clampedSpeed * 0.016
            );


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        /*
         * Nearly immediate attack.
         */
        gain.gain.linearRampToValueAtTime(
            volume,
            now + 0.002
        );


        /*
         * Fade quickly so each mouse movement
         * sounds like one little scratch.
         */
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );


        source.connect(
            highpass
        );

        highpass.connect(
            mid
        );

        mid.connect(
            lowpass
        );

        lowpass.connect(
            gain
        );

        gain.connect(
            this.masterGain
        );


        source.start(
            now
        );

        source.stop(
            now + duration
        );
    }


    /*
     * Generic retro oscillator sound.
     */
    tone(
        frequency,
        duration,
        type = "square",
        volume = 0.1,
        endFrequency = null
    ) {
        if (
            !this.ctx ||
            this.ctx.state !== "running"
        ) {
            return;
        }


        const now =
            this.ctx.currentTime;


        const oscillator =
            this.ctx.createOscillator();


        const gain =
            this.ctx.createGain();


        oscillator.type =
            type;


        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );


        if (endFrequency) {
            oscillator.frequency
                .exponentialRampToValueAtTime(
                    Math.max(
                        endFrequency,
                        1
                    ),
                    now + duration
                );
        }


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.005
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            this.masterGain
        );


        oscillator.start(
            now
        );


        oscillator.stop(
            now + duration + 0.01
        );
    }
}


/*
 * Normal one-shot OS sound:
 *
 * osSound("open");
 * osSound("close");
 * osSound("minimize");
 * osSound("maximize");
 */
export function osSound(name) {
    window.dispatchEvent(
        new CustomEvent(
            "os-sound",
            {
                detail: {
                    name,
                    action: "play"
                }
            }
        )
    );
}


/*
 * Resize-specific scratch.
 *
 * ONLY call this from pointermove while
 * the resize handle is currently held.
 */
export function resizeScratch(speed = 1) {
    if (!soundManagerInstance) {
        return;
    }

    soundManagerInstance
        .unlock()
        .then(() => {
            soundManagerInstance
                .paperScratch(
                    speed
                );
        });
}

