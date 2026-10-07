// implement a fake director, and have ./[project_name].exe call the project.



export const terminalApp = {
  id: "terminal",

  filename: "Terminal.exe",

  title: "Terminal",

  icon: "/icons/terminal.svg",

  type: "terminal",

  desktop: true,

  width: 650,
  height: 420,

  render() {
    return `
      <div
        class="
          flex
          h-full
          flex-col
          bg-black
          p-4
          text-sm
          text-white
        "
      >
        <div
          data-terminal-output
          class="
            os-scrollbar
            selectable
            flex-1
            overflow-y-auto
            whitespace-pre-wrap
          "
        >jujuOS Terminal v1.0

Type "help" for available commands.

</div>

        <div
          class="
            mt-2
            flex
            shrink-0
            items-center
          "
        >
          <span>
            guest@jujuOS:~$
          </span>

          <input
            data-terminal-input
            autocomplete="off"
            spellcheck="false"
            class="
              ml-2
              flex-1
              border-none
              bg-transparent
              text-white
              outline-none
            "
          />
        </div>
      </div>
    `;
  },

  mount(container, context) {
    const input =
      container.querySelector(
        "[data-terminal-input]"
      );

    const output =
      container.querySelector(
        "[data-terminal-output]"
      );

    input.focus();

    container.addEventListener(
      "click",
      () => input.focus()
    );

    input.addEventListener(
      "keydown",
      event => {
        if (event.key !== "Enter") {
          return;
        }

        const command =
          input.value.trim();

        output.textContent +=
          `guest@jujuOS:~$ ${command}\n`;

        runCommand(
          command,
          output,
          context
        );

        input.value = "";

        output.scrollTop =
          output.scrollHeight;
      }
    );
  }
};

function runCommand(
  command,
  output,
  context
) {
  const args =
    command.split(" ");

  const base =
    args[0].toLowerCase();

  switch (base) {
    case "":
      break;

    case "help":
      output.textContent += `
Available commands:

help       show commands
about      open About Me.txt
projects   open Projects
whoami     display user
date       display current date
clear      clear terminal

`;
      break;

    case "about":
      context.openApp("about");
      break;

    case "projects":
      context.openApp("projects");
      break;

    case "whoami":
      output.textContent +=
        "juju\n";
      break;

    case "date":
      output.textContent +=
        `${new Date().toString()}\n`;
      break;

    case "clear":
      output.textContent = "";
      break;

    default:
      output.textContent +=
        `command not found: ${command}\n`;
  }
}