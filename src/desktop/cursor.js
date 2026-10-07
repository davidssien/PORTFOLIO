export class Cursor {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        this.x = 0;
        this.y = 0;

        this.visible = false;

        this.mode = "default";

        this.resize();

        this.bindEvents();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        window.addEventListener(
            "retro-cursor",
            event => {

                this.mode =
                    event.detail || "default";

            }
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

    }


    bindEvents() {

        window.addEventListener(
            "pointermove",
            event => {

                this.x =
                    event.clientX;

                this.y =
                    event.clientY;

                this.visible =
                    true;

            }
        );


        document.addEventListener(
            "mouseleave",
            () => {

                this.visible =
                    false;

            }
        );


        document.addEventListener(
            "mouseenter",
            () => {

                this.visible =
                    true;

            }
        );

    }


    render() {

        const ctx =
            this.ctx;


        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        if (!this.visible) {
            return;
        }


        switch (this.mode) {

            case "resize-ew":

                this.drawHorizontalResize();

                break;


            case "resize-ns":

                this.drawVerticalResize();

                break;


            case "resize-nwse":

                this.drawDiagonalResize();

                break;


            default:

                this.drawArrow();

        }

    }


    drawArrow() {

        const ctx =
            this.ctx;

        const x =
            Math.round(this.x);

        const y =
            Math.round(this.y);


        ctx.save();

        ctx.translate(
            x,
            y
        );


        /*
         * IMPORTANT:
         * (0, 0) is the visible cursor tip.
         *
         * Browser pointer events are also
         * clientX/clientY.
         *
         * So the visible tip and the real
         * click position now match exactly.
         */

        ctx.beginPath();

        ctx.moveTo(0, 0);

        ctx.lineTo(0, 19);

        ctx.lineTo(5, 14);

        ctx.lineTo(9, 23);

        ctx.lineTo(13, 21);

        ctx.lineTo(9, 13);

        ctx.lineTo(18, 13);

        ctx.closePath();


        ctx.fillStyle =
            "#ffffff";

        ctx.fill();


        ctx.strokeStyle =
            "#000000";

        ctx.lineWidth = 2;

        ctx.lineJoin =
            "miter";

        ctx.stroke();


        ctx.restore();

    }


    drawHorizontalResize() {

        const ctx =
            this.ctx;

        const x =
            Math.round(this.x);

        const y =
            Math.round(this.y);


        ctx.save();

        ctx.translate(x, y);


        ctx.strokeStyle =
            "#000000";

        ctx.fillStyle =
            "#ffffff";

        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(-8, 0);
        ctx.lineTo(-3, -4);
        ctx.lineTo(-3, 4);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(8, 0);
        ctx.lineTo(3, -4);
        ctx.lineTo(3, 4);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        ctx.restore();

    }


    drawVerticalResize() {

        const ctx =
            this.ctx;

        const x =
            Math.round(this.x);

        const y =
            Math.round(this.y);


        ctx.save();

        ctx.translate(x, y);


        ctx.strokeStyle =
            "#000000";

        ctx.fillStyle =
            "#ffffff";

        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(0, -8);
        ctx.lineTo(-4, -3);
        ctx.lineTo(4, -3);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(0, 8);
        ctx.lineTo(-4, 3);
        ctx.lineTo(4, 3);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        ctx.restore();

    }


    drawDiagonalResize() {

        const ctx =
            this.ctx;

        const x =
            Math.round(this.x);

        const y =
            Math.round(this.y);


        ctx.save();

        ctx.translate(x, y);

        ctx.rotate(
            Math.PI / 4
        );


        ctx.strokeStyle =
            "#000000";

        ctx.fillStyle =
            "#ffffff";

        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(-8, 0);
        ctx.lineTo(-3, -4);
        ctx.lineTo(-3, 4);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(8, 0);
        ctx.lineTo(3, -4);
        ctx.lineTo(3, 4);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        ctx.restore();

    }

}