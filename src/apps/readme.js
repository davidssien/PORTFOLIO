export const readmeApp = {
    id: "readme",

    filename: "README.txt",

    title: "README.txt",

    icon: "/icons/text.svg",

    type: "text",

    desktop: true,

    width: 560,
    height: 460,

    render() {
        return `
            <div
                class="
                    selectable
                    h-full
                    bg-[#e4e4e4]
                    p-5
                    text-black
                "
            >
                <pre
                    class="
                        whitespace-pre-wrap
                        font-mono
                        text-[11px]
                        leading-[1.6]
                    "
                >Welcome to jujuOS
=================

This is my personal portfolio, built as a small
desktop operating system.

Instead of navigating a traditional website,
you can explore my work like a computer desktop.


GETTING STARTED
---------------

• Double-click icons to open them.

• Drag windows using their title bars.

• Resize windows from the bottom-right corner.

• Minimize and maximize windows using the
  controls in the title bar.

• Right-click the desktop for more options.

• Right-click a window title bar to minimize,
  maximize, restore, or close it.

• Click running applications in the top bar
  to switch between them.


FILES
-----

Projects/
    A collection of software projects I've built.

About.txt
    Information about me, my interests,
    and what I'm currently working on.

Terminal
    An interactive terminal interface.

README.txt
    You're reading it.


SYSTEM
------

Name:        David OS
Interface:   Desktop Environment
Built With:  JavaScript, Vite, Tailwind CSS
Style:       Classic Macintosh / Retro Unix

Features:
    - Window management
    - Window physics
    - Desktop selection
    - Context menus
    - Custom cursor
    - Sound effects
    - Resizable windows
    - Startup sequence


ABOUT THIS PORTFOLIO
--------------------

I built this portfolio because I wanted something
that felt more personal than a normal developer
website.

A lot of my interests are in lower-level software,
systems, compilers, graphics, emulation, and
understanding how computers actually work.

So naturally, I made the portfolio itself feel
like a computer.


Have fun exploring.

- David Essien
</pre>
            </div>
        `;
    }
};