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
            ".link-card",
            ".global-search-panel",
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
        let activeAnimation = null;
        let animationSerial = 0;

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

        function currentIndex(buttons) {
            const app = appApi();
            const current = app && typeof app.getCurrentPage === "function"
                ? app.getCurrentPage()
                : ((menu.querySelector('.menu-item.active[data-page]') || {}).dataset || {}).page || "home";
            let index = buttons.findIndex(function (button) {
                return button.getAttribute("data-page") === current;
            });
            return index < 0 ? 0 : index;
        }

        function targetButton(direction, requestedSteps) {
            const buttons = visibleButtons();
            if (!buttons.length) return null;
            const index = currentIndex(buttons);
            const delta = direction < 0 ? 1 : -1;
            const wanted = index + delta * Math.max(1, requestedSteps || 1);
            const clamped = Math.max(0, Math.min(buttons.length - 1, wanted));
            if (clamped === index) return null;
            return buttons[clamped];
        }

        function shouldBlock(target, x) {
            if (!target || !target.closest) return false;
            if (target.closest(BLOCK_SELECTOR)) return true;
            // 保留 iPhone / Android 浏览器屏幕边缘返回手势。
            if (x <= 18 || x >= window.innerWidth - 18) return true;
            return false;
        }

        function clearInline() {
            main.style.transform = "";
            main.style.opacity = "";
            main.classList.remove("mobile-swipe-dragging", "mobile-swipe-settling");
        }

        function cancelRunningAnimation() {
            animationSerial += 1;
            if (activeAnimation) {
                try { activeAnimation.cancel(); } catch (error) {}
                activeAnimation = null;
            }
            clearInline();
        }

        function animateMain(keyframes, options, serial) {
            if (REDUCE_MOTION.matches || typeof main.animate !== "function") {
                return Promise.resolve(serial === animationSerial);
            }
            return new Promise(function (resolve) {
                try {
                    const animation = main.animate(keyframes, options);
                    activeAnimation = animation;
                    const finish = function () {
                        if (activeAnimation === animation) activeAnimation = null;
                        resolve(serial === animationSerial);
                    };
                    animation.addEventListener("finish", finish, { once: true });
                    animation.addEventListener("cancel", finish, { once: true });
                } catch (error) {
                    resolve(serial === animationSerial);
                }
            });
        }

        function setDrag(dx) {
            const direction = dx < 0 ? -1 : 1;
            const canMove = !!targetButton(direction, 1);
            const resistance = canMove ? 0.48 : 0.13;
            const limit = Math.min(150, Math.max(92, window.innerWidth * 0.38));
            const translated = Math.max(-limit, Math.min(limit, dx * resistance));
            const fade = Math.max(0.965, 1 - Math.abs(translated) / 4200);
            main.style.transform = "translate3d(" + translated.toFixed(2) + "px,0,0)";
            main.style.opacity = String(fade);
        }

        async function settleBack() {
            const serial = ++animationSerial;
            main.classList.remove("mobile-swipe-dragging");
            main.classList.add("mobile-swipe-settling");
            const fromTransform = main.style.transform || "translate3d(0,0,0)";
            const fromOpacity = main.style.opacity || "1";
            const currentAnimation = activeAnimation;
            if (currentAnimation) {
                try { currentAnimation.cancel(); } catch (error) {}
                activeAnimation = null;
            }
            await animateMain([
                { transform: fromTransform, opacity: fromOpacity },
                { transform: "translate3d(0,0,0)", opacity: 1 }
            ], {
                duration: 145,
                easing: "cubic-bezier(.2,.82,.25,1)",
                fill: "none"
            }, serial);
            if (serial === animationSerial) clearInline();
        }

        function momentumSteps(dx, vx) {
            const width = Math.max(320, window.innerWidth);
            const distance = Math.abs(dx);
            const speed = Math.abs(vx);
            // 普通滑动 1 页；快速甩动允许跨 2~3 页，连续操作不需要等待上一页动画结束。
            if (speed >= 1.85 || distance >= width * 0.82) return 3;
            if (speed >= 1.05 || distance >= width * 0.52) return 2;
            return 1;
        }

        function switchTo(button) {
            if (!button) return;
            const page = button.getAttribute("data-page");
            const app = appApi();
            if (page && app && typeof app.openPage === "function") {
                // 不 await 数据加载：页面先切换，网络内容继续加载，避免阻塞下一次滑动。
                app.openPage(page);
            } else {
                button.click();
            }
            button.classList.remove("tap-pop");
            void button.offsetWidth;
            button.classList.add("tap-pop");
            window.setTimeout(function () { button.classList.remove("tap-pop"); }, 220);
        }

        async function changePage(direction, steps, releaseVelocity) {
            const nextButton = targetButton(direction, steps);
            if (!nextButton) {
                settleBack();
                return;
            }

            const serial = ++animationSerial;
            if (activeAnimation) {
                try { activeAnimation.cancel(); } catch (error) {}
                activeAnimation = null;
            }

            main.classList.remove("mobile-swipe-dragging");
            main.classList.add("mobile-swipe-settling");

            const viewport = Math.max(320, window.innerWidth);
            const speed = Math.abs(releaseVelocity || 0);
            const exitX = direction < 0 ? -Math.min(128, viewport * 0.32) : Math.min(128, viewport * 0.32);
            const fromTransform = main.style.transform || "translate3d(0,0,0)";
            const fromOpacity = main.style.opacity || "1";
            const exitDuration = speed > 1.15 ? 68 : 92;

            const completed = await animateMain([
                { transform: fromTransform, opacity: fromOpacity },
                { transform: "translate3d(" + exitX + "px,0,0)", opacity: 0.985 }
            ], {
                duration: exitDuration,
                easing: "cubic-bezier(.32,.02,.32,1)",
                fill: "none"
            }, serial);

            if (!completed || serial !== animationSerial) return;

            clearInline();
            switchTo(nextButton);

            // 只等一帧让新页面渲染；不等待 openPage() 内部的网络请求。
            await new Promise(function (resolve) { requestAnimationFrame(resolve); });
            if (serial !== animationSerial) return;

            const enterX = direction < 0 ? Math.min(54, viewport * 0.14) : -Math.min(54, viewport * 0.14);
            await animateMain([
                { transform: "translate3d(" + enterX + "px,0,0)", opacity: 0.985 },
                { transform: "translate3d(0,0,0)", opacity: 1 }
            ], {
                duration: speed > 1.15 ? 118 : 148,
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "none"
            }, serial);

            if (serial === animationSerial) clearInline();
        }

        main.addEventListener("touchstart", function (event) {
            if (!MOBILE_QUERY.matches || event.touches.length !== 1) {
                tracking = false;
                return;
            }

            const touch = event.touches[0];
            if (shouldBlock(event.target, touch.clientX)) {
                tracking = false;
                return;
            }

            // 关键：新的一次滑动可以立即打断上一页的回弹/入场动画，支持连续快速滑动。
            cancelRunningAnimation();
            tracking = true;
            horizontalLock = false;
            startX = lastX = touch.clientX;
            startY = touch.clientY;
            lastTime = performance.now();
            velocityX = 0;
            main.classList.add("mobile-swipe-dragging");
        }, { passive: true });

        main.addEventListener("touchmove", function (event) {
            if (!tracking || event.touches.length !== 1) return;

            const touch = event.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (!horizontalLock) {
                if (absX < 7 && absY < 7) return;
                if (absY > absX * 0.98) {
                    tracking = false;
                    clearInline();
                    return;
                }
                if (absX > absY * 1.08) horizontalLock = true;
                else return;
            }

            event.preventDefault();

            const now = performance.now();
            const dt = Math.max(1, now - lastTime);
            const instant = (touch.clientX - lastX) / dt;
            // 提高即时速度权重，快速甩动的响应会更自然。
            velocityX = velocityX * 0.58 + instant * 0.42;
            lastX = touch.clientX;
            lastTime = now;
            setDrag(dx);
        }, { passive: false });

        main.addEventListener("touchend", function (event) {
            if (!tracking) return;
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

            if (Math.abs(dx) <= Math.abs(dy) * 1.04) {
                settleBack();
                return;
            }

            const distancePassed = Math.abs(dx) >= 44;
            const velocityPassed = Math.abs(velocityX) >= 0.34 && Math.abs(dx) >= 18;
            if (!distancePassed && !velocityPassed) {
                settleBack();
                return;
            }

            const direction = dx < 0 ? -1 : 1;
            const steps = momentumSteps(dx, velocityX);
            changePage(direction, steps, velocityX);
        }, { passive: true });

        main.addEventListener("touchcancel", function () {
            tracking = false;
            horizontalLock = false;
            settleBack();
        }, { passive: true });
    });
})();
