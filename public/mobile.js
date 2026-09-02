(function () {
    const MOBILE_QUERY = window.matchMedia("(max-width: 650px)");
    const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

    function setMobileFlag() {
        if (MOBILE_QUERY.matches) {
            document.documentElement.classList.add("mobile-ui");
            document.documentElement.classList.remove("desktop-ui");
        }
    }

    setMobileFlag();
    if (typeof MOBILE_QUERY.addEventListener === "function") {
        MOBILE_QUERY.addEventListener("change", setMobileFlag);
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!MOBILE_QUERY.matches) return;

        const main = document.querySelector(".main");
        const menu = document.getElementById("main-menu");
        if (!main || !menu) return;

        const BLOCK_SELECTOR = [
            ".menu",
            ".admin-tabs",
            ".filter-group",
            ".org-scroll",
            ".admin-table-wrap",
            ".roster-table-wrap",
            ".month-grid",
            ".shared-note-editor",
            "input",
            "textarea",
            "select",
            "button",
            "a",
            "[contenteditable='true']"
        ].join(",");

        let tracking = false;
        let horizontalLock = false;
        let startX = 0;
        let startY = 0;
        let lastX = 0;
        let lastTime = 0;
        let velocityX = 0;
        let currentDragX = 0;
        let settling = false;

        function appApi() {
            return window.PowerPlantApp || null;
        }

        function visibleButtons() {
            const app = appApi();
            if (app && typeof app.getVisibleNavigationButtons === "function") {
                return app.getVisibleNavigationButtons();
            }
            return Array.from(menu.querySelectorAll('.menu-item[data-page]')).filter(function (button) {
                return !button.hidden && button.offsetParent !== null;
            });
        }

        function currentPageName() {
            const app = appApi();
            if (app && typeof app.getCurrentPage === "function") return app.getCurrentPage();
            const active = menu.querySelector('.menu-item.active[data-page]');
            return active ? active.getAttribute("data-page") : "home";
        }

        function shouldBlock(target, x) {
            if (!target || !target.closest) return false;
            if (target.closest(BLOCK_SELECTOR)) return true;
            // 保留 iPhone / Android 浏览器屏幕边缘返回手势。
            if (x <= 18 || x >= window.innerWidth - 18) return true;
            return false;
        }

        function neighbour(direction) {
            const buttons = visibleButtons();
            if (!buttons.length) return null;
            const current = currentPageName();
            let index = buttons.findIndex(function (button) {
                return button.getAttribute("data-page") === current;
            });
            if (index < 0) index = 0;
            const nextIndex = direction < 0 ? index + 1 : index - 1;
            if (nextIndex < 0 || nextIndex >= buttons.length) return null;
            return buttons[nextIndex];
        }

        function setDrag(x) {
            currentDragX = x;
            const resistance = neighbour(x < 0 ? -1 : 1) ? 0.34 : 0.12;
            const translated = Math.max(-92, Math.min(92, x * resistance));
            const fade = Math.max(0.90, 1 - Math.abs(translated) / 850);
            main.style.transform = "translate3d(" + translated.toFixed(2) + "px,0,0)";
            main.style.opacity = String(fade);
        }

        function clearInline() {
            main.style.transform = "";
            main.style.opacity = "";
            main.classList.remove("mobile-swipe-dragging", "mobile-swipe-settling");
        }

        async function animateMain(keyframes, options) {
            if (REDUCE_MOTION.matches || typeof main.animate !== "function") return;
            try {
                const animation = main.animate(keyframes, options);
                await animation.finished;
            } catch (error) {}
        }

        async function settleBack() {
            main.classList.remove("mobile-swipe-dragging");
            main.classList.add("mobile-swipe-settling");
            const fromTransform = main.style.transform || "translate3d(0,0,0)";
            const fromOpacity = main.style.opacity || "1";
            await animateMain([
                { transform: fromTransform, opacity: fromOpacity },
                { transform: "translate3d(0,0,0)", opacity: 1 }
            ], {
                duration: 190,
                easing: "cubic-bezier(.22,1,.36,1)",
                fill: "none"
            });
            clearInline();
        }

        async function changePage(direction) {
            const nextButton = neighbour(direction);
            if (!nextButton) {
                await settleBack();
                return;
            }

            settling = true;
            main.classList.remove("mobile-swipe-dragging");
            main.classList.add("mobile-swipe-settling");

            const viewport = Math.max(320, window.innerWidth);
            const exitX = direction < 0 ? -Math.min(105, viewport * 0.24) : Math.min(105, viewport * 0.24);
            const fromTransform = main.style.transform || "translate3d(0,0,0)";
            const fromOpacity = main.style.opacity || "1";

            await animateMain([
                { transform: fromTransform, opacity: fromOpacity },
                { transform: "translate3d(" + exitX + "px,0,0)", opacity: 0.72 }
            ], {
                duration: 125,
                easing: "cubic-bezier(.4,0,.2,1)",
                fill: "none"
            });

            clearInline();

            const nextPage = nextButton.getAttribute("data-page");
            const app = appApi();
            if (nextPage && app && typeof app.openPage === "function") {
                await app.openPage(nextPage);
            } else if (nextButton) {
                nextButton.click();
                await new Promise(function (resolve) { requestAnimationFrame(resolve); });
            }

            const enterX = direction < 0 ? Math.min(74, viewport * 0.18) : -Math.min(74, viewport * 0.18);
            await animateMain([
                { transform: "translate3d(" + enterX + "px,0,0)", opacity: 0.58 },
                { transform: "translate3d(0,0,0)", opacity: 1 }
            ], {
                duration: 235,
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "none"
            });

            nextButton.classList.remove("tap-pop");
            void nextButton.offsetWidth;
            nextButton.classList.add("tap-pop");
            window.setTimeout(function () { nextButton.classList.remove("tap-pop"); }, 260);

            clearInline();
            settling = false;
        }

        main.addEventListener("touchstart", function (event) {
            if (!MOBILE_QUERY.matches || settling || event.touches.length !== 1) {
                tracking = false;
                return;
            }

            const touch = event.touches[0];
            if (shouldBlock(event.target, touch.clientX)) {
                tracking = false;
                return;
            }

            tracking = true;
            horizontalLock = false;
            startX = lastX = touch.clientX;
            startY = touch.clientY;
            lastTime = performance.now();
            velocityX = 0;
            currentDragX = 0;
            main.classList.add("mobile-swipe-dragging");
        }, { passive: true });

        main.addEventListener("touchmove", function (event) {
            if (!tracking || settling || event.touches.length !== 1) return;

            const touch = event.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (!horizontalLock) {
                if (absX < 8 && absY < 8) return;
                if (absY > absX * 0.95) {
                    tracking = false;
                    clearInline();
                    return;
                }
                if (absX > absY * 1.12) horizontalLock = true;
                else return;
            }

            event.preventDefault();

            const now = performance.now();
            const dt = Math.max(1, now - lastTime);
            const instant = (touch.clientX - lastX) / dt;
            velocityX = velocityX * 0.72 + instant * 0.28;
            lastX = touch.clientX;
            lastTime = now;
            setDrag(dx);
        }, { passive: false });

        main.addEventListener("touchend", function (event) {
            if (!tracking || settling) {
                tracking = false;
                horizontalLock = false;
                return;
            }

            tracking = false;
            if (!horizontalLock || !event.changedTouches.length) {
                horizontalLock = false;
                settleBack();
                return;
            }

            const touch = event.changedTouches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            horizontalLock = false;

            if (Math.abs(dx) <= Math.abs(dy) * 1.08) {
                settleBack();
                return;
            }

            // 既支持拖得够远，也支持快速轻扫（flick），手感更接近原生 App。
            const distancePassed = Math.abs(dx) >= 58;
            const velocityPassed = Math.abs(velocityX) >= 0.43 && Math.abs(dx) >= 24;
            if (!distancePassed && !velocityPassed) {
                settleBack();
                return;
            }

            changePage(dx < 0 ? -1 : 1);
        }, { passive: true });

        main.addEventListener("touchcancel", function () {
            tracking = false;
            horizontalLock = false;
            if (!settling) settleBack();
        }, { passive: true });
    });
})();
