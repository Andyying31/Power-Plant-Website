// ========================================
// 网站登录：30 分钟无操作自动退出；关闭标签页后重新打开需要再次输入密码
// ========================================
(function () {
    const SITE_TAB_KEY = "powerPlantSiteTabSession";
    const SITE_ACTIVITY_KEY = "powerPlantSiteLastActivity";
    const ADMIN_PASSWORD_KEY = "powerPlantAdminPassword";
    const ADMIN_ACTIVITY_KEY = "powerPlantAdminLastActivity";
    const IDLE_MS = 30 * 60 * 1000;
    const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

    let lastServerTouch = 0;
    let redirecting = false;

    function clearSessionState() {
        try {
            sessionStorage.removeItem(SITE_TAB_KEY);
            sessionStorage.removeItem(SITE_ACTIVITY_KEY);
            sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
            sessionStorage.removeItem(ADMIN_ACTIVITY_KEY);
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

    const ADMIN_PASSWORD_KEY = "powerPlantAdminPassword";
    const ADMIN_ACTIVITY_KEY = "powerPlantAdminLastActivity";
    const ADMIN_IDLE_MS = 30 * 60 * 1000;

    let adminPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY) || "";
    let adminVerified = false;
    let adminLastActivity = Number(sessionStorage.getItem(ADMIN_ACTIVITY_KEY)) || 0;

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

    function createPortalLinkButton(item) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "link-card searchable";

        const content = document.createElement("div");
        content.className = "card-content";

        const title = document.createElement("h3");
        title.textContent = item.name || "未命名按钮";

        const description = document.createElement("p");
        description.textContent = item.description || (item.type === "month-plan" ? "选择年份和月份" : "打开链接");

        const arrow = document.createElement("div");
        arrow.className = "card-arrow";
        arrow.textContent = "→";

        content.appendChild(title);
        content.appendChild(description);
        button.appendChild(content);
        button.appendChild(arrow);

        button.addEventListener("click", function () {
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
        });

        return button;
    }

    function renderModuleButtons(moduleId, container, emptyElement) {
        if (!container) return;
        const buttons = Array.isArray(portalButtons[moduleId]) ? portalButtons[moduleId] : [];
        const visibleButtons = buttons.filter(function (item) {
            return item && item.visible !== false;
        });

        container.innerHTML = "";
        visibleButtons.forEach(function (item) {
            container.appendChild(createPortalLinkButton(item));
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

        if (currentPage !== "home" && currentPage !== "admin") {
            const currentModule = getPortalModule(currentPage);
            if (!currentModule || currentModule.visible === false) {
                currentPage = "home";
            }
        }
    }

    async function openPage(pageName) {
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
        let title = "沙巴光伏自备电厂导航";
        let subtitle = "部门业务总览";
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

    loadPortalConfig().then(function () {
        renderPortalShell();
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
        if (!adminVerified || !adminPassword) {
            alert("请先到“管理后台”登录管理员账号。");
            closeHistoryModal();
            openPage("admin");
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
    // 管理后台登录
    // ========================================

    const adminLoginPanel = document.getElementById("admin-login-panel");
    const adminDashboard = document.getElementById("admin-dashboard");
    const adminLoginForm = document.getElementById("admin-login-form");
    const adminPasswordInput = document.getElementById("admin-password");
    const adminLoginMessage = document.getElementById("admin-login-message");
    const adminLogoutButton = document.getElementById("admin-logout-button");

    function adminSessionExpired() {
        if (!adminPassword && !adminVerified) return false;
        return !adminLastActivity || Date.now() - adminLastActivity >= ADMIN_IDLE_MS;
    }

    function touchAdminActivity() {
        if (!adminVerified || !adminPassword) return;
        adminLastActivity = Date.now();
        sessionStorage.setItem(ADMIN_ACTIVITY_KEY, String(adminLastActivity));
    }

    function clearAdminSession() {
        adminPassword = "";
        adminVerified = false;
        adminLastActivity = 0;
        sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
        sessionStorage.removeItem(ADMIN_ACTIVITY_KEY);
    }

    function expireAdminSession(showMessage) {
        clearAdminSession();
        showAdminLogin();
        if (showMessage) {
            setFormMessage(adminLoginMessage, "管理员登录已超过 30 分钟无操作，请重新输入密码。", "error");
        }
    }

    async function initializeAdminPage() {
        if (adminSessionExpired()) {
            expireAdminSession(false);
        }

        if (adminVerified) {
            showAdminDashboard();
            return;
        }

        if (adminPassword) {
            const ok = await verifyAdminPassword(adminPassword, false);

            if (ok) {
                showAdminDashboard();
                return;
            }

            clearAdminSession();
        }

        showAdminLogin();
    }

    function showAdminLogin() {
        if (adminLoginPanel) adminLoginPanel.hidden = false;
        if (adminDashboard) adminDashboard.hidden = true;
    }

    async function showAdminDashboard() {
        if (adminLoginPanel) adminLoginPanel.hidden = true;
        if (adminDashboard) adminDashboard.hidden = false;

        await Promise.all([
            loadPortalConfig(true),
            loadMonthPlans(true),
            loadRoster(true)
        ]);

        renderPortalShell();
        renderAdminModules();
        renderAdminChildButtons();
        renderAdminMonthPlans();
        renderAdminRoster();
        renderHistoryList(document.getElementById("admin-history-list"), true);
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const password = adminPasswordInput.value;

            if (!password) {
                setFormMessage(adminLoginMessage, "请输入管理员密码。", "error");
                return;
            }

            setFormMessage(adminLoginMessage, "正在登录...", "info");

            const ok = await verifyAdminPassword(password, true);

            if (ok) {
                adminPassword = password;
                adminVerified = true;
                adminLastActivity = Date.now();
                sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
                sessionStorage.setItem(ADMIN_ACTIVITY_KEY, String(adminLastActivity));
                adminPasswordInput.value = "";
                setFormMessage(adminLoginMessage, "", "");
                showAdminDashboard();
            }
        });
    }

    async function verifyAdminPassword(password, showMessage) {
        try {
            const response = await fetch("/api/admin/verify", {
                method: "POST",
                headers: {
                    "X-Admin-Password": password
                },
                cache: "no-store"
            });

            const data = await response.json().catch(function () {
                return {};
            });

            if (!response.ok) {
                if (showMessage) {
                    const message =
                        response.status === 503
                            ? "Cloudflare 还没有设置 ADMIN_PASSWORD。"
                            : (data.error || "管理员密码不正确。");

                    setFormMessage(adminLoginMessage, message, "error");
                }

                return false;
            }

            adminVerified = true;
            return true;

        } catch (error) {
            if (showMessage) {
                setFormMessage(adminLoginMessage, "无法连接管理后台，请稍后再试。", "error");
            }

            return false;
        }
    }

    if (adminLogoutButton) {
        adminLogoutButton.addEventListener("click", function () {
            clearAdminSession();
            showAdminLogin();
        });
    }

    function adminFetch(url, options) {
        if (adminSessionExpired()) {
            expireAdminSession(true);
            return Promise.reject(new Error("管理员登录已超时，请重新登录。"));
        }

        touchAdminActivity();
        const settings = Object.assign({}, options || {});
        settings.headers = Object.assign(
            {
                "Content-Type": "application/json",
                "X-Admin-Password": adminPassword
            },
            settings.headers || {}
        );

        settings.cache = "no-store";

        return fetch(url, settings);
    }


    ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (eventName) {
        window.addEventListener(eventName, function () {
            const adminPage = document.getElementById("admin-page");
            if (adminVerified && adminPage && adminPage.classList.contains("active-page")) {
                touchAdminActivity();
            }
        }, { passive: true });
    });

    window.setInterval(function () {
        if (adminVerified && adminSessionExpired()) {
            const adminPage = document.getElementById("admin-page");
            expireAdminSession(Boolean(adminPage && adminPage.classList.contains("active-page")));
        }
    }, 30 * 1000);


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

            if (name === "modules") {
                renderAdminModules();
                renderAdminChildButtons();
            }
            if (name === "plan") renderAdminMonthPlans();
            if (name === "roster") renderAdminRoster();
            if (name === "history") renderHistoryList(document.getElementById("admin-history-list"), true);
        });
    });


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
            if (item.id === selectedAdminModuleId) row.classList.add("is-selected-module");

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

            row.appendChild(info);
            row.appendChild(actions);
            adminModuleList.appendChild(row);
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
            row.appendChild(info);
            row.appendChild(actions);
            adminChildButtonList.appendChild(row);
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
    });


    // 第一次打开网站
    openPage("home");
});
