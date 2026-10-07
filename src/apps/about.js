export const aboutApp = {
  id: "about",

  filename: "About Me.txt",

  title: "About Me",

  icon: "TXT",

  type: "text",

  desktop: true,

  width: 560,
  height: 420,

  render() {
    return `
      <pre
        class="
          selectable
          whitespace-pre-wrap
          p-6
          text-sm
          leading-6
          text-black
        "
      >JUJU
================================

Computer Science Student

INTERESTS
--------------------------------
Systems Programming
Compilers
Graphics
Emulators
Operating Systems
Low-Level Software

ABOUT
--------------------------------
I enjoy building software that forces me
to understand what is happening underneath
the abstractions most programmers interact
with.

This portfolio is itself an experiment:
a small browser-based operating system.

EOF</pre>
    `;
  }
};