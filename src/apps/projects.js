export const projectApps = [
  {
    id: "nes",

    filename: "NES Emulator.exe",

    title: "NES Emulator",

    icon: "NES",

    type: "project",

    desktop: false,

    width: 650,
    height: 460,

    description:
      "Nintendo Entertainment System emulator built from scratch.",

    details: `
      Implements the Ricoh 2A03 CPU,
      6502 instruction set, memory bus,
      cartridge loading, PPU registers
      and SDL2 rendering.
    `,

    technologies: [
      "C++",
      "SDL2",
      "CMake",
      "6502",
      "Computer Architecture"
    ],

    github: "#"
  },

  {
    id: "compiler",

    filename: "Compiler.exe",

    title: "Compiler",

    icon: "C++",

    type: "project",

    desktop: false,

    width: 650,
    height: 460,

    description:
      "Programming language compiler written from scratch.",

    details: `
      Implements tokenization, lexical
      analysis, parsing, AST generation
      and code generation.
    `,

    technologies: [
      "C++",
      "Compilers",
      "Parsing",
      "Assembly"
    ],

    github: "#"
  },

  {
    id: "renderer",

    filename: "Renderer.exe",

    title: "3D Renderer",

    icon: "3D",

    type: "project",

    desktop: false,

    width: 650,
    height: 460,

    description:
      "Custom 3D renderer written in Rust.",

    details: `
      Explores cameras, matrices,
      transformations, projections
      and low-level graphics.
    `,

    technologies: [
      "Rust",
      "Graphics",
      "Linear Algebra"
    ],

    github: "#"
  },

  {
    id: "lc3",

    filename: "LC3 VM.exe",

    title: "LC-3 Virtual Machine",

    icon: "VM",

    type: "project",

    desktop: false,

    width: 650,
    height: 460,

    description:
      "Virtual machine implementing the LC-3 architecture.",

    details: `
      Implements registers, memory,
      instructions, TRAP routines
      and program loading.
    `,

    technologies: [
      "C",
      "Rust",
      "Virtual Machines",
      "Computer Architecture"
    ],

    github: "#"
  },

  {
    id: "tetris",

    filename: "Tetris.exe",

    title: "Terminal Tetris",

    icon: "T",

    type: "project",

    desktop: false,

    width: 650,
    height: 460,

    description:
      "Terminal implementation of Tetris.",

    details: `
      Implements movement, rotation,
      collision detection, line clearing
      and keyboard input.
    `,

    technologies: [
      "C++",
      "Game Development",
      "Terminal"
    ],

    github: "#"
  },

  {
    id: "html-parser",

    filename: "HTML Parser.exe",

    title: "HTML Parser",

    icon: "<>",

    type: "project",

    desktop: false,

    width: 650,
    height: 460,

    description:
      "HTML tokenizer and DOM parser.",

    details: `
      Implements tokenization, elements,
      text nodes, attributes and basic
      DOM construction.
    `,

    technologies: [
      "Rust",
      "HTML",
      "Parsing",
      "DOM"
    ],

    github: "#"
  }
];

export const projectsApp = {
  id: "projects",

  filename: "Projects",

  title: "Projects",

  icon: "DIR",

  type: "folder",

  desktop: true,

  width: 650,
  height: 450,

  render() {
    return `
      <div
        class="
          grid
          grid-cols-3
          gap-4
          p-5
        "
      >
        ${projectApps
          .map(
            project => `
              <button
                data-open-app="${project.id}"
                class="
                  flex
                  flex-col
                  items-center
                  gap-2
                  border
                  border-transparent
                  p-4
                  text-white
                  hover:border-white
                  hover:bg-white/5
                "
              >
                <div
                  class="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    border
                    border-white
                    text-[10px]
                    font-bold
                  "
                >
                  ${project.icon}
                </div>

                <span
                  class="
                    text-center
                    text-xs
                  "
                >
                  ${project.filename}
                </span>
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }
};

export function renderProject(app) {
  return `
    <div
      class="
        selectable
        p-7
      "
    >
      <div
        class="
          text-[10px]
          tracking-[0.2em]
          text-neutral-500
        "
      >
        EXECUTABLE FILE
      </div>

      <h1
        class="
          mt-2
          text-2xl
          font-bold
        "
      >
        ${app.title}
      </h1>

      <p
        class="
          mt-4
          text-sm
          text-neutral-300
        "
      >
        ${app.description}
      </p>

      <p
        class="
          mt-4
          whitespace-pre-line
          text-sm
          leading-6
          text-neutral-400
        "
      >${app.details}</p>

      <div
        class="
          mt-7
          border-t
          border-neutral-700
          pt-5
        "
      >
        <p
          class="
            mb-3
            text-[10px]
            tracking-[0.2em]
            text-neutral-500
          "
        >
          TECHNOLOGIES
        </p>

        <div
          class="
            flex
            flex-wrap
            gap-2
          "
        >
          ${app.technologies
            .map(
              technology => `
                <span
                  class="
                    border
                    border-white
                    px-2
                    py-1
                    text-xs
                  "
                >
                  ${technology}
                </span>
              `
            )
            .join("")}
        </div>
      </div>

      ${
        app.github
          ? `
            <a
              href="${app.github}"
              target="_blank"
              rel="noopener noreferrer"
              class="
                mt-7
                inline-block
                border
                border-white
                px-4
                py-2
                text-xs
                hover:bg-white
                hover:text-black
              "
            >
              OPEN GITHUB
            </a>
          `
          : ""
      }
    </div>
  `;
}