// ========================================
// 网站登录：30 分钟无操作自动退出；关闭标签页后重新打开需要再次输入密码
// ========================================
(function () {
    const SITE_TAB_KEY = "powerPlantSiteTabSession";
    const SITE_ACTIVITY_KEY = "powerPlantSiteLastActivity";
    const IDLE_MS = 30 * 60 * 1000;
    const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

    let lastServerTouch = 0;
    let redirecting = false;

    function clearSessionState() {
        try {
            sessionStorage.removeItem(SITE_TAB_KEY);
            sessionStorage.removeItem(SITE_ACTIVITY_KEY);
        } catch (error) {}
    }

    function forceLogin() {
        if (redirecting) return;
        redirecting = true;
        clearSessionState();
        const next = window.location.pathname + window.location.search;
        window.location.replace("/logout?next=" + encodeURIComponent(next));
    }

    function readLastActivity() {
        try {
            const value = Number(sessionStorage.getItem(SITE_ACTIVITY_KEY));
            return Number.isFinite(value) && value > 0 ? value : 0;
        } catch (error) {
            return 0;
        }
    }

    function hasCurrentTabSession() {
        try {
            return sessionStorage.getItem(SITE_TAB_KEY) === "1";
        } catch (error) {
            return false;
        }
    }

    function isExpired(now) {
        const lastActivity = readLastActivity();
        return !lastActivity || now - lastActivity >= IDLE_MS;
    }

    async function touchServerSession(now) {
        if (now - lastServerTouch < TOUCH_INTERVAL_MS) return;
        lastServerTouch = now;

        try {
            const response = await fetch("/api/site/session/touch", {
                method: "POST",
                cache: "no-store",
                credentials: "same-origin"
            });

            if (response.status === 401 || response.status === 503) {
                forceLogin();
            }
        } catch (error) {
            // 网络暂时中断时不立即退出；下一次请求仍会由 Worker 检查会话。
        }
    }

    function recordActivity() {
        if (redirecting) return;
        const now = Date.now();

        if (isExpired(now)) {
            forceLogin();
            return;
        }

        try {
            sessionStorage.setItem(SITE_ACTIVITY_KEY, String(now));
        } catch (error) {}

        touchServerSession(now);
    }

    if (!hasCurrentTabSession() || isExpired(Date.now())) {
        forceLogin();
        return;
    }

    ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (eventName) {
        window.addEventListener(eventName, recordActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible" && isExpired(Date.now())) {
            forceLogin();
        }
    });

    window.setInterval(function () {
        if (isExpired(Date.now())) {
            forceLogin();
        }
    }, 30 * 1000);
})();

document.addEventListener("DOMContentLoaded", function () {

    const mainMenu = document.getElementById("main-menu");
    const dashboardGrid = document.getElementById("dashboard-grid");
    const dynamicModulePages = document.getElementById("dynamic-module-pages");
    const searchInput = document.getElementById("search");
    const searchBox = document.querySelector(".search-box");
    const globalSearchTrigger = document.getElementById("global-search-trigger");
    const globalSearchModal = document.getElementById("global-search-modal");
    const globalSearchInput = document.getElementById("global-search-input");
    const globalSearchResults = document.getElementById("global-search-results");
    const favoritesSection = document.getElementById("favorites-section");
    const favoritesGrid = document.getElementById("favorites-grid");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");

    const rosterViewTabs = document.querySelectorAll("[data-roster-view]");
    const rosterListView = document.getElementById("roster-list-view");
    const rosterOrgView = document.getElementById("roster-org-view");
    const rosterViewSubtitle = document.getElementById("roster-view-subtitle");

    const categoryButtons = document.querySelectorAll("[data-category-filter]");
    const statusButtons = document.querySelectorAll("[data-status-filter]");

    let currentCategory = "全部";
    let currentStatus = "全部";
    let currentRosterView = "list";
    let currentPage = "home";
    let rosterData = [];
    let rosterLoaded = false;
    let monthPlanLinks = {};
    let monthPlansLoaded = false;
    let portalModules = [];
    let portalButtons = {};
    let portalLoaded = false;
    let favoriteKeys = new Set();
    let favoritesLoaded = false;

    let currentUser = null;
    let systemSettings = {};

    async function loadCurrentUser() {
        try {
            const response = await fetch("/api/me", { cache: "no-store", headers: { "Accept": "application/json" } });
            if (!response.ok) throw new Error("login required");
            const data = await response.json();
            currentUser = data && data.user ? data.user : null;
            const display = document.getElementById("current-user-display");
            if (display && currentUser) display.textContent = currentUser.displayName || currentUser.username || "用户";
            return currentUser;
        } catch (error) {
            window.location.replace("/logout?next=" + encodeURIComponent(window.location.pathname + window.location.search));
            return null;
        }
    }

    // ========================================
    // 当前用户：自行修改密码
    // ========================================
    const changePasswordButton = document.getElementById("change-password-button");
    const changePasswordModal = document.getElementById("change-password-modal");
    const changePasswordForm = document.getElementById("change-password-form");
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmNewPasswordInput = document.getElementById("confirm-new-password");
    const changePasswordMessage = document.getElementById("change-password-message");

    function closeChangePasswordModal() {
        if (!changePasswordModal) return;
        changePasswordModal.classList.remove("open");
        changePasswordModal.setAttribute("aria-hidden", "true");
        if (changePasswordForm) changePasswordForm.reset();
        setFormMessage(changePasswordMessage, "", "");
    }

    if (changePasswordButton) {
        changePasswordButton.addEventListener("click", function () {
            if (!currentUser) return;
            if (currentUser.username === "admin") {
                alert("内置 admin 的密码由 Cloudflare ADMIN_PASSWORD 管理，不能在网站里修改。其他创建出来的账号（包括管理员账号）都可以自行修改密码。");
                return;
            }
            if (!changePasswordModal) return;
            if (changePasswordForm) changePasswordForm.reset();
            setFormMessage(changePasswordMessage, "", "");
            changePasswordModal.classList.add("open");
            changePasswordModal.setAttribute("aria-hidden", "false");
            window.setTimeout(function () { if (currentPasswordInput) currentPasswordInput.focus(); }, 60);
        });
    }

    document.querySelectorAll("[data-password-modal-close]").forEach(function (button) {
        button.addEventListener("click", closeChangePasswordModal);
    });

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const currentPassword = currentPasswordInput ? currentPasswordInput.value : "";
            const newPassword = newPasswordInput ? newPasswordInput.value : "";
            const confirmPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : "";
            if (newPassword !== confirmPassword) {
                setFormMessage(changePasswordMessage, "两次输入的新密码不一致。", "error");
                return;
            }
            if (newPassword.length < 8) {
                setFormMessage(changePasswordMessage, "新密码至少需要 8 个字符。", "error");
                return;
            }
            setFormMessage(changePasswordMessage, "正在修改密码...", "info");
            try {
                const response = await fetch("/api/account/password", {
                    method: "POST",
                    cache: "no-store",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
                });
                const data = await readJsonResponse(response, "密码修改服务暂时异常，请稍后再试。");
                if (!response.ok) throw new Error(data.error || "密码修改失败。");
                setFormMessage(changePasswordMessage, "密码修改成功，正在退出，请使用新密码重新登录。", "success");
                window.setTimeout(function () { window.location.href = "/logout"; }, 900);
            } catch (error) {
                setFormMessage(changePasswordMessage, error.message || "密码修改失败。", "error");
            }
        });
    }

    function applySystemSettings(settings) {
        systemSettings = settings && typeof settings === "object" ? settings : systemSettings;
        const value = function (key, fallback) { return String(systemSettings[key] || fallback || ""); };
        const brandName = document.getElementById("brand-site-name");
        const brandSubtitle = document.getElementById("brand-site-subtitle");
        const homeTitle = document.getElementById("dashboard-home-title");
        const homeDescription = document.getElementById("dashboard-home-description");
        const homeBadge = document.getElementById("dashboard-home-badge");
        const footer = document.getElementById("site-footer");
        if (brandName) brandName.textContent = value("siteName", "沙巴光伏自备电厂");
        if (brandSubtitle) brandSubtitle.textContent = value("siteSubtitle", "内部业务系统");
        if (homeTitle) homeTitle.textContent = value("homeTitle", "沙巴光伏自备电厂");
        if (homeDescription) homeDescription.textContent = value("homeDescription", "请选择需要进入的业务模块");
        if (homeBadge) homeBadge.textContent = value("homeBadge", "部门业务总览");
        if (footer) footer.textContent = value("footerText", "© 2026 沙巴光伏自备电厂");
        document.title = value("siteName", "沙巴光伏自备电厂") + "内部业务系统";
        if (currentPage === "home") {
            if (pageTitle) pageTitle.textContent = value("portalTitle", "沙巴光伏自备电厂导航");
            if (pageSubtitle) pageSubtitle.textContent = value("portalSubtitle", "部门业务总览");
        }
    }

    function getPortalModule(moduleId) {
        return portalModules.find(function (item) {
            return item.id === moduleId;
        }) || null;
    }

    async function loadPortalConfig(force) {
        if (portalLoaded && !force) {
            return { modules: portalModules, moduleButtons: portalButtons };
        }

        try {
            const response = await fetch("/api/portal-config", {
                cache: "no-store",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) {
                throw new Error("无法读取主页模块");
            }

            const data = await response.json();
            portalModules = Array.isArray(data.modules) ? data.modules : [];
            portalButtons = data.moduleButtons && typeof data.moduleButtons === "object"
                ? data.moduleButtons
                : {};
            if (data.settings && typeof data.settings === "object") {
                systemSettings = data.settings;
                applySystemSettings(systemSettings);
            }
            portalLoaded = true;
            return data;
        } catch (error) {
            portalModules = [];
            portalButtons = {};
            portalLoaded = true;
            return { modules: [], moduleButtons: {} };
        }
    }

    function moduleMark(name) {
        const text = String(name || "").trim();
        if (!text) return "项";
        return Array.from(text)[0] || "项";
    }

    function favoriteKey(moduleId, buttonId) {
        return String(moduleId || "") + "::" + String(buttonId || "");
    }

    function isFavorite(moduleId, buttonId) {
        return favoriteKeys.has(favoriteKey(moduleId, buttonId));
    }

    async function loadFavorites(force) {
        if (favoritesLoaded && !force) return favoriteKeys;
        try {
            const response = await fetch("/api/favorites", { cache: "no-store", headers: { "Accept": "application/json" } });
            if (!response.ok) throw new Error("无法读取收藏夹");
            const data = await response.json();
            favoriteKeys = new Set(Array.isArray(data.favorites) ? data.favorites : []);
        } catch (error) {
            favoriteKeys = new Set();
        }
        favoritesLoaded = true;
        return favoriteKeys;
    }

    async function saveFavorites(nextSet) {
        const next = Array.from(nextSet).slice(0, 100);
        const response = await fetch("/api/favorites", {
            method: "PUT",
            cache: "no-store",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ favorites: next })
        });
        const data = await readJsonResponse(response, "收藏保存失败，请稍后再试。");
        if (!response.ok) throw new Error(data.error || "收藏保存失败");
        favoriteKeys = new Set(Array.isArray(data.favorites) ? data.favorites : next);
        favoritesLoaded = true;
        syncFavoriteStars();
        renderFavoritesHome();
    }

    async function toggleFavorite(moduleId, buttonId) {
        const key = favoriteKey(moduleId, buttonId);
        const next = new Set(favoriteKeys);
        if (next.has(key)) next.delete(key); else next.add(key);
        try {
            await saveFavorites(next);
        } catch (error) {
            alert(error.message || "收藏保存失败");
        }
    }

    function syncFavoriteStars() {
        document.querySelectorAll("[data-favorite-key]").forEach(function (button) {
            const active = favoriteKeys.has(button.getAttribute("data-favorite-key"));
            button.classList.toggle("is-favorite", active);
            button.textContent = active ? "★" : "☆";
            button.setAttribute("aria-label", active ? "取消收藏" : "加入收藏");
            button.title = active ? "取消收藏" : "加入收藏";
        });
    }

    function openPortalItem(item) {
        if (item.type === "month-plan") {
            openMonthPlanModal(item.name || "月计划");
            return;
        }
        const url = String(item.url || "").trim();
        if (!/^https:\/\//i.test(url)) {
            alert("这个按钮还没有设置网址，请联系管理员。 ");
            return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
    }

    function createPortalLinkButton(item, moduleId) {
        const card = document.createElement("div");
        card.className = "link-card searchable favorite-capable-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const content = document.createElement("div");
        content.className = "card-content";

        const title = document.createElement("h3");
        title.textContent = item.name || "未命名按钮";

        const description = document.createElement("p");
        description.textContent = item.description || (item.type === "month-plan" ? "选择年份和月份" : "打开链接");

        const arrow = document.createElement("div");
        arrow.className = "card-arrow";
        arrow.textContent = "→";

        const favorite = document.createElement("button");
        favorite.type = "button";
        favorite.className = "favorite-toggle";
        favorite.setAttribute("data-favorite-key", favoriteKey(moduleId, item.id));
        favorite.textContent = isFavorite(moduleId, item.id) ? "★" : "☆";
        favorite.classList.toggle("is-favorite", isFavorite(moduleId, item.id));
        favorite.setAttribute("aria-label", isFavorite(moduleId, item.id) ? "取消收藏" : "加入收藏");
        favorite.title = favorite.getAttribute("aria-label");
        favorite.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(moduleId, item.id);
        });

        content.appendChild(title);
        content.appendChild(description);
        card.appendChild(content);
        card.appendChild(arrow);
        card.appendChild(favorite);

        card.addEventListener("click", function (event) {
            if (event.target.closest(".favorite-toggle")) return;
            openPortalItem(item);
        });
        card.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPortalItem(item);
            }
        });

        return card;
    }

    function renderFavoritesHome() {
        if (!favoritesSection || !favoritesGrid) return;
        favoritesGrid.innerHTML = "";
        const found = [];
        portalModules.forEach(function (module) {
            if (!module || module.visible === false) return;
            const buttons = Array.isArray(portalButtons[module.id]) ? portalButtons[module.id] : [];
            buttons.forEach(function (item) {
                if (!item || item.visible === false) return;
                if (favoriteKeys.has(favoriteKey(module.id, item.id))) found.push({ module: module, item: item });
            });
        });
        favoritesSection.hidden = found.length === 0;
        found.forEach(function (entry) {
            const wrap = document.createElement("div");
            wrap.className = "favorite-entry";
            const moduleName = document.createElement("span");
            moduleName.className = "favorite-module-name";
            moduleName.textContent = entry.module.name;
            wrap.appendChild(moduleName);
            wrap.appendChild(createPortalLinkButton(entry.item, entry.module.id));
            favoritesGrid.appendChild(wrap);
        });
    }

    function renderModuleButtons(moduleId, container, emptyElement) {
        if (!container) return;
        const buttons = Array.isArray(portalButtons[moduleId]) ? portalButtons[moduleId] : [];
        const visibleButtons = buttons.filter(function (item) {
            return item && item.visible !== false;
        });

        container.innerHTML = "";
        visibleButtons.forEach(function (item) {
            container.appendChild(createPortalLinkButton(item, moduleId));
        });

        if (emptyElement) {
            emptyElement.hidden = visibleButtons.length !== 0;
        }
    }

    function renderSpecialModuleLinks(module) {
        if (!module) return;
        const buttons = Array.isArray(portalButtons[module.id]) ? portalButtons[module.id] : [];
        const hasVisible = buttons.some(function (item) { return item && item.visible !== false; });

        if (module.kind === "roster") {
            const area = document.getElementById("roster-module-links-area");
            const container = document.getElementById("roster-module-links");
            if (area) area.hidden = !hasVisible;
            renderModuleButtons(module.id, container, null);
        }

        if (module.kind === "notice") {
            const area = document.getElementById("notice-module-links-area");
            const container = document.getElementById("notice-module-links");
            if (area) area.hidden = !hasVisible;
            renderModuleButtons(module.id, container, null);
        }
    }

    function buildGenericModulePage(module) {
        const section = document.createElement("section");
        section.className = "page-section dynamic-module-page";
        section.id = module.id + "-page";
        section.setAttribute("data-module-id", module.id);

        const heading = document.createElement("div");
        heading.className = "section-heading";
        const h2 = document.createElement("h2");
        h2.textContent = module.name;
        const p = document.createElement("p");
        p.textContent = module.description || "业务快捷入口";
        heading.appendChild(h2);
        heading.appendChild(p);

        const grid = document.createElement("div");
        grid.className = "link-grid";
        grid.id = "module-links-" + module.id;

        const empty = document.createElement("div");
        empty.className = "meeting-empty";
        empty.id = "module-empty-" + module.id;
        empty.textContent = "目前还没有添加内部按钮。";

        section.appendChild(heading);
        section.appendChild(grid);
        section.appendChild(empty);
        renderModuleButtons(module.id, grid, empty);
        return section;
    }

    function renderPortalShell() {
        if (mainMenu) {
            mainMenu.querySelectorAll('.menu-item[data-dynamic-module="1"]').forEach(function (item) {
                item.remove();
            });

            const adminButton = mainMenu.querySelector('.menu-item[data-page="admin"]');
            if (adminButton) adminButton.hidden = !(currentUser && currentUser.role === "admin");
            portalModules.filter(function (module) { return module.visible !== false; }).forEach(function (module) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "menu-item";
                button.setAttribute("data-page", module.id);
                button.setAttribute("data-dynamic-module", "1");
                button.textContent = module.name;
                if (adminButton) mainMenu.insertBefore(button, adminButton);
                else mainMenu.appendChild(button);
            });
        }

        if (dashboardGrid) {
            dashboardGrid.innerHTML = "";
            portalModules.filter(function (module) { return module.visible !== false; }).forEach(function (module) {
                const card = document.createElement("button");
                card.type = "button";
                card.className = "dashboard-card";
                card.setAttribute("data-dashboard-page", module.id);

                const mark = document.createElement("div");
                mark.className = "dashboard-card-mark";
                mark.textContent = moduleMark(module.name);

                const copy = document.createElement("div");
                copy.className = "dashboard-card-copy";
                const h3 = document.createElement("h3");
                h3.textContent = module.name;
                const p = document.createElement("p");
                p.textContent = module.description || "点击进入模块";
                copy.appendChild(h3);
                copy.appendChild(p);

                const arrow = document.createElement("span");
                arrow.className = "dashboard-card-arrow";
                arrow.textContent = "→";

                card.appendChild(mark);
                card.appendChild(copy);
                card.appendChild(arrow);
                dashboardGrid.appendChild(card);
            });
        }

        if (dynamicModulePages) {
            dynamicModulePages.innerHTML = "";
            portalModules.forEach(function (module) {
                if (module.kind === "generic") {
                    dynamicModulePages.appendChild(buildGenericModulePage(module));
                } else {
                    renderSpecialModuleLinks(module);
                }
            });
        }

        const rosterModule = portalModules.find(function (module) { return module.kind === "roster"; });
        const noticeModule = portalModules.find(function (module) { return module.kind === "notice"; });
        const rosterHeading = document.getElementById("roster-page-heading");
        const noticeHeading = document.getElementById("notice-page-heading");
        if (rosterHeading && rosterModule) rosterHeading.textContent = rosterModule.name;
        if (noticeHeading && noticeModule) noticeHeading.textContent = noticeModule.name;
        if (favoritesLoaded) {
            syncFavoriteStars();
            renderFavoritesHome();
        }

        if (currentPage !== "home" && currentPage !== "admin") {
            const currentModule = getPortalModule(currentPage);
            if (!currentModule || currentModule.visible === false) {
                currentPage = "home";
            }
        }
    }

    async function openPage(pageName) {
        if (pageName === "admin" && (!currentUser || currentUser.role !== "admin")) {
            pageName = "home";
        }
        if (!portalLoaded) {
            await loadPortalConfig();
            renderPortalShell();
        }

        let targetPage = document.getElementById(pageName + "-page");
        const module = getPortalModule(pageName);
        if (module && module.kind === "roster") targetPage = document.getElementById("roster-page");
        if (module && module.kind === "notice") targetPage = document.getElementById("notice-page");
        if (!targetPage) return;

        document.querySelectorAll(".page-section").forEach(function (page) {
            page.classList.remove("active-page");
        });
        targetPage.classList.add("active-page");

        document.querySelectorAll(".menu-item[data-page]").forEach(function (item) {
            item.classList.remove("active");
        });

        const currentMenu = document.querySelector('.menu-item[data-page="' + pageName + '"]');
        if (currentMenu) {
            currentMenu.classList.add("active");
            if (typeof currentMenu.scrollIntoView === "function") {
                currentMenu.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        }

        currentPage = pageName;
        let title = String(systemSettings.portalTitle || "沙巴光伏自备电厂导航");
        let subtitle = String(systemSettings.portalSubtitle || "部门业务总览");
        let placeholder = "";

        if (pageName === "admin") {
            title = "管理后台";
            subtitle = "主页模块、内部按钮及资料管理";
        } else if (module) {
            title = module.name;
            subtitle = module.description || "业务快捷入口";
            if (module.kind === "roster") placeholder = "搜索工号、姓名、岗位、职衔...";
            else if (module.kind === "notice") placeholder = "";
            else placeholder = "搜索" + module.name + "功能...";
        }

        pageTitle.textContent = title;
        pageSubtitle.textContent = subtitle;
        searchInput.placeholder = placeholder;
        if (searchBox) {
            searchBox.style.display = pageName === "home" || pageName === "admin" || (module && module.kind === "notice")
                ? "none" : "flex";
        }

        searchInput.value = "";
        resetSearch();

        if (module && module.kind === "generic") {
            renderModuleButtons(module.id, document.getElementById("module-links-" + module.id), document.getElementById("module-empty-" + module.id));
        }

        if (module && module.kind === "roster") {
            switchRosterView("list");
            await loadRoster();
            applyRosterFilters();
            renderSpecialModuleLinks(module);
        }

        if (module && module.kind === "notice") {
            renderSpecialModuleLinks(module);
            loadSharedNote();
        }

        if (pageName === "admin") {
            initializeAdminPage();
        }

        window.scrollTo(0, 0);
    }

    // 供 desktop.js / mobile.js 使用的公共页面 API。
    // 业务逻辑仍统一维护，设备专属交互分别放在独立文件中。
    window.PowerPlantApp = {
        openPage: openPage,
        getCurrentPage: function () { return currentPage; },
        getVisibleNavigationButtons: function () {
            if (!mainMenu) return [];
            return Array.from(mainMenu.querySelectorAll('.menu-item[data-page]')).filter(function (button) {
                return !button.hidden && button.offsetParent !== null;
            });
        }
    };

    if (mainMenu) {
        mainMenu.addEventListener("click", function (event) {
            const button = event.target.closest('.menu-item[data-page]');
            if (!button || !mainMenu.contains(button)) return;

            button.classList.remove("tap-pop");
            void button.offsetWidth;
            button.classList.add("tap-pop");
            window.setTimeout(function () { button.classList.remove("tap-pop"); }, 260);
            openPage(button.getAttribute("data-page"));
        });
    }

    if (dashboardGrid) {
        dashboardGrid.addEventListener("click", function (event) {
            const card = event.target.closest("[data-dashboard-page]");
            if (!card || !dashboardGrid.contains(card)) return;
            openPage(card.getAttribute("data-dashboard-page"));
        });
    }

    rosterViewTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            switchRosterView(this.getAttribute("data-roster-view"));
        });
    });

    searchInput.addEventListener("input", function () {
        const activePage = document.querySelector(".page-section.active-page");
        if (!activePage) return;

        const module = getPortalModule(currentPage);
        if (module && module.kind === "roster" && currentRosterView === "list") {
            applyRosterFilters();
            return;
        }

        if (module && module.kind === "roster" && currentRosterView === "org") {
            const keyword = this.value.trim().toLowerCase();
            const searchableItems = rosterOrgView ? rosterOrgView.querySelectorAll(".searchable") : [];
            searchableItems.forEach(function (item) {
                const text = item.textContent.toLowerCase();
                item.classList.toggle("search-hidden", !text.includes(keyword));
            });
            return;
        }

        const keyword = this.value.trim().toLowerCase();
        activePage.querySelectorAll(".searchable").forEach(function (item) {
            item.classList.toggle("search-hidden", !item.textContent.toLowerCase().includes(keyword));
        });
    });

    function resetSearch() {
        document.querySelectorAll(".search-hidden").forEach(function (item) {
            item.classList.remove("search-hidden");
        });
    }

    function switchRosterView(viewName) {
        currentRosterView = viewName === "org" ? "org" : "list";

        rosterViewTabs.forEach(function (tab) {
            tab.classList.toggle("active", tab.getAttribute("data-roster-view") === currentRosterView);
        });

        if (rosterListView) rosterListView.classList.toggle("active", currentRosterView === "list");
        if (rosterOrgView) rosterOrgView.classList.toggle("active", currentRosterView === "org");

        if (rosterViewSubtitle) {
            rosterViewSubtitle.textContent = currentRosterView === "org"
                ? "部门组织结构图，可左右滑动查看完整内容"
                : "查看部门人员花名册或组织结构图";
        }

        if (searchInput) {
            searchInput.value = "";
            searchInput.placeholder = currentRosterView === "org"
                ? "搜索姓名或岗位..."
                : "搜索工号、姓名、岗位、职衔...";
        }
        resetSearch();
        if (currentRosterView === "list") applyRosterFilters();
    }

    // ========================================
    // 全站搜索：模块、内部按钮、花名册人员
    // ========================================
    function closeGlobalSearch() {
        if (!globalSearchModal) return;
        globalSearchModal.classList.remove("open");
        globalSearchModal.setAttribute("aria-hidden", "true");
    }

    async function openGlobalSearch() {
        if (!globalSearchModal) return;
        globalSearchModal.classList.add("open");
        globalSearchModal.setAttribute("aria-hidden", "false");
        if (!portalLoaded) await loadPortalConfig();
        if (!rosterLoaded) await loadRoster();
        renderGlobalSearchResults(globalSearchInput ? globalSearchInput.value : "");
        window.setTimeout(function () { if (globalSearchInput) globalSearchInput.focus(); }, 40);
    }

    function portalSearchItems() {
        const items = [];
        portalModules.forEach(function (module) {
            if (!module || module.visible === false) return;
            items.push({ type: "module", module: module, title: module.name, subtitle: module.description || "主页模块", text: [module.name, module.description].join(" ") });
            const buttons = Array.isArray(portalButtons[module.id]) ? portalButtons[module.id] : [];
            buttons.forEach(function (button) {
                if (!button || button.visible === false) return;
                items.push({ type: "button", module: module, button: button, title: button.name || "未命名按钮", subtitle: module.name + " · " + (button.description || (button.type === "month-plan" ? "年月选择" : "Lark 链接")), text: [module.name, module.description, button.name, button.description, button.url].join(" ") });
            });
        });
        const rosterModule = portalModules.find(function (module) { return module.kind === "roster" && module.visible !== false; });
        if (rosterModule) {
            rosterData.forEach(function (person) {
                items.push({ type: "person", module: rosterModule, person: person, title: person.name || person.employeeId || "人员", subtitle: [person.employeeId, person.position, person.title].filter(Boolean).join(" · "), text: [person.employeeId, person.name, person.category, person.position, person.title, person.status].join(" ") });
            });
        }
        return items;
    }

    function renderGlobalSearchResults(rawQuery) {
        if (!globalSearchResults) return;
        const query = String(rawQuery || "").trim().toLowerCase();
        globalSearchResults.innerHTML = "";
        if (!query) {
            globalSearchResults.innerHTML = '<div class="global-search-empty">输入关键词开始搜索。</div>';
            return;
        }
        const results = portalSearchItems().filter(function (entry) {
            return String(entry.text || "").toLowerCase().includes(query);
        }).slice(0, 30);
        if (!results.length) {
            globalSearchResults.innerHTML = '<div class="global-search-empty">没有找到相关模块、按钮或人员。</div>';
            return;
        }
        results.forEach(function (entry) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "global-search-result";
            const type = document.createElement("span");
            type.className = "global-search-result-type";
            type.textContent = entry.type === "module" ? "模块" : entry.type === "button" ? "入口" : "人员";
            const copy = document.createElement("span");
            copy.className = "global-search-result-copy";
            const strong = document.createElement("strong");
            strong.textContent = entry.title;
            const small = document.createElement("small");
            small.textContent = entry.subtitle || "";
            copy.appendChild(strong); copy.appendChild(small);
            const arrow = document.createElement("span"); arrow.className = "global-search-result-arrow"; arrow.textContent = "→";
            button.appendChild(type); button.appendChild(copy); button.appendChild(arrow);
            button.addEventListener("click", async function () {
                closeGlobalSearch();
                if (entry.type === "module") {
                    await openPage(entry.module.id);
                } else if (entry.type === "button") {
                    openPortalItem(entry.button);
                } else if (entry.type === "person") {
                    await openPage(entry.module.id);
                    switchRosterView("list");
                    if (searchInput) searchInput.value = entry.person.employeeId || entry.person.name || "";
                    applyRosterFilters();
                }
            });
            globalSearchResults.appendChild(button);
        });
    }

    if (globalSearchTrigger) globalSearchTrigger.addEventListener("click", openGlobalSearch);
    document.querySelectorAll("[data-global-search-close]").forEach(function (button) { button.addEventListener("click", closeGlobalSearch); });
    if (globalSearchInput) globalSearchInput.addEventListener("input", function () { renderGlobalSearchResults(this.value); });
    document.addEventListener("keydown", function (event) {
        const tag = String(event.target && event.target.tagName || "").toLowerCase();
        const typing = tag === "input" || tag === "textarea" || tag === "select" || (event.target && event.target.isContentEditable);
        if (event.key === "/" && !typing) {
            event.preventDefault();
            openGlobalSearch();
        }
    });

    loadCurrentUser().then(function () {
        return Promise.all([loadPortalConfig(), loadFavorites()]);
    }).then(function () {
        renderPortalShell();
        applySystemSettings(systemSettings);
        syncFavoriteStars();
        renderFavoritesHome();
    });

    // ========================================
    // 花名册：云端读取 + 自动统计
    // ========================================

    const rosterBody = document.getElementById("roster-body");
    const visibleCount = document.getElementById("visible-count");
    const rosterTotalInline = document.getElementById("roster-total-inline");
    const rosterLoading = document.getElementById("roster-loading");
    const rosterEmpty = document.getElementById("roster-empty");

    const rosterCountEls = {
        total: document.getElementById("roster-total"),
        management: document.getElementById("roster-management"),
        operation: document.getElementById("roster-operation"),
        maintenance: document.getElementById("roster-maintenance"),
        official: document.getElementById("roster-official"),
        probation: document.getElementById("roster-probation"),
        left: document.getElementById("roster-left")
    };

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            currentCategory = this.getAttribute("data-category-filter");

            categoryButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            this.classList.add("active");
            applyRosterFilters();
        });
    });

    statusButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            currentStatus = this.getAttribute("data-status-filter");

            statusButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            this.classList.add("active");
            applyRosterFilters();
        });
    });

    async function loadRoster(force) {
        if (rosterLoaded && !force) return rosterData;

        if (rosterLoading) {
            rosterLoading.style.display = "block";
            rosterLoading.textContent = "正在读取花名册...";
        }

        try {
            const response = await fetch("/api/roster", {
                cache: "no-store",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("无法读取花名册");
            }

            const data = await response.json();
            rosterData = Array.isArray(data.roster) ? data.roster : [];
            rosterLoaded = true;

            updateRosterCounts();
            applyRosterFilters();

            if (rosterLoading) {
                rosterLoading.style.display = "none";
            }

            return rosterData;

        } catch (error) {
            if (rosterLoading) {
                rosterLoading.style.display = "block";
                rosterLoading.textContent = "花名册读取失败，请刷新页面后再试。";
            }

            return [];
        }
    }

    function updateRosterCounts() {
        const total = rosterData.length;
        const management = rosterData.filter((item) => item.category === "管理").length;
        const operation = rosterData.filter((item) => item.category === "运行").length;
        const maintenance = rosterData.filter((item) => item.category === "维护").length;
        const official = rosterData.filter((item) => item.status === "正式").length;
        const probation = rosterData.filter((item) => item.status === "试用").length;
        const left = rosterData.filter((item) => item.status === "离职").length;

        if (rosterCountEls.total) rosterCountEls.total.textContent = total;
        if (rosterCountEls.management) rosterCountEls.management.textContent = management;
        if (rosterCountEls.operation) rosterCountEls.operation.textContent = operation;
        if (rosterCountEls.maintenance) rosterCountEls.maintenance.textContent = maintenance;
        if (rosterCountEls.official) rosterCountEls.official.textContent = official;
        if (rosterCountEls.probation) rosterCountEls.probation.textContent = probation;
        if (rosterCountEls.left) rosterCountEls.left.textContent = left;
        if (rosterTotalInline) rosterTotalInline.textContent = total;
    }

    function applyRosterFilters() {
        if (!rosterBody || !rosterLoaded) return;

        const keyword = searchInput.value.trim().toLowerCase();

        const filtered = rosterData.filter(function (item) {
            const categoryMatch =
                currentCategory === "全部" ||
                item.category === currentCategory;

            const statusMatch =
                currentStatus === "全部" ||
                item.status === currentStatus;

            const text = [
                item.employeeId,
                item.name,
                item.category,
                item.position,
                item.title,
                item.status
            ].join(" ").toLowerCase();

            const keywordMatch =
                keyword === "" ||
                text.includes(keyword);

            return categoryMatch && statusMatch && keywordMatch;
        });

        renderRosterTable(filtered);

        if (visibleCount) {
            visibleCount.textContent = filtered.length;
        }

        if (rosterEmpty) {
            rosterEmpty.style.display =
                rosterData.length > 0 && filtered.length === 0
                    ? "block"
                    : "none";
        }
    }

    function renderRosterTable(items) {
        if (!rosterBody) return;

        rosterBody.innerHTML = "";

        items.forEach(function (item, index) {
            const row = document.createElement("tr");
            row.className = "roster-row searchable";
            row.dataset.category = item.category;
            row.dataset.status = item.status;

            appendCell(row, String(index + 1), "col-no");
            appendCell(row, item.employeeId, "col-id");
            appendCell(row, item.name, "roster-name");

            const categoryCell = document.createElement("td");
            const categoryTag = document.createElement("span");
            categoryTag.className = "category-tag " + categoryClass(item.category);
            categoryTag.textContent = item.category;
            categoryCell.appendChild(categoryTag);
            row.appendChild(categoryCell);

            appendCell(row, item.position, "roster-position");
            appendCell(row, item.title);

            const statusCell = document.createElement("td");
            const statusTag = document.createElement("span");
            statusTag.className = "status-tag " + statusClass(item.status);
            statusTag.textContent = item.status;
            statusCell.appendChild(statusTag);
            row.appendChild(statusCell);

            rosterBody.appendChild(row);
        });
    }

    function appendCell(row, value, className) {
        const cell = document.createElement("td");
        if (className) cell.className = className;
        cell.textContent = value || "";
        row.appendChild(cell);
    }

    function categoryClass(category) {
        if (category === "管理") return "cat-management";
        if (category === "维护") return "cat-maintenance";
        return "cat-operation";
    }

    function statusClass(status) {
        if (status === "正式") return "status-official";
        if (status === "离职") return "status-left";
        return "status-probation";
    }



    // ========================================
    // 各主页模块内部按钮由 portal-config 统一生成
    // ========================================

    // ========================================
    // 月计划：云端链接
    // ========================================

    const monthPlanButton = document.getElementById("month-plan-button");
    const monthPlanModal = document.getElementById("month-plan-modal");
    const monthPlanModalTitle = document.getElementById("month-modal-title");
    const monthPlanYear = document.getElementById("month-plan-year");
    const monthPlanGrid = document.getElementById("month-plan-grid");
    const monthModalCloseButtons = document.querySelectorAll("[data-month-modal-close]");

    async function loadMonthPlans(force) {
        if (monthPlansLoaded && !force) return monthPlanLinks;

        try {
            const response = await fetch("/api/month-plans", {
                cache: "no-store",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("无法读取月计划链接");
            }

            const data = await response.json();

            monthPlanLinks =
                data.plans && typeof data.plans === "object"
                    ? data.plans
                    : {};

            monthPlansLoaded = true;
            return monthPlanLinks;

        } catch (error) {
            monthPlanLinks = {};
            monthPlansLoaded = true;
            return monthPlanLinks;
        }
    }

    function getMonthPlanYears() {
        const years = Object.keys(monthPlanLinks).map(function (key) {
            return key.split("-")[0];
        });

        const unique = Array.from(new Set(years));

        if (unique.length === 0) {
            unique.push(String(new Date().getFullYear()));
        }

        return unique.sort(function (a, b) {
            return Number(b) - Number(a);
        });
    }

    function prepareMonthPlanYears() {
        if (!monthPlanYear) return;

        const currentValue = monthPlanYear.value;
        const years = getMonthPlanYears();

        monthPlanYear.innerHTML = "";

        years.forEach(function (year) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year + "年";
            monthPlanYear.appendChild(option);
        });

        const currentYear = String(new Date().getFullYear());

        if (years.includes(currentValue)) {
            monthPlanYear.value = currentValue;
        } else if (years.includes(currentYear)) {
            monthPlanYear.value = currentYear;
        }
    }

    function renderMonthPlanMonths() {
        if (!monthPlanGrid || !monthPlanYear) return;

        const year = monthPlanYear.value;
        monthPlanGrid.innerHTML = "";

        for (let month = 1; month <= 12; month += 1) {
            const monthText = String(month).padStart(2, "0");
            const key = year + "-" + monthText;
            const url = monthPlanLinks[key];

            const button = document.createElement("button");
            button.type = "button";
            button.className = "month-choice";

            const monthName = document.createElement("strong");
            monthName.textContent = month + "月";

            const status = document.createElement("span");

            if (url) {
                button.classList.add("available");
                status.textContent = "打开月计划";

                button.addEventListener("click", function () {
                    window.open(url, "_blank", "noopener,noreferrer");
                    closeMonthPlanModal();
                });
            } else {
                button.disabled = true;
                status.textContent = "暂未设置";
            }

            button.appendChild(monthName);
            button.appendChild(status);
            monthPlanGrid.appendChild(button);
        }
    }

    async function openMonthPlanModal(customTitle) {
        if (!monthPlanModal) return;

        if (monthPlanModalTitle) {
            monthPlanModalTitle.textContent = customTitle || "月计划";
        }

        await loadMonthPlans(true);
        prepareMonthPlanYears();
        renderMonthPlanMonths();

        monthPlanModal.classList.add("open");
        monthPlanModal.setAttribute("aria-hidden", "false");
    }

    function closeMonthPlanModal() {
        if (!monthPlanModal) return;

        monthPlanModal.classList.remove("open");
        monthPlanModal.setAttribute("aria-hidden", "true");
    }

    if (monthPlanButton) {
        monthPlanButton.addEventListener("click", openMonthPlanModal);
    }

    if (monthPlanYear) {
        monthPlanYear.addEventListener("change", renderMonthPlanMonths);
    }

    monthModalCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeMonthPlanModal);
    });


    // ========================================
    // 共享公告：自动保存 + 历史版本
    // ========================================

    const sharedNoteEditor = document.getElementById("shared-note-editor");
    const sharedNoteStatus = document.getElementById("shared-note-status");
    const sharedNoteUpdated = document.getElementById("shared-note-updated");
    const sharedNoteHistoryButton = document.getElementById("shared-note-history-button");

    const sharedNoteApi = "/api/shared-note";
    const localPreviewKey = "power-plant-shared-note-preview";

    let sharedNoteLoaded = false;
    let sharedNoteDirty = false;
    let sharedNoteSaving = false;
    let sharedNoteSaveTimer = null;

    function setSharedNoteStatus(text, className) {
        if (!sharedNoteStatus) return;

        sharedNoteStatus.textContent = text;
        sharedNoteStatus.className = "note-status";

        if (className) {
            sharedNoteStatus.classList.add(className);
        }
    }

    function formatDateTime(value) {
        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function showSharedNoteUpdated(value) {
        if (!sharedNoteUpdated) return;

        const text = formatDateTime(value);
        sharedNoteUpdated.textContent = text ? "最后更新：" + text : "";
    }

    async function loadSharedNote(forceRefresh) {
        if (!sharedNoteEditor) return;
        if (sharedNoteDirty || sharedNoteSaving) return;
        if (sharedNoteLoaded && !forceRefresh) return;

        setSharedNoteStatus("正在读取...", "is-saving");

        try {
            const response = await fetch(sharedNoteApi, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Shared storage is unavailable");
            }

            const data = await response.json();

            sharedNoteLoaded = true;

            if (document.activeElement !== sharedNoteEditor) {
                sharedNoteEditor.textContent = data.content || "";
            }

            setSharedNoteStatus("云端已同步", "is-saved");
            showSharedNoteUpdated(data.updatedAt);

        } catch (error) {
            sharedNoteLoaded = true;

            const localContent = localStorage.getItem(localPreviewKey);

            if (
                localContent !== null &&
                sharedNoteEditor.textContent.trim() === ""
            ) {
                sharedNoteEditor.textContent = localContent;
            }

            setSharedNoteStatus(
                "本机预览模式：共享储存连接失败",
                "is-local"
            );

            if (sharedNoteUpdated) {
                sharedNoteUpdated.textContent = "目前只会保存在这台电脑";
            }
        }
    }

    async function saveSharedNote() {
        if (!sharedNoteEditor || sharedNoteSaving) return;

        const content = sharedNoteEditor.innerText.replace(/\u00a0/g, " ");

        sharedNoteDirty = false;
        sharedNoteSaving = true;
        setSharedNoteStatus("正在保存...", "is-saving");

        try {
            const response = await fetch(sharedNoteApi, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error("Save failed");
            }

            const data = await response.json();

            localStorage.removeItem(localPreviewKey);
            setSharedNoteStatus("云端已保存", "is-saved");
            showSharedNoteUpdated(data.updatedAt);

        } catch (error) {
            localStorage.setItem(localPreviewKey, content);

            setSharedNoteStatus(
                "已保存在本机，云端保存失败",
                "is-local"
            );

            if (sharedNoteUpdated) {
                sharedNoteUpdated.textContent = "其他电脑暂时看不到这次修改";
            }
        } finally {
            sharedNoteSaving = false;

            if (sharedNoteDirty) {
                scheduleSharedNoteSave();
            }
        }
    }

    function scheduleSharedNoteSave() {
        if (!sharedNoteEditor) return;

        clearTimeout(sharedNoteSaveTimer);

        sharedNoteSaveTimer = setTimeout(function () {
            saveSharedNote();
        }, 2500);
    }

    if (sharedNoteEditor) {
        sharedNoteEditor.addEventListener("input", function () {
            sharedNoteDirty = true;
            setSharedNoteStatus("正在输入...", "is-saving");
            scheduleSharedNoteSave();
        });

        sharedNoteEditor.addEventListener("blur", function () {
            if (sharedNoteDirty) {
                clearTimeout(sharedNoteSaveTimer);
                saveSharedNote();
            }
        });
    }

    setInterval(function () {
        const noticePage = document.getElementById("notice-page");

        if (
            noticePage &&
            noticePage.classList.contains("active-page") &&
            !sharedNoteDirty &&
            !sharedNoteSaving &&
            document.activeElement !== sharedNoteEditor
        ) {
            sharedNoteLoaded = false;
            loadSharedNote(true);
        }
    }, 10000);


    // ========================================
    // 公告历史版本弹窗
    // ========================================

    const historyModal = document.getElementById("history-modal");
    const publicHistoryList = document.getElementById("public-history-list");
    const historyCloseButtons = document.querySelectorAll("[data-history-modal-close]");

    if (sharedNoteHistoryButton) {
        sharedNoteHistoryButton.addEventListener("click", async function () {
            if (!historyModal) return;

            historyModal.classList.add("open");
            historyModal.setAttribute("aria-hidden", "false");
            await renderHistoryList(publicHistoryList, false);
        });
    }

    historyCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeHistoryModal);
    });

    function closeHistoryModal() {
        if (!historyModal) return;
        historyModal.classList.remove("open");
        historyModal.setAttribute("aria-hidden", "true");
    }

    async function fetchHistory() {
        const response = await fetch("/api/shared-note/history", {
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("无法读取历史版本");
        }

        return response.json();
    }

    async function renderHistoryList(container, allowRestore) {
        if (!container) return;

        container.innerHTML = '<div class="history-empty">正在读取历史版本...</div>';

        try {
            const data = await fetchHistory();
            const history = Array.isArray(data.history) ? data.history : [];

            container.innerHTML = "";

            if (history.length === 0) {
                container.innerHTML = '<div class="history-empty">目前还没有历史版本。继续使用共享公告后，系统会自动开始留档。</div>';
                return;
            }

            history.forEach(function (item, index) {
                const card = document.createElement("div");
                card.className = "history-item";

                const info = document.createElement("div");
                info.className = "history-item-info";

                const title = document.createElement("strong");
                title.textContent = "历史版本 " + (index + 1);

                const time = document.createElement("span");
                time.textContent = formatDateTime(item.savedAt || item.snapshotAt);

                const preview = document.createElement("p");
                const text = String(item.content || "").replace(/\s+/g, " ").trim();
                preview.textContent =
                    text.length > 180
                        ? text.slice(0, 180) + "..."
                        : (text || "（空白内容）");

                info.appendChild(title);
                info.appendChild(time);
                info.appendChild(preview);
                card.appendChild(info);

                if (allowRestore) {
                    const restoreButton = document.createElement("button");
                    restoreButton.type = "button";
                    restoreButton.className = "secondary-action-btn";
                    restoreButton.textContent = "恢复此版本";

                    restoreButton.addEventListener("click", function () {
                        restoreHistoryVersion(item.id);
                    });

                    card.appendChild(restoreButton);
                }

                container.appendChild(card);
            });

        } catch (error) {
            container.innerHTML = '<div class="history-empty">历史版本读取失败，请稍后再试。</div>';
        }
    }

    async function restoreHistoryVersion(id) {
        if (!currentUser || currentUser.role !== "admin") {
            alert("只有系统管理员可以恢复历史版本。");
            closeHistoryModal();
            return;
        }

        const confirmed = confirm("确定恢复这个历史版本吗？当前公告会先自动保留为一个历史版本。");
        if (!confirmed) return;

        try {
            const response = await adminFetch("/api/shared-note/restore", {
                method: "POST",
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "恢复失败");
            }

            if (sharedNoteEditor) {
                sharedNoteEditor.textContent = data.content || "";
            }

            sharedNoteLoaded = true;
            sharedNoteDirty = false;
            setSharedNoteStatus("已恢复历史版本", "is-saved");
            showSharedNoteUpdated(data.updatedAt);

            await renderHistoryList(document.getElementById("admin-history-list"), true);
            alert("历史版本已恢复。");

        } catch (error) {
            alert(error.message || "恢复失败");
        }
    }


    // ========================================
    // 管理后台：使用当前管理员账号，不再二次输入密码
    // ========================================

    const adminLoginPanel = document.getElementById("admin-login-panel");
    const adminDashboard = document.getElementById("admin-dashboard");
    const adminLogoutButton = document.getElementById("admin-logout-button");

    async function initializeAdminPage() {
        if (!currentUser || currentUser.role !== "admin") {
            openPage("home");
            return;
        }
        if (adminLoginPanel) adminLoginPanel.hidden = true;
        if (adminDashboard) adminDashboard.hidden = false;

        await Promise.all([
            loadPortalConfig(true),
            loadMonthPlans(true),
            loadRoster(true),
            loadAdminUsers(true),
            loadAuditLogs(true)
        ]);

        renderPortalShell();
        renderAdminUsers();
        renderAdminModules();
        renderAdminChildButtons();
        renderAdminMonthPlans();
        renderAdminRoster();
        renderHistoryList(document.getElementById("admin-history-list"), true);
        renderAuditLogs();
        populateSystemSettingsForm();
    }

    if (adminLogoutButton) {
        adminLogoutButton.addEventListener("click", function () {
            window.location.href = "/logout";
        });
    }

    function adminFetch(url, options) {
        const settings = Object.assign({}, options || {});
        settings.headers = Object.assign({ "Content-Type": "application/json" }, settings.headers || {});
        settings.cache = "no-store";
        return fetch(url, settings).then(function (response) {
            if (response.status === 401) {
                window.location.replace("/logout?next=" + encodeURIComponent(window.location.pathname + window.location.search));
            }
            if (response.status === 403) {
                openPage("home");
            }
            return response;
        });
    }

    async function readJsonResponse(response, fallbackMessage) {
        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        if (!contentType.includes("application/json")) {
            const text = await response.text().catch(function () { return ""; });
            if (text.includes("Worker exceeded resource limits") || response.status === 1102) {
                throw new Error("服务器运算超过免费版限制，请稍后再试。");
            }
            throw new Error(fallbackMessage || "服务器返回了异常内容，请刷新后重试。");
        }
        return response.json();
    }

    // ========================================
    // 管理后台标签
    // ========================================

    const adminTabs = document.querySelectorAll("[data-admin-tab]");
    const adminTabPanels = document.querySelectorAll(".admin-tab-panel");

    adminTabs.forEach(function (button) {
        button.addEventListener("click", function () {
            const name = this.getAttribute("data-admin-tab");
            adminTabs.forEach(function (item) { item.classList.remove("active"); });
            adminTabPanels.forEach(function (panel) { panel.classList.remove("active"); });
            this.classList.add("active");
            const panel = document.getElementById("admin-" + name + "-tab");
            if (panel) panel.classList.add("active");

            if (name === "users") { loadAdminUsers(true).then(renderAdminUsers); }
            if (name === "modules") {
                renderAdminModules();
                renderAdminChildButtons();
            }
            if (name === "plan") renderAdminMonthPlans();
            if (name === "roster") renderAdminRoster();
            if (name === "history") renderHistoryList(document.getElementById("admin-history-list"), true);
            if (name === "audit") loadAuditLogs(true).then(renderAuditLogs);
            if (name === "settings") populateSystemSettingsForm();
        });
    });


    // ========================================
    // 管理后台：用户账号
    // ========================================
    let adminUsers = [];
    let adminUsersLoaded = false;
    const adminUserCreateForm = document.getElementById("admin-user-create-form");
    const adminUserUsername = document.getElementById("admin-user-username");
    const adminUserDisplayName = document.getElementById("admin-user-display-name");
    const adminUserPassword = document.getElementById("admin-user-password");
    const adminUserRole = document.getElementById("admin-user-role");
    const adminUserMessage = document.getElementById("admin-user-message");
    const adminUserBody = document.getElementById("admin-user-body");
    const userEditorModal = document.getElementById("user-editor-modal");
    const userEditorForm = document.getElementById("user-editor-form");
    const userEditUsername = document.getElementById("user-edit-username");
    const userEditUsernameDisplay = document.getElementById("user-edit-username-display");
    const userEditDisplayName = document.getElementById("user-edit-display-name");
    const userEditPassword = document.getElementById("user-edit-password");
    const userEditRole = document.getElementById("user-edit-role");
    const userEditActive = document.getElementById("user-edit-active");
    const userEditorMessage = document.getElementById("user-editor-message");

    async function loadAdminUsers(force) {
        if (adminUsersLoaded && !force) return adminUsers;
        try {
            const response = await adminFetch("/api/admin/users", { method: "GET" });
            const data = await readJsonResponse(response, "用户账号服务暂时异常，请刷新后重试。");
            if (!response.ok) throw new Error(data.error || "无法读取用户账号。");
            adminUsers = Array.isArray(data.users) ? data.users : [];
            adminUsersLoaded = true;
            return adminUsers;
        } catch (error) {
            setFormMessage(adminUserMessage, error.message || "无法读取用户账号。", "error");
            return [];
        }
    }

    function formatDateTime(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString("zh-CN", { hour12: false });
    }

    function renderAdminUsers() {
        if (!adminUserBody) return;
        adminUserBody.innerHTML = "";
        adminUsers.forEach(function (user) {
            const row = document.createElement("tr");
            const add = function (text) { const td = document.createElement("td"); td.textContent = text; row.appendChild(td); return td; };
            add(user.username || "");
            add(user.displayName || user.username || "");
            add(user.role === "admin" ? "管理员" : "普通用户");
            const stateCell = add(user.active === false ? "已停用" : "正常");
            if (user.active === false) stateCell.classList.add("account-disabled-text");
            add(formatDateTime(user.updatedAt));
            const actions = document.createElement("td");
            actions.className = "admin-row-actions";
            const edit = document.createElement("button"); edit.type = "button"; edit.className = "mini-action-btn"; edit.textContent = "编辑";
            edit.addEventListener("click", function () { openUserEditor(user); });
            const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "mini-action-btn"; toggle.textContent = user.active === false ? "启用" : "停用";
            toggle.addEventListener("click", async function () {
                await updateUserAccount(user.username, { displayName: user.displayName, role: user.role || "user", active: user.active === false, password: "" }, user.active === false ? "账号已启用。" : "账号已停用。");
            });
            const del = document.createElement("button"); del.type = "button"; del.className = "mini-action-btn danger"; del.textContent = "删除";
            del.addEventListener("click", async function () {
                if (!confirm("确定删除用户 “" + user.username + "” 吗？删除后该账号将不能再登录。")) return;
                try {
                    const response = await adminFetch("/api/admin/users", { method: "POST", body: JSON.stringify({ action: "delete", username: user.username }) });
                    const data = await readJsonResponse(response, "用户账号服务暂时异常，请刷新后重试。");
                    if (!response.ok) throw new Error(data.error || "删除失败。");
                    adminUsers = Array.isArray(data.users) ? data.users : [];
                    renderAdminUsers();
                    setFormMessage(adminUserMessage, "账号已删除。", "success");
                } catch (error) { setFormMessage(adminUserMessage, error.message || "删除失败。", "error"); }
            });
            actions.appendChild(edit); actions.appendChild(toggle); actions.appendChild(del); row.appendChild(actions);
            adminUserBody.appendChild(row);
        });
        if (!adminUsers.length) {
            const row = document.createElement("tr");
            const td = document.createElement("td"); td.colSpan = 6; td.className = "admin-empty-cell"; td.textContent = "还没有创建其他用户账号。"; row.appendChild(td); adminUserBody.appendChild(row);
        }
    }

    if (adminUserCreateForm) {
        adminUserCreateForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = adminUserUsername.value.trim().toLowerCase();
            const displayName = adminUserDisplayName.value.trim();
            const password = adminUserPassword.value;
            const role = adminUserRole ? adminUserRole.value : "user";
            setFormMessage(adminUserMessage, "正在创建账号...", "info");
            try {
                const response = await adminFetch("/api/admin/users", { method: "POST", body: JSON.stringify({ action: "create", username, displayName, password, role }) });
                const data = await readJsonResponse(response, "用户账号服务暂时异常，请刷新后重试。");
                if (!response.ok) throw new Error(data.error || "创建失败。");
                adminUsers = Array.isArray(data.users) ? data.users : [];
                adminUserCreateForm.reset();
                renderAdminUsers();
                setFormMessage(adminUserMessage, "账号已创建，可以直接交给员工登录。", "success");
            } catch (error) { setFormMessage(adminUserMessage, error.message || "创建失败。", "error"); }
        });
    }

    function openUserEditor(user) {
        if (!userEditorModal) return;
        userEditUsername.value = user.username || "";
        userEditUsernameDisplay.value = user.username || "";
        userEditDisplayName.value = user.displayName || user.username || "";
        if (userEditRole) userEditRole.value = user.role === "admin" ? "admin" : "user";
        userEditPassword.value = "";
        userEditActive.checked = user.active !== false;
        setFormMessage(userEditorMessage, "", "");
        userEditorModal.classList.add("open");
        userEditorModal.setAttribute("aria-hidden", "false");
    }

    document.querySelectorAll("[data-user-modal-close]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (userEditorModal) { userEditorModal.classList.remove("open"); userEditorModal.setAttribute("aria-hidden", "true"); }
        });
    });

    async function updateUserAccount(username, values, message) {
        try {
            const response = await adminFetch("/api/admin/users", { method: "POST", body: JSON.stringify(Object.assign({ action: "update", username: username }, values)) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "保存失败。");
            adminUsers = Array.isArray(data.users) ? data.users : [];
            renderAdminUsers();
            setFormMessage(adminUserMessage, message || "账号已更新。", "success");
            return true;
        } catch (error) {
            setFormMessage(userEditorMessage || adminUserMessage, error.message || "保存失败。", "error");
            return false;
        }
    }

    if (userEditorForm) {
        userEditorForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const ok = await updateUserAccount(userEditUsername.value, {
                displayName: userEditDisplayName.value.trim(),
                role: userEditRole ? userEditRole.value : "user",
                active: userEditActive.checked,
                password: userEditPassword.value
            }, "账号已更新。");
            if (ok && userEditorModal) { userEditorModal.classList.remove("open"); userEditorModal.setAttribute("aria-hidden", "true"); }
        });
    }

    // ========================================
    // 管理后台：Audit Log
    // ========================================
    let auditLogs = [];
    let auditLoaded = false;
    const adminAuditBody = document.getElementById("admin-audit-body");
    const adminAuditMessage = document.getElementById("admin-audit-message");
    const adminAuditRefresh = document.getElementById("admin-audit-refresh");

    async function loadAuditLogs(force) {
        if (auditLoaded && !force) return auditLogs;
        try {
            const response = await adminFetch("/api/admin/audit", { method: "GET" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "无法读取操作日志。");
            auditLogs = Array.isArray(data.logs) ? data.logs : [];
            auditLoaded = true;
            return auditLogs;
        } catch (error) {
            setFormMessage(adminAuditMessage, error.message || "无法读取操作日志。", "error");
            return [];
        }
    }

    function renderAuditLogs() {
        if (!adminAuditBody) return;
        adminAuditBody.innerHTML = "";
        auditLogs.forEach(function (item) {
            const row = document.createElement("tr");
            [formatDateTime(item.time), item.actor || "-", item.role === "admin" ? "管理员" : "普通用户", item.action || "-", item.target || "-", item.detail || "-"].forEach(function (text) {
                const td = document.createElement("td"); td.textContent = text; row.appendChild(td);
            });
            adminAuditBody.appendChild(row);
        });
        if (!auditLogs.length) {
            const row = document.createElement("tr"); const td = document.createElement("td"); td.colSpan = 6; td.className = "admin-empty-cell"; td.textContent = "目前还没有操作记录。"; row.appendChild(td); adminAuditBody.appendChild(row);
        }
    }
    if (adminAuditRefresh) adminAuditRefresh.addEventListener("click", function () { loadAuditLogs(true).then(renderAuditLogs); });

    // ========================================
    // 管理后台：系统设置
    // ========================================
    const adminSettingsForm = document.getElementById("admin-settings-form");
    const adminSettingsMessage = document.getElementById("admin-settings-message");
    const settingFields = {
        siteName: document.getElementById("setting-site-name"),
        siteSubtitle: document.getElementById("setting-site-subtitle"),
        portalTitle: document.getElementById("setting-portal-title"),
        portalSubtitle: document.getElementById("setting-portal-subtitle"),
        homeTitle: document.getElementById("setting-home-title"),
        homeDescription: document.getElementById("setting-home-description"),
        homeBadge: document.getElementById("setting-home-badge"),
        footerText: document.getElementById("setting-footer-text")
    };

    function populateSystemSettingsForm() {
        Object.keys(settingFields).forEach(function (key) { if (settingFields[key]) settingFields[key].value = systemSettings[key] || ""; });
    }

    if (adminSettingsForm) {
        adminSettingsForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const settings = {};
            Object.keys(settingFields).forEach(function (key) { settings[key] = settingFields[key] ? settingFields[key].value.trim() : ""; });
            setFormMessage(adminSettingsMessage, "正在保存...", "info");
            try {
                const response = await adminFetch("/api/system-settings", { method: "PUT", body: JSON.stringify({ settings: settings }) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "保存失败。");
                systemSettings = data.settings || settings;
                applySystemSettings(systemSettings);
                populateSystemSettingsForm();
                setFormMessage(adminSettingsMessage, "系统设置已保存。", "success");
            } catch (error) { setFormMessage(adminSettingsMessage, error.message || "保存失败。", "error"); }
        });
    }

    // ========================================
    // 管理后台：主页模块 + 每个模块内部按钮
    // ========================================

    const adminModuleAdd = document.getElementById("admin-module-add");
    const adminModuleList = document.getElementById("admin-module-list");
    const adminModuleMessage = document.getElementById("admin-module-message");
    const adminChildTitle = document.getElementById("admin-child-title");
    const adminChildSubtitle = document.getElementById("admin-child-subtitle");
    const adminChildAdd = document.getElementById("admin-child-add");
    const adminChildButtonList = document.getElementById("admin-child-button-list");
    const adminChildMessage = document.getElementById("admin-child-message");
    const adminSelectedModule = document.getElementById("admin-selected-module");

    const moduleEditorModal = document.getElementById("module-editor-modal");
    const moduleEditorTitle = document.getElementById("module-editor-title");
    const moduleEditorSubtitle = document.getElementById("module-editor-subtitle");
    const moduleEditorForm = document.getElementById("module-editor-form");
    const moduleEditId = document.getElementById("module-edit-id");
    const moduleEditName = document.getElementById("module-edit-name");
    const moduleEditDescription = document.getElementById("module-edit-description");
    const moduleEditVisible = document.getElementById("module-edit-visible");
    const moduleEditorMessage = document.getElementById("module-editor-message");
    const moduleModalCloseButtons = document.querySelectorAll("[data-module-modal-close]");

    const meetingButtonEditorModal = document.getElementById("meeting-button-editor-modal");
    const meetingButtonEditorTitle = document.getElementById("meeting-button-editor-title");
    const meetingButtonEditorSubtitle = document.getElementById("meeting-button-editor-subtitle");
    const meetingButtonEditorForm = document.getElementById("meeting-button-editor-form");
    const meetingButtonEditId = document.getElementById("meeting-button-edit-id");
    const meetingButtonEditType = document.getElementById("meeting-button-edit-type");
    const meetingButtonEditName = document.getElementById("meeting-button-edit-name");
    const meetingButtonEditDescription = document.getElementById("meeting-button-edit-description");
    const meetingButtonEditUrl = document.getElementById("meeting-button-edit-url");
    const meetingButtonEditVisible = document.getElementById("meeting-button-edit-visible");
    const meetingButtonUrlGroup = document.getElementById("meeting-button-url-group");
    const meetingButtonTypeNote = document.getElementById("meeting-button-type-note");
    const meetingButtonEditorMessage = document.getElementById("meeting-button-editor-message");
    const meetingButtonModalCloseButtons = document.querySelectorAll("[data-meeting-button-modal-close]");

    let selectedAdminModuleId = "meeting";

    function createPortalModuleId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return "module-" + window.crypto.randomUUID();
        }
        return "module-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    }

    function createInternalButtonId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return "button-" + window.crypto.randomUUID();
        }
        return "button-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    }

    function closeModuleEditor() {
        if (!moduleEditorModal) return;
        moduleEditorModal.classList.remove("open");
        moduleEditorModal.setAttribute("aria-hidden", "true");
    }

    function openModuleEditor(item) {
        if (!moduleEditorModal) return;
        const editing = item || null;
        moduleEditId.value = editing ? editing.id : "";
        moduleEditName.value = editing ? editing.name || "" : "";
        moduleEditDescription.value = editing ? editing.description || "" : "";
        moduleEditVisible.checked = editing ? editing.visible !== false : true;
        moduleEditorTitle.textContent = editing ? "编辑主页按钮" : "新增主页按钮";
        moduleEditorSubtitle.textContent = editing
            ? "修改名称后，主页 Dashboard 和顶部导航会一起更新。"
            : "保存后会同时加入主页 Dashboard，并排在管理后台之前。";
        setFormMessage(moduleEditorMessage, "", "");
        moduleEditorModal.classList.add("open");
        moduleEditorModal.setAttribute("aria-hidden", "false");
        setTimeout(function () { moduleEditName.focus(); }, 0);
    }

    moduleModalCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeModuleEditor);
    });

    if (adminModuleAdd) {
        adminModuleAdd.addEventListener("click", function () { openModuleEditor(null); });
    }

    async function savePortalModules(next, successMessage) {
        try {
            const response = await adminFetch("/api/portal-modules", {
                method: "PUT",
                body: JSON.stringify({ modules: next })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "保存失败");

            portalModules = Array.isArray(data.modules) ? data.modules : [];
            if (data.moduleButtons && typeof data.moduleButtons === "object") {
                portalButtons = data.moduleButtons;
            }
            portalLoaded = true;
            renderPortalShell();
            renderAdminModules();
            renderAdminChildButtons();
            setFormMessage(adminModuleMessage, successMessage || "主页模块已保存。", "success");
            return true;
        } catch (error) {
            setFormMessage(adminModuleMessage, error.message || "保存失败", "error");
            return false;
        }
    }

    if (moduleEditorForm) {
        moduleEditorForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const id = String(moduleEditId.value || "").trim();
            const name = moduleEditName.value.trim();
            const description = moduleEditDescription.value.trim();
            if (!name) {
                setFormMessage(moduleEditorMessage, "请输入按钮名称。", "error");
                return;
            }

            const next = portalModules.map(function (item) { return Object.assign({}, item); });
            if (id) {
                const index = next.findIndex(function (item) { return item.id === id; });
                if (index < 0) {
                    setFormMessage(moduleEditorMessage, "找不到这个主页按钮。", "error");
                    return;
                }
                next[index] = Object.assign({}, next[index], {
                    name: name,
                    description: description,
                    visible: moduleEditVisible.checked
                });
            } else {
                next.push({
                    id: createPortalModuleId(),
                    name: name,
                    description: description,
                    kind: "generic",
                    visible: moduleEditVisible.checked
                });
            }

            const ok = await savePortalModules(next, id ? "主页按钮已更新。" : "主页按钮已新增。 ");
            if (ok) closeModuleEditor();
        });
    }

    function setSelectedAdminModule(moduleId) {
        const module = getPortalModule(moduleId);
        if (!module) return;
        selectedAdminModuleId = module.id;
        renderAdminModules();
        renderAdminChildButtons();
        if (adminChildButtonList && typeof adminChildButtonList.scrollIntoView === "function") {
            adminChildButtonList.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    function moveArrayItem(list, from, to) {
        const next = list.slice();
        if (from < 0 || from >= next.length || to < 0 || to >= next.length || from === to) return next;
        const item = next.splice(from, 1)[0];
        next.splice(to, 0, item);
        return next;
    }

    function attachPointerReorder(container, row, handle, onCommit) {
        if (!container || !row || !handle) return;
        let dragging = false;
        let pointerId = null;
        let initialOrder = "";

        function orderString() {
            return Array.from(container.querySelectorAll("[data-sort-id]")).map(function (item) { return item.getAttribute("data-sort-id"); }).join("|");
        }

        handle.addEventListener("pointerdown", function (event) {
            if (event.button !== undefined && event.button !== 0) return;
            event.preventDefault();
            dragging = true;
            pointerId = event.pointerId;
            initialOrder = orderString();
            row.classList.add("is-dragging-row");
            document.body.classList.add("portal-reordering");
            try { handle.setPointerCapture(pointerId); } catch (error) {}
        });

        handle.addEventListener("pointermove", function (event) {
            if (!dragging || event.pointerId !== pointerId) return;
            event.preventDefault();
            const element = document.elementFromPoint(event.clientX, event.clientY);
            const target = element && element.closest ? element.closest("[data-sort-id]") : null;
            if (!target || target === row || target.parentElement !== container) return;
            const rect = target.getBoundingClientRect();
            if (event.clientY < rect.top + rect.height / 2) container.insertBefore(row, target);
            else container.insertBefore(row, target.nextSibling);
        });

        async function finish(event) {
            if (!dragging || (event.pointerId !== undefined && event.pointerId !== pointerId)) return;
            dragging = false;
            row.classList.remove("is-dragging-row");
            document.body.classList.remove("portal-reordering");
            try { handle.releasePointerCapture(pointerId); } catch (error) {}
            const finalOrder = orderString();
            pointerId = null;
            if (finalOrder === initialOrder) return;
            const ids = finalOrder ? finalOrder.split("|") : [];
            await onCommit(ids);
        }
        handle.addEventListener("pointerup", finish);
        handle.addEventListener("pointercancel", finish);
    }

    function createDragHandle() {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "drag-handle";
        handle.textContent = "⋮⋮";
        handle.title = "拖动调整顺序";
        handle.setAttribute("aria-label", "拖动调整顺序");
        return handle;
    }

    function renderAdminModules() {
        if (!adminModuleList) return;
        adminModuleList.innerHTML = "";
        if (!portalModules.length) {
            adminModuleList.innerHTML = '<div class="history-empty">目前没有主页模块。</div>';
            return;
        }

        portalModules.forEach(function (item, index) {
            const row = document.createElement("div");
            row.className = "meeting-button-admin-row" + (item.visible === false ? " is-hidden-item" : "");
            row.setAttribute("data-sort-id", item.id);
            if (item.id === selectedAdminModuleId) row.classList.add("is-selected-module");
            const dragHandle = createDragHandle();

            const info = document.createElement("div");
            info.className = "meeting-button-admin-info";
            const titleLine = document.createElement("div");
            titleLine.className = "meeting-button-title-line";
            const title = document.createElement("strong");
            title.textContent = (index + 1) + ". " + (item.name || "未命名按钮");
            const typeBadge = document.createElement("span");
            typeBadge.className = "meeting-button-type-badge";
            typeBadge.textContent = item.kind === "roster" ? "花名册" : item.kind === "notice" ? "共享公告" : "普通模块";
            const statusBadge = document.createElement("span");
            statusBadge.className = "meeting-button-status-badge" + (item.visible === false ? " is-off" : "");
            statusBadge.textContent = item.visible === false ? "已隐藏" : "显示中";
            titleLine.appendChild(title);
            titleLine.appendChild(typeBadge);
            titleLine.appendChild(statusBadge);
            const detail = document.createElement("span");
            const childCount = Array.isArray(portalButtons[item.id]) ? portalButtons[item.id].length : 0;
            detail.textContent = (item.description || "无说明") + " · 内部按钮 " + childCount + " 个";
            info.appendChild(titleLine);
            info.appendChild(detail);

            const actions = document.createElement("div");
            actions.className = "meeting-button-admin-actions";

            function action(label, className, handler, disabled) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = className || "secondary-action-btn mini";
                button.textContent = label;
                button.disabled = Boolean(disabled);
                button.addEventListener("click", handler);
                actions.appendChild(button);
            }

            action("管理里面按钮", "primary-action-btn mini", function () { setSelectedAdminModule(item.id); });
            action("编辑", "secondary-action-btn mini", function () { openModuleEditor(item); });
            action("↑ 上移", "secondary-action-btn mini", async function () {
                if (index === 0) return;
                await savePortalModules(moveArrayItem(portalModules, index, index - 1), "主页按钮顺序已更新。 ");
            }, index === 0);
            action("↓ 下移", "secondary-action-btn mini", async function () {
                if (index >= portalModules.length - 1) return;
                await savePortalModules(moveArrayItem(portalModules, index, index + 1), "主页按钮顺序已更新。 ");
            }, index === portalModules.length - 1);
            action("置顶", "secondary-action-btn mini", async function () {
                if (index === 0) return;
                await savePortalModules(moveArrayItem(portalModules, index, 0), "主页按钮已移到最前。 ");
            }, index === 0);
            action("置底", "secondary-action-btn mini", async function () {
                if (index >= portalModules.length - 1) return;
                await savePortalModules(moveArrayItem(portalModules, index, portalModules.length - 1), "主页按钮已移到最后。 ");
            }, index === portalModules.length - 1);
            action(item.visible === false ? "显示" : "隐藏", "secondary-action-btn mini", async function () {
                const next = portalModules.map(function (module) {
                    return module.id === item.id ? Object.assign({}, module, { visible: module.visible === false }) : module;
                });
                await savePortalModules(next, item.visible === false ? "主页按钮已显示。" : "主页按钮已隐藏。 ");
            });

            if (String(item.id).startsWith("module-") && item.kind === "generic") {
                action("删除", "danger-action-btn mini", async function () {
                    const confirmed = confirm("确定删除“" + item.name + "”这个主页模块吗？它里面的按钮也会从网站入口中消失。 ");
                    if (!confirmed) return;
                    const next = portalModules.filter(function (module) { return module.id !== item.id; });
                    if (selectedAdminModuleId === item.id) selectedAdminModuleId = "meeting";
                    await savePortalModules(next, "主页按钮已删除。 ");
                });
            }

            row.appendChild(dragHandle);
            row.appendChild(info);
            row.appendChild(actions);
            adminModuleList.appendChild(row);
            attachPointerReorder(adminModuleList, row, dragHandle, async function (ids) {
                const byId = new Map(portalModules.map(function (module) { return [module.id, module]; }));
                const next = ids.map(function (id) { return byId.get(id); }).filter(Boolean);
                if (next.length === portalModules.length) await savePortalModules(next, "主页按钮拖拽排序已保存。 ");
            });
        });
    }

    function closeMeetingButtonEditor() {
        if (!meetingButtonEditorModal) return;
        meetingButtonEditorModal.classList.remove("open");
        meetingButtonEditorModal.setAttribute("aria-hidden", "true");
    }

    function openMeetingButtonEditor(item) {
        if (!meetingButtonEditorModal || !getPortalModule(selectedAdminModuleId)) return;
        const editing = item || null;
        const type = editing && editing.type === "month-plan" ? "month-plan" : "link";
        meetingButtonEditId.value = editing ? editing.id : "";
        meetingButtonEditType.value = type;
        meetingButtonEditName.value = editing ? editing.name || "" : "";
        meetingButtonEditDescription.value = editing ? editing.description || "" : "";
        meetingButtonEditUrl.value = editing && type === "link" ? editing.url || "" : "";
        meetingButtonEditVisible.checked = editing ? editing.visible !== false : true;
        const module = getPortalModule(selectedAdminModuleId);
        meetingButtonEditorTitle.textContent = editing ? "编辑内部按钮" : "新增内部按钮";
        meetingButtonEditorSubtitle.textContent = type === "month-plan"
            ? "这是年月选择按钮，可以改名称、说明、显示状态和顺序。"
            : "保存后会显示在“" + module.name + "”里面。";
        if (meetingButtonUrlGroup) meetingButtonUrlGroup.hidden = type === "month-plan";
        if (meetingButtonTypeNote) {
            meetingButtonTypeNote.textContent = type === "month-plan" ? "按钮类型：年月选择（月计划）" : "按钮类型：普通链接";
        }
        setFormMessage(meetingButtonEditorMessage, "", "");
        meetingButtonEditorModal.classList.add("open");
        meetingButtonEditorModal.setAttribute("aria-hidden", "false");
        setTimeout(function () { meetingButtonEditName.focus(); }, 0);
    }

    meetingButtonModalCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeMeetingButtonEditor);
    });

    if (adminChildAdd) {
        adminChildAdd.addEventListener("click", function () { openMeetingButtonEditor(null); });
    }

    async function savePortalChildButtons(moduleId, next, successMessage) {
        try {
            const response = await adminFetch("/api/portal-buttons", {
                method: "PUT",
                body: JSON.stringify({ moduleId: moduleId, buttons: next })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "保存失败");
            portalButtons[moduleId] = Array.isArray(data.buttons) ? data.buttons : [];
            if (data.moduleButtons && typeof data.moduleButtons === "object") portalButtons = data.moduleButtons;
            portalLoaded = true;
            renderPortalShell();
            renderAdminModules();
            renderAdminChildButtons();
            setFormMessage(adminChildMessage, successMessage || "内部按钮已保存。", "success");
            return true;
        } catch (error) {
            setFormMessage(adminChildMessage, error.message || "保存失败", "error");
            return false;
        }
    }

    if (meetingButtonEditorForm) {
        meetingButtonEditorForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const module = getPortalModule(selectedAdminModuleId);
            if (!module) {
                setFormMessage(meetingButtonEditorMessage, "请先选择一个主页模块。", "error");
                return;
            }
            const id = String(meetingButtonEditId.value || "").trim();
            const type = meetingButtonEditType.value === "month-plan" ? "month-plan" : "link";
            const name = meetingButtonEditName.value.trim();
            const description = meetingButtonEditDescription.value.trim();
            const url = meetingButtonEditUrl.value.trim();
            if (!name) {
                setFormMessage(meetingButtonEditorMessage, "请输入按钮名称。", "error");
                return;
            }
            if (type === "link" && url && !/^https:\/\//i.test(url)) {
                setFormMessage(meetingButtonEditorMessage, "网址必须以 https:// 开头。", "error");
                return;
            }

            const current = Array.isArray(portalButtons[module.id]) ? portalButtons[module.id] : [];
            const next = current.map(function (item) { return Object.assign({}, item); });
            const savedItem = {
                id: id || createInternalButtonId(),
                name: name,
                description: description,
                type: type,
                url: type === "link" ? url : "",
                visible: meetingButtonEditVisible.checked
            };
            if (id) {
                const index = next.findIndex(function (item) { return item.id === id; });
                if (index >= 0) next[index] = savedItem;
            } else {
                next.push(savedItem);
            }

            const ok = await savePortalChildButtons(module.id, next, id ? "内部按钮已更新。" : "内部按钮已新增。 ");
            if (ok) closeMeetingButtonEditor();
        });
    }

    function renderAdminChildButtons() {
        if (!adminChildButtonList) return;
        const module = getPortalModule(selectedAdminModuleId) || portalModules[0] || null;
        if (!module) {
            selectedAdminModuleId = "";
            adminChildButtonList.innerHTML = '<div class="history-empty">请先新增一个主页模块。</div>';
            if (adminChildAdd) adminChildAdd.disabled = true;
            if (adminSelectedModule) adminSelectedModule.hidden = true;
            return;
        }
        selectedAdminModuleId = module.id;
        if (adminChildAdd) adminChildAdd.disabled = false;
        if (adminChildTitle) adminChildTitle.textContent = "“" + module.name + "”内部按钮";
        if (adminChildSubtitle) adminChildSubtitle.textContent = "这里新增的按钮只会显示在“" + module.name + "”页面里面。";
        if (adminSelectedModule) {
            adminSelectedModule.hidden = false;
            adminSelectedModule.textContent = "当前模块：" + module.name;
        }

        const buttons = Array.isArray(portalButtons[module.id]) ? portalButtons[module.id] : [];
        adminChildButtonList.innerHTML = "";
        if (!buttons.length) {
            adminChildButtonList.innerHTML = '<div class="history-empty">这个模块目前没有内部按钮。点击右上角“+ 新增内部按钮”即可添加。</div>';
            return;
        }

        buttons.forEach(function (item, index) {
            const row = document.createElement("div");
            row.className = "meeting-button-admin-row" + (item.visible === false ? " is-hidden-item" : "");
            row.setAttribute("data-sort-id", item.id);
            const dragHandle = createDragHandle();
            const info = document.createElement("div");
            info.className = "meeting-button-admin-info";
            const titleLine = document.createElement("div");
            titleLine.className = "meeting-button-title-line";
            const title = document.createElement("strong");
            title.textContent = item.name || "未命名按钮";
            const typeBadge = document.createElement("span");
            typeBadge.className = "meeting-button-type-badge";
            typeBadge.textContent = item.type === "month-plan" ? "年月选择" : "普通链接";
            const statusBadge = document.createElement("span");
            statusBadge.className = "meeting-button-status-badge" + (item.visible === false ? " is-off" : "");
            statusBadge.textContent = item.visible === false ? "已隐藏" : "显示中";
            titleLine.appendChild(title);
            titleLine.appendChild(typeBadge);
            titleLine.appendChild(statusBadge);
            const detail = document.createElement("span");
            detail.textContent = item.type === "month-plan"
                ? (item.description || "年月选择")
                : (item.description || "无说明") + (item.url ? " · " + item.url : " · 暂未设置链接");
            info.appendChild(titleLine);
            info.appendChild(detail);

            const actions = document.createElement("div");
            actions.className = "meeting-button-admin-actions";
            function action(label, className, handler, disabled) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = className || "secondary-action-btn mini";
                button.textContent = label;
                button.disabled = Boolean(disabled);
                button.addEventListener("click", handler);
                actions.appendChild(button);
            }
            action("编辑", "secondary-action-btn mini", function () { openMeetingButtonEditor(item); });
            action("↑ 上移", "secondary-action-btn mini", async function () {
                if (index === 0) return;
                await savePortalChildButtons(module.id, moveArrayItem(buttons, index, index - 1), "内部按钮顺序已更新。 ");
            }, index === 0);
            action("↓ 下移", "secondary-action-btn mini", async function () {
                if (index >= buttons.length - 1) return;
                await savePortalChildButtons(module.id, moveArrayItem(buttons, index, index + 1), "内部按钮顺序已更新。 ");
            }, index === buttons.length - 1);
            action(item.visible === false ? "显示" : "隐藏", "secondary-action-btn mini", async function () {
                const next = buttons.map(function (buttonItem) {
                    return buttonItem.id === item.id ? Object.assign({}, buttonItem, { visible: buttonItem.visible === false }) : buttonItem;
                });
                await savePortalChildButtons(module.id, next, item.visible === false ? "内部按钮已显示。" : "内部按钮已隐藏。 ");
            });
            if (item.type !== "month-plan") {
                action("删除", "danger-action-btn mini", async function () {
                    const confirmed = confirm("确定删除“" + (item.name || "这个按钮") + "”吗？");
                    if (!confirmed) return;
                    await savePortalChildButtons(module.id, buttons.filter(function (buttonItem) { return buttonItem.id !== item.id; }), "内部按钮已删除。 ");
                });
            }
            row.appendChild(dragHandle);
            row.appendChild(info);
            row.appendChild(actions);
            adminChildButtonList.appendChild(row);
            attachPointerReorder(adminChildButtonList, row, dragHandle, async function (ids) {
                const byId = new Map(buttons.map(function (buttonItem) { return [buttonItem.id, buttonItem]; }));
                const next = ids.map(function (id) { return byId.get(id); }).filter(Boolean);
                if (next.length === buttons.length) await savePortalChildButtons(module.id, next, "内部按钮拖拽排序已保存。 ");
            });
        });
    }


    // ========================================
    // 管理后台：完整数据备份 / 恢复
    // ========================================

    const adminBackupDownload = document.getElementById("admin-backup-download");
    const adminBackupMessage = document.getElementById("admin-backup-message");
    const adminRestoreFile = document.getElementById("admin-restore-file");
    const adminRestoreButton = document.getElementById("admin-restore-button");
    const adminRestoreMessage = document.getElementById("admin-restore-message");
    const adminBackupFileSummary = document.getElementById("admin-backup-file-summary");
    let selectedBackupData = null;

    function formatBackupDate(value) {
        if (!value) return "未知";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString("zh-CN", { hour12: false });
    }

    if (adminBackupDownload) {
        adminBackupDownload.addEventListener("click", async function () {
            setFormMessage(adminBackupMessage, "正在整理全部云端数据...", "info");
            adminBackupDownload.disabled = true;

            try {
                const response = await adminFetch("/api/admin/backup", { method: "GET" });

                if (!response.ok) {
                    const data = await response.json().catch(function () { return {}; });
                    throw new Error(data.error || "备份失败。");
                }

                const blob = await response.blob();
                const disposition = response.headers.get("Content-Disposition") || "";
                const match = disposition.match(/filename="([^"]+)"/i);
                const today = new Date().toISOString().slice(0, 10);
                const filename = match ? match[1] : ("power-plant-backup-" + today + ".json");
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);

                setFormMessage(adminBackupMessage, "完整备份已下载，请妥善保存这个 JSON 文件。", "success");
            } catch (error) {
                setFormMessage(adminBackupMessage, error.message || "备份失败。", "error");
            } finally {
                adminBackupDownload.disabled = false;
            }
        });
    }

    if (adminRestoreFile) {
        adminRestoreFile.addEventListener("change", async function () {
            selectedBackupData = null;
            if (adminRestoreButton) adminRestoreButton.disabled = true;
            if (adminBackupFileSummary) {
                adminBackupFileSummary.hidden = true;
                adminBackupFileSummary.textContent = "";
            }
            setFormMessage(adminRestoreMessage, "", "");

            const file = adminRestoreFile.files && adminRestoreFile.files[0];
            if (!file) return;

            try {
                if (file.size > 8 * 1024 * 1024) {
                    throw new Error("备份文件太大，无法导入。");
                }

                const data = JSON.parse(await file.text());
                if (!data || data.format !== "power-plant-site-backup" || Number(data.version) !== 1 || !Array.isArray(data.entries)) {
                    throw new Error("这不是本网站导出的完整备份文件。");
                }

                selectedBackupData = data;
                if (adminRestoreButton) adminRestoreButton.disabled = false;
                if (adminBackupFileSummary) {
                    adminBackupFileSummary.hidden = false;
                    adminBackupFileSummary.textContent =
                        "备份时间：" + formatBackupDate(data.exportedAt) +
                        "　｜　数据项：" + data.entries.length + " 项";
                }
            } catch (error) {
                selectedBackupData = null;
                if (adminRestoreButton) adminRestoreButton.disabled = true;
                setFormMessage(adminRestoreMessage, error.message || "无法读取备份文件。", "error");
            }
        });
    }

    if (adminRestoreButton) {
        adminRestoreButton.addEventListener("click", async function () {
            if (!selectedBackupData) {
                setFormMessage(adminRestoreMessage, "请先选择一个完整备份文件。", "error");
                return;
            }

            const confirmed = window.confirm(
                "确定要恢复这个备份吗？\n\n备份中的同名云端数据会覆盖当前资料。建议恢复前先点一次“导出完整备份”保存当前状态。"
            );
            if (!confirmed) return;

            adminRestoreButton.disabled = true;
            setFormMessage(adminRestoreMessage, "正在恢复全部数据，请不要关闭页面...", "info");

            try {
                const response = await adminFetch("/api/admin/restore", {
                    method: "POST",
                    body: JSON.stringify({ backup: selectedBackupData })
                });
                const data = await response.json().catch(function () { return {}; });

                if (!response.ok) {
                    throw new Error(data.error || "恢复失败。");
                }

                setFormMessage(adminRestoreMessage, "恢复完成，共恢复 " + (data.restored || 0) + " 项数据。", "success");
                window.alert("完整备份已经恢复。网站将重新载入最新资料。");
                window.location.reload();
            } catch (error) {
                setFormMessage(adminRestoreMessage, error.message || "恢复失败。", "error");
                adminRestoreButton.disabled = false;
            }
        });
    }

    // ========================================
    // 管理后台：月计划
    // ========================================

    const adminPlanYear = document.getElementById("admin-plan-year");
    const adminPlanMonth = document.getElementById("admin-plan-month");
    const adminPlanUrl = document.getElementById("admin-plan-url");
    const adminPlanSave = document.getElementById("admin-plan-save");
    const adminPlanMessage = document.getElementById("admin-plan-message");
    const adminMonthPlanList = document.getElementById("admin-month-plan-list");

    if (adminPlanYear) {
        adminPlanYear.value = String(new Date().getFullYear());
    }

    if (adminPlanMonth) {
        adminPlanMonth.value = String(new Date().getMonth() + 1).padStart(2, "0");
    }

    if (adminPlanSave) {
        adminPlanSave.addEventListener("click", async function () {
            const year = String(adminPlanYear.value || "").trim();
            const month = String(adminPlanMonth.value || "").trim();
            const url = String(adminPlanUrl.value || "").trim();

            if (!/^\d{4}$/.test(year)) {
                setFormMessage(adminPlanMessage, "请输入正确的年份。", "error");
                return;
            }

            if (!/^https:\/\//i.test(url)) {
                setFormMessage(adminPlanMessage, "Lark 链接必须以 https:// 开头。", "error");
                return;
            }

            const key = year + "-" + month;
            const next = Object.assign({}, monthPlanLinks);
            next[key] = url;

            const saved = await saveMonthPlanMap(next);

            if (saved) {
                adminPlanUrl.value = "";
                setFormMessage(adminPlanMessage, year + "年" + Number(month) + "月已保存。", "success");
            }
        });
    }

    async function saveMonthPlanMap(next) {
        try {
            const response = await adminFetch("/api/month-plans", {
                method: "PUT",
                body: JSON.stringify({
                    plans: next
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "保存失败");
            }

            monthPlanLinks = data.plans || {};
            monthPlansLoaded = true;
            renderAdminMonthPlans();
            return true;

        } catch (error) {
            setFormMessage(adminPlanMessage, error.message || "保存失败", "error");
            return false;
        }
    }

    function renderAdminMonthPlans() {
        if (!adminMonthPlanList) return;

        const entries = Object.entries(monthPlanLinks).sort(function (a, b) {
            return b[0].localeCompare(a[0]);
        });

        adminMonthPlanList.innerHTML = "";

        if (entries.length === 0) {
            adminMonthPlanList.innerHTML = '<div class="history-empty">目前还没有设置任何月计划链接。</div>';
            return;
        }

        entries.forEach(function (entry) {
            const key = entry[0];
            const url = entry[1];
            const parts = key.split("-");

            const row = document.createElement("div");
            row.className = "admin-list-row";

            const info = document.createElement("div");
            info.className = "admin-list-info";

            const title = document.createElement("strong");
            title.textContent = parts[0] + "年" + Number(parts[1]) + "月";

            const link = document.createElement("span");
            link.textContent = url;

            info.appendChild(title);
            info.appendChild(link);

            const actions = document.createElement("div");
            actions.className = "admin-list-actions";

            const edit = document.createElement("button");
            edit.type = "button";
            edit.className = "secondary-action-btn";
            edit.textContent = "编辑";
            edit.addEventListener("click", function () {
                adminPlanYear.value = parts[0];
                adminPlanMonth.value = parts[1];
                adminPlanUrl.value = url;
                adminPlanUrl.focus();
            });

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "danger-action-btn";
            remove.textContent = "删除";
            remove.addEventListener("click", async function () {
                const confirmed = confirm("确定删除 " + parts[0] + "年" + Number(parts[1]) + "月 的月计划链接吗？");
                if (!confirmed) return;

                const next = Object.assign({}, monthPlanLinks);
                delete next[key];

                const saved = await saveMonthPlanMap(next);

                if (saved) {
                    setFormMessage(adminPlanMessage, "月计划链接已删除。", "success");
                }
            });

            actions.appendChild(edit);
            actions.appendChild(remove);

            row.appendChild(info);
            row.appendChild(actions);

            adminMonthPlanList.appendChild(row);
        });
    }


    // ========================================
    // 管理后台：花名册
    // ========================================

    const adminRosterAdd = document.getElementById("admin-roster-add");
    const adminRosterSearch = document.getElementById("admin-roster-search");
    const adminRosterBody = document.getElementById("admin-roster-body");
    const adminRosterCount = document.getElementById("admin-roster-count");
    const adminRosterMessage = document.getElementById("admin-roster-message");

    const rosterEditorModal = document.getElementById("roster-editor-modal");
    const rosterEditorTitle = document.getElementById("roster-editor-title");
    const rosterEditorForm = document.getElementById("roster-editor-form");
    const rosterEditUid = document.getElementById("roster-edit-uid");
    const rosterEditId = document.getElementById("roster-edit-id");
    const rosterEditName = document.getElementById("roster-edit-name");
    const rosterEditCategory = document.getElementById("roster-edit-category");
    const rosterEditPosition = document.getElementById("roster-edit-position");
    const rosterEditTitleField = document.getElementById("roster-edit-title-field");
    const rosterEditStatus = document.getElementById("roster-edit-status");
    const rosterEditorMessage = document.getElementById("roster-editor-message");
    const rosterModalCloseButtons = document.querySelectorAll("[data-roster-modal-close]");

    if (adminRosterAdd) {
        adminRosterAdd.addEventListener("click", function () {
            openRosterEditor();
        });
    }

    if (adminRosterSearch) {
        adminRosterSearch.addEventListener("input", renderAdminRoster);
    }

    rosterModalCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeRosterEditor);
    });

    function openRosterEditor(item) {
        if (!rosterEditorModal) return;

        rosterEditUid.value = item?.uid || "";
        rosterEditId.value = item?.employeeId || "";
        rosterEditName.value = item?.name || "";
        rosterEditCategory.value = item?.category || "运行";
        rosterEditPosition.value = item?.position || "";
        rosterEditTitleField.value = item?.title || "";
        rosterEditStatus.value = item?.status || "试用";

        rosterEditorTitle.textContent =
            item
                ? "编辑人员"
                : "新增人员";

        setFormMessage(rosterEditorMessage, "", "");

        rosterEditorModal.classList.add("open");
        rosterEditorModal.setAttribute("aria-hidden", "false");

        setTimeout(function () {
            rosterEditId.focus();
        }, 50);
    }

    function closeRosterEditor() {
        if (!rosterEditorModal) return;

        rosterEditorModal.classList.remove("open");
        rosterEditorModal.setAttribute("aria-hidden", "true");
    }

    if (rosterEditorForm) {
        rosterEditorForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const employeeId = rosterEditId.value.trim();
            const name = rosterEditName.value.trim();

            if (!employeeId || !name) {
                setFormMessage(rosterEditorMessage, "工号和姓名必须填写。", "error");
                return;
            }

            const uid = rosterEditUid.value.trim();

            const item = {
                uid: uid,
                employeeId: employeeId,
                name: name,
                category: rosterEditCategory.value,
                position: rosterEditPosition.value.trim(),
                title: rosterEditTitleField.value.trim(),
                status: rosterEditStatus.value
            };

            const next = rosterData.slice();

            if (uid) {
                const index = next.findIndex(function (person) {
                    return person.uid === uid;
                });

                if (index >= 0) {
                    next[index] = item;
                }
            } else {
                next.push(item);
            }

            const saved = await saveRosterData(next, rosterEditorMessage);

            if (saved) {
                closeRosterEditor();
                setFormMessage(adminRosterMessage, uid ? "人员资料已更新。" : "人员已新增。", "success");
            }
        });
    }

    async function saveRosterData(next, messageEl) {
        try {
            const response = await adminFetch("/api/roster", {
                method: "PUT",
                body: JSON.stringify({
                    roster: next
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "花名册保存失败");
            }

            rosterData = Array.isArray(data.roster) ? data.roster : [];
            rosterLoaded = true;

            updateRosterCounts();
            applyRosterFilters();
            renderAdminRoster();

            return true;

        } catch (error) {
            setFormMessage(messageEl || adminRosterMessage, error.message || "保存失败", "error");
            return false;
        }
    }

    function renderAdminRoster() {
        if (!adminRosterBody) return;

        const keyword = adminRosterSearch
            ? adminRosterSearch.value.trim().toLowerCase()
            : "";

        const filtered = rosterData.filter(function (item) {
            if (!keyword) return true;

            return [
                item.employeeId,
                item.name,
                item.category,
                item.position,
                item.title,
                item.status
            ].join(" ").toLowerCase().includes(keyword);
        });

        adminRosterBody.innerHTML = "";

        filtered.forEach(function (item) {
            const row = document.createElement("tr");

            appendCell(row, item.employeeId);
            appendCell(row, item.name);
            appendCell(row, item.category);
            appendCell(row, item.position);
            appendCell(row, item.title);
            appendCell(row, item.status);

            const actionCell = document.createElement("td");
            actionCell.className = "admin-row-actions";

            const edit = document.createElement("button");
            edit.type = "button";
            edit.className = "secondary-action-btn mini";
            edit.textContent = "编辑";
            edit.addEventListener("click", function () {
                openRosterEditor(item);
            });

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "danger-action-btn mini";
            remove.textContent = "删除";
            remove.addEventListener("click", async function () {
                const confirmed = confirm("确定删除“" + item.name + "”吗？删除后人数统计会自动重新计算。");
                if (!confirmed) return;

                const next = rosterData.filter(function (person) {
                    return person.uid !== item.uid;
                });

                const saved = await saveRosterData(next, adminRosterMessage);

                if (saved) {
                    setFormMessage(adminRosterMessage, "人员已删除，人数统计已自动更新。", "success");
                }
            });

            actionCell.appendChild(edit);
            actionCell.appendChild(remove);
            row.appendChild(actionCell);

            adminRosterBody.appendChild(row);
        });

        if (adminRosterCount) {
            adminRosterCount.textContent =
                "显示 " + filtered.length + " / " + rosterData.length + " 人";
        }
    }


    // ========================================
    // 管理后台：公告历史
    // ========================================

    const adminHistoryRefresh = document.getElementById("admin-history-refresh");

    if (adminHistoryRefresh) {
        adminHistoryRefresh.addEventListener("click", function () {
            renderHistoryList(document.getElementById("admin-history-list"), true);
        });
    }


    // ========================================
    // 通用提示
    // ========================================

    function setFormMessage(element, text, type) {
        if (!element) return;

        element.textContent = text || "";
        element.className = "form-message";

        if (type) {
            element.classList.add("is-" + type);
        }
    }


    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;

        closeMonthPlanModal();
        closeHistoryModal();
        closeMeetingButtonEditor();
        closeRosterEditor();
        closeChangePasswordModal();
        closeGlobalSearch();
    });


    // PWA：只缓存图标和清单，不缓存登录后的业务页面或 API 数据。
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("/sw.js").catch(function () {});
        });
    }

    // 第一次打开网站
    openPage("home");
});
