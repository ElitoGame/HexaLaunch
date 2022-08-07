// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

let t: NodeJS.Timeout;

window.addEventListener('mousemove', event => {
    if (event.target === document.documentElement) {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
        if (t) clearTimeout(t)
        t = setTimeout(function () {
            window.electronAPI.setIgnoreMouseEvents(false, { forward: false });
        }, 150)
    } else {
        window.electronAPI.setIgnoreMouseEvents(false, { forward: false });
    }
});

window.onload = function () {
    window.electronAPI.toggleWindow((event, value) => {
        const body = document.querySelector('body') as HTMLElement;
        if (!value) {
            body.classList.remove('hidden');
            // setTimeout(function () {

            // }, 1500);
        } else {
            body.classList.add('hidden');
        }
        console.log(value + ", " + body.classList);
    });
}

export default {};