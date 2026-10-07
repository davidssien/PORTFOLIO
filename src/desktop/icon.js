export class Icon {

    constructor(app, onOpen) {

        this.app = app;

        this.onOpen =
            onOpen;

        this.element =
            document.createElement(
                "button"
            );

        this.create();

    }


    create() {

        this.element.className = `
            desktop-icon

            flex
            h-[88px]
            w-[96px]

            flex-col
            items-center

            gap-1

            border
            border-transparent

            p-2

            text-black

            outline-none
        `;


        this.element.innerHTML = `

            <img

                src="${this.app.icon}"

                draggable="false"

                class="
                    h-10
                    w-10

                    object-contain

                    grayscale

                    contrast-125

                    [image-rendering:pixelated]
                "

            />

            <span
                class="
                    max-w-[94px]

                    bg-[#e7e7e7]

                    px-1

                    text-center

                    text-[11px]

                    font-bold

                    leading-tight

                    text-black
                "
            >

                ${this.app.filename}

            </span>

        `;


        this.element.addEventListener(
            "dblclick",
            event => {

                event.stopPropagation();

                this.onOpen(
                    this.app.id
                );

            }
        );

    }


    select() {

        this.element.classList.add(
            "border-black"
        );

        const label =
            this.element.querySelector(
                "span"
            );

        label.classList.remove(
            "bg-[#e7e7e7]",
            "text-black"
        );

        label.classList.add(
            "bg-black",
            "text-white"
        );

    }


    deselect() {

        this.element.classList.remove(
            "border-black"
        );

        const label =
            this.element.querySelector(
                "span"
            );

        label.classList.remove(
            "bg-black",
            "text-white"
        );

        label.classList.add(
            "bg-[#e7e7e7]",
            "text-black"
        );

    }

}