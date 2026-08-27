document.addEventListener("DOMContentLoaded", function () {

    const menuItems = document.querySelectorAll(".menu-item[data-page]");
    const pages = document.querySelectorAll(".page-section");
    const searchInput = document.getElementById("search");
    const searchBox = document.querySelector(".search-box");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");

    const categoryButtons = document.querySelectorAll("[data-category-filter]");
    const statusButtons = document.querySelectorAll("[data-status-filter]");

    let currentCategory = "全部";
    let currentStatus = "全部";
    let rosterData = [];
    let rosterLoaded = false;
    let monthPlanLinks = {};
    let monthPlansLoaded = false;

    let adminPassword = sessionStorage.getItem("powerPlantAdminPassword") || "";
    let adminVerified = false;

    const pageInformation = {
        home: {
            title: "沙巴光伏自备电厂导航",
            subtitle: "自备电厂部组织结构",
            search: "搜索姓名或岗位..."
        },
        meeting: {
            title: "会议",
            subtitle: "会议相关业务快捷入口",
            search: "搜索会议功能..."
        },
        daily: {
            title: "日报",
            subtitle: "日报相关业务入口",
            search: "搜索日报..."
        },
        roster: {
            title: "花名册",
            subtitle: "自备电厂部总名册",
            search: "搜索工号、姓名、岗位、职衔..."
        },
        notice: {
            title: "共享公告",
            subtitle: "所有人员可直接编辑的共享记事板",
            search: ""
        },
        admin: {
            title: "管理后台",
            subtitle: "月计划、花名册及公告历史管理",
            search: ""
        }
    };

    async function openPage(pageName) {
        const targetPage = document.getElementById(pageName + "-page");
        if (!targetPage) return;

        pages.forEach(function (page) {
            page.classList.remove("active-page");
        });

        targetPage.classList.add("active-page");

        menuItems.forEach(function (item) {
            item.classList.remove("active");
        });

        const currentMenu = document.querySelector(
            '.menu-item[data-page="' + pageName + '"]'
        );

        if (currentMenu) {
            currentMenu.classList.add("active");
        }

        const info = pageInformation[pageName];

        if (info) {
            pageTitle.textContent = info.title;
            pageSubtitle.textContent = info.subtitle;
            searchInput.placeholder = info.search;
        }

        if (searchBox) {
            searchBox.style.display =
                pageName === "notice" || pageName === "admin"
                    ? "none"
                    : "flex";
        }

        searchInput.value = "";
        resetSearch();

        if (pageName === "roster") {
            await loadRoster();
            applyRosterFilters();
        }

        if (pageName === "notice") {
            loadSharedNote();
        }

        if (pageName === "admin") {
            initializeAdminPage();
        }

        window.scrollTo(0, 0);
    }

    menuItems.forEach(function (item) {
        item.addEventListener("click", function () {
            openPage(this.getAttribute("data-page"));
        });
    });

    searchInput.addEventListener("input", function () {
        const activePage = document.querySelector(".page-section.active-page");
        if (!activePage) return;

        if (activePage.id === "roster-page") {
            applyRosterFilters();
            return;
        }

        const keyword = this.value.trim().toLowerCase();
        const searchableItems = activePage.querySelectorAll(".searchable");

        searchableItems.forEach(function (item) {
            const text = item.textContent.toLowerCase();

            if (text.includes(keyword)) {
                item.classList.remove("search-hidden");
            } else {
                item.classList.add("search-hidden");
            }
        });
    });

    function resetSearch() {
        document.querySelectorAll(".search-hidden").forEach(function (item) {
            item.classList.remove("search-hidden");
        });
    }


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
    // 月计划：云端链接
    // ========================================

    const monthPlanButton = document.getElementById("month-plan-button");
    const monthPlanModal = document.getElementById("month-plan-modal");
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

    async function openMonthPlanModal() {
        if (!monthPlanModal) return;

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

    async function initializeAdminPage() {
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

            adminPassword = "";
            sessionStorage.removeItem("powerPlantAdminPassword");
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
            loadMonthPlans(true),
            loadRoster(true)
        ]);

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
                sessionStorage.setItem("powerPlantAdminPassword", password);
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
            adminPassword = "";
            adminVerified = false;
            sessionStorage.removeItem("powerPlantAdminPassword");
            showAdminLogin();
        });
    }

    function adminFetch(url, options) {
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


    // ========================================
    // 管理后台标签
    // ========================================

    const adminTabs = document.querySelectorAll("[data-admin-tab]");
    const adminTabPanels = document.querySelectorAll(".admin-tab-panel");

    adminTabs.forEach(function (button) {
        button.addEventListener("click", function () {
            const name = this.getAttribute("data-admin-tab");

            adminTabs.forEach(function (item) {
                item.classList.remove("active");
            });

            adminTabPanels.forEach(function (panel) {
                panel.classList.remove("active");
            });

            this.classList.add("active");

            const panel = document.getElementById("admin-" + name + "-tab");

            if (panel) {
                panel.classList.add("active");
            }

            if (name === "month") {
                renderAdminMonthPlans();
            }

            if (name === "roster") {
                renderAdminRoster();
            }

            if (name === "history") {
                renderHistoryList(document.getElementById("admin-history-list"), true);
            }
        });
    });


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
        closeRosterEditor();
    });


    // 第一次打开网站
    openPage("home");
});
