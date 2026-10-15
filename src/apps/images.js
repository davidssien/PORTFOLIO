/*
 * Automatically load every image
 * inside src/assets/pictures/
 */

const imageModules =
    import.meta.glob(
        "../assets/pictures/*.{png,gif,jpg,jpeg,webp}",
        {
            eager: true,
            query: "?url",
            import: "default"
        }
    );


export function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

const bundledImages = {
    '/media/moonfish.png': '/media/moonfish.png',
    '/media/orbit-club.png': '/media/orbit-club.png',
    '/media/moonfish.gif': '/media/moonfish.gif'
};

function getFilename(path) {
    return path
        .split("/")
        .pop();
}


function slugify(filename) {
    return filename
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );
}

/*
 * =========================
 * IMAGE RENDERER
 * =========================
 */

export function renderImage(app) {
    return `
        <div
            class="
                flex
                h-full
                w-full
                items-center
                justify-center

                overflow-auto

                bg-[#bcbcbc]

                p-4
            "
        >

            <img
                src="${escapeHTML(app.src)}"

                alt="${escapeHTML(app.filename)}"

                draggable="false"

                class="
                    block

                    max-h-full
                    max-w-full

                    object-contain

                    border
                    border-black

                    bg-white
                "
            />

        </div>
    `;
}



/*
 * =========================
 * GENERATE IMAGE APPS
 * =========================
 */

export const imageApps =
    Object.entries(
        { ...bundledImages, ...imageModules }
    )
        .map(
            (
                [
                    path,
                    src
                ],
                index
            ) => {

                const filename =
                    getFilename(
                        path
                    );


                const app = {
                    id:
                        `image-${index}-${slugify(filename)}`,

                    filename,

                    title:
                        filename,

                    /*
                     * Actual image is also
                     * used as its folder icon.
                     */
                    icon:
                        src,

                    src,

                    type:
                        "image",

                    desktop:
                        false,

                    width:
                        640,

                    height:
                        480,


                    /*
                     * IMPORTANT:
                     *
                     * Lets the same image
                     * open several times.
                     */
                    allowMultipleInstances:
                        true,


                    showInTaskbar:
                        true
                };


                app.render =
                    () =>
                        renderImage(
                            app
                        );


                return app;
            }
        )
        .sort(
            (
                a,
                b
            ) =>
                a.filename.localeCompare(
                    b.filename
                )
        );



/*
 * =========================
 * PICTURES FOLDER
 * =========================
 */

export const picturesApp = {
    openFilesOnClick: true,
    id:
        "pictures",

    filename:
        "Pictures",

    title:
        "Pictures",

    icon:
        "/icons/folder.svg",

    type:
        "folder",

    desktop:
        true,

    width:
        620,

    height:
        440,


    render() {

        if (
            imageApps.length === 0
        ) {
            return `
                <div
                    class="
                        p-6
                        text-[11px]
                        text-black
                    "
                >
                    This folder is empty.
                </div>
            `;
        }


        return `
            <div
                class="
                    grid
                    grid-cols-[repeat(auto-fill,110px)]

                    content-start

                    gap-x-5
                    gap-y-5

                    p-5
                "
            >

                ${imageApps
                    .map(
                        app => `

                            <button
                                data-open-app="${app.id}"

                                class="
                                    flex
                                    w-[110px]

                                    flex-col
                                    items-center

                                    gap-2

                                    border
                                    border-transparent

                                    p-2

                                    text-black

                                    outline-none

                                    hover:border-black
                                "
                            >

                                <div
                                    class="
                                        flex
                                        h-[72px]
                                        w-[82px]

                                        items-center
                                        justify-center

                                        overflow-hidden

                                        border
                                        border-[#777]

                                        bg-white
                                    "
                                >

                                    <img
                                        src="${escapeHTML(app.src)}"

                                        alt=""

                                        draggable="false"

                                        class="
                                            max-h-full
                                            max-w-full

                                            object-contain
                                        "
                                    />

                                </div>


                                <span
                                    class="
                                        max-w-[105px]

                                        bg-[#e7e7e7]

                                        px-1

                                        text-center
                                        text-[10px]
                                        font-bold
                                        leading-tight

                                        break-all
                                    "
                                >
                                    ${escapeHTML(app.filename)}
                                </span>

                            </button>

                        `
                    )
                    .join("")}

            </div>
        `;
    }
};