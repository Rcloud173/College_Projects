function showOfflineBanner() {
    var banner = document.getElementById("offline-banner");
    if (!banner) {
        return;
    }

    if (navigator.onLine) {
        banner.classList.remove("show");
    } else {
        banner.classList.add("show");
    }
}

function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function getInstallButton() {
    var button = document.getElementById("install-button");
    if (!button) {
        button = document.createElement("button");
        button.id = "install-button";
        button.type = "button";
        button.textContent = "Install App";
        var host = document.querySelector("main") || document.body;
        host.appendChild(button);
    }
    return button;
}

window.addEventListener("online", showOfflineBanner);
window.addEventListener("offline", showOfflineBanner);
document.addEventListener("DOMContentLoaded", showOfflineBanner);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(function () {
        console.log("Service worker registered.");
    }).catch(function (error) {
        console.log("Service worker registration failed.", error);
    });
}

var deferredPrompt = null;

window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (isStandalone()) {
        return;
    }
    getInstallButton().style.display = "inline-block";
});

document.addEventListener("click", function (event) {
    if (!event.target || event.target.id !== "install-button") {
        return;
    }
    if (!deferredPrompt) {
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        var button = document.getElementById("install-button");
        if (button) {
            button.style.display = "none";
        }
    });
});

window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    var button = document.getElementById("install-button");
    if (button) {
        button.style.display = "none";
    }
});
