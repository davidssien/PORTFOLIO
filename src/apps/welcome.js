export const welcomeApp = {
    id: "welcome",

    filename: "Welcome",

    icon: "/icons/system-logo.svg",

    width: 900,
    height: 250,

    allowMultipleInstances: false,

    centered: true,

    frameless: true,

    draggable: false,
    resizable: false,

    maximizable: false,
    minimizable: false,

    showInTaskbar: false,

    render() {
        return `
            <div class="mac-welcome-frame">

                <div class="mac-welcome-inner">

                    <div class="mac-welcome-row">

                        <img
                            src="/icons/system-logo.svg"
                            draggable="false"
                            alt="System logo"
                            class="mac-welcome-icon"
                        />

                        <div class="mac-welcome-message">
                            Welcome to my System.
                        </div>

                    </div>

                </div>

            </div>
        `;
    }
};