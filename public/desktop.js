(function () {
    const DESKTOP_QUERY = window.matchMedia("(min-width: 651px)");

    function applyDesktopFlag() {
        if (DESKTOP_QUERY.matches) {
            document.documentElement.classList.add("desktop-ui");
            document.documentElement.classList.remove("mobile-ui");
        }
    }

    applyDesktopFlag();
    if (typeof DESKTOP_QUERY.addEventListener === "function") {
        DESKTOP_QUERY.addEventListener("change", applyDesktopFlag);
    }
})();
