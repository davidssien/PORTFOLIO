export class Icon {
    constructor(app, onOpen) {
        this.app = app;
        this.onOpen = onOpen;

        this.element =
            document.createElement(
                "button"
            );

        this.create();
    }


    create() {
        this.element.type = "button";
        this.element.className = `
            desktop-icon

            flex
            h-[110px]
            w-[110px]

            flex-col
            items-center

            gap-2

            border
            border-transparent

            p-2

            text-black

            outline-none
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-black
        `;

        this.element.dataset.appId =
        this.app.id;


        this.element.innerHTML = `

            <img
                src="${this.app.icon}"

                draggable="false"

                alt=""

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


            <span
                class="
                    max-w-[104px]

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
            (event) => {
                event.stopPropagation();

                this.onOpen(
                    this.app.id
                );
            }
        );
    }


    select() {
        this.element.classList.add(
            "border-[#555]"
        );


        const label =
            this.element.querySelector(
                "span"
            );


        const image =
            this.element.querySelector(
                "img"
            );


        label.classList.remove(
            "bg-[#e7e7e7]",
            "text-black"
        );


        label.classList.add(
            "bg-[#555]",
            "text-white"
        );


        image.classList.add(
            "brightness-75"
        );
    }


    deselect() {
        this.element.classList.remove(
            "border-[#555]"
        );


        const label =
            this.element.querySelector(
                "span"
            );


        const image =
            this.element.querySelector(
                "img"
            );


        label.classList.remove(
            "bg-[#555]",
            "text-white"
        );


        label.classList.add(
            "bg-[#e7e7e7]",
            "text-black"
        );


        image.classList.remove(
            "brightness-75"
        );
    }
}