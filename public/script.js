document.addEventListener("DOMContentLoaded", function () {

    const menuItems = document.querySelectorAll(".menu-item[data-page]");
    const pages = document.querySelectorAll(".page-section");
    const searchInput = document.getElementById("search");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");
    const searchBox = document.querySelector(".search-box");

    const categoryButtons = document.querySelectorAll("[data-category-filter]");
    const statusButtons = document.querySelectorAll("[data-status-filter]");
    const rosterRows = document.querySelectorAll(".roster-row");
    const visibleCount = document.getElementById("visible-count");
    const rosterEmpty = document.getElementById("roster-empty");

    let currentCategory = "全部";
    let currentStatus = "全部";

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
        }
    };

    function openPage(pageName) {
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
            searchBox.style.display = pageName === "notice" ? "none" : "flex";
        }

        searchInput.value = "";
        resetSearch();

        if (pageName === "roster") {
            applyRosterFilters();
        }

        if (pageName === "notice") {
            loadSharedNote();
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

    function applyRosterFilters() {
        const keyword = searchInput.value.trim().toLowerCase();
        let count = 0;

        rosterRows.forEach(function (row) {
            const category = row.getAttribute("data-category");
            const status = row.getAttribute("data-status");
            const text = row.textContent.toLowerCase();

            const categoryMatch =
                currentCategory === "全部" || category === currentCategory;

            const statusMatch =
                currentStatus === "全部" || status === currentStatus;

            const keywordMatch =
                keyword === "" || text.includes(keyword);

            if (categoryMatch && statusMatch && keywordMatch) {
                row.style.display = "";
                count += 1;
            } else {
                row.style.display = "none";
            }
        });

        if (visibleCount) {
            visibleCount.textContent = count;
        }

        if (rosterEmpty) {
            rosterEmpty.style.display = count === 0 ? "block" : "none";
        }
    }

    function resetSearch() {
        document.querySelectorAll(".search-hidden").forEach(function (item) {
            item.classList.remove("search-hidden");
        });
    }



    // ========================================
    // 月计划：年份 / 月份选择
    // ========================================

    const monthPlanLinks = {
        "2026-08": "https://rjpl4x6x1094.jp.larksuite.com/sheets/Nj8msYUuWhUPQwt4bBWjKUkJpRd?sheet=0XXsMf"
    };

    const monthPlanButton = document.getElementById("month-plan-button");
    const monthPlanModal = document.getElementById("month-plan-modal");
    const monthPlanYear = document.getElementById("month-plan-year");
    const monthPlanGrid = document.getElementById("month-plan-grid");
    const monthModalCloseButtons = document.querySelectorAll("[data-month-modal-close]");

    function getMonthPlanYears() {
        const years = Object.keys(monthPlanLinks).map(function (key) {
            return key.split("-")[0];
        });

        return Array.from(new Set(years)).sort(function (a, b) {
            return Number(b) - Number(a);
        });
    }

    function prepareMonthPlanYears() {
        if (!monthPlanYear) return;

        const years = getMonthPlanYears();
        monthPlanYear.innerHTML = "";

        years.forEach(function (year) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year + "年";
            monthPlanYear.appendChild(option);
        });

        const currentYear = String(new Date().getFullYear());
        if (years.includes(currentYear)) {
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

    function openMonthPlanModal() {
        if (!monthPlanModal) return;

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

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && monthPlanModal && monthPlanModal.classList.contains("open")) {
            closeMonthPlanModal();
        }
    });


    // ========================================
    // 共享公告：所有人直接打字 + 自动保存
    // ========================================

    const sharedNoteEditor = document.getElementById("shared-note-editor");
    const sharedNoteStatus = document.getElementById("shared-note-status");
    const sharedNoteUpdated = document.getElementById("shared-note-updated");

    const sharedNoteApi = "/api/shared-note";
    const localPreviewKey = "power-plant-shared-note-preview";

    let sharedNoteLoaded = false;
    let sharedNoteDirty = false;
    let sharedNoteSaving = false;
    let sharedNoteSaveTimer = null;
    let sharedNoteCloudAvailable = false;
    let lastServerUpdatedAt = "";

    function setSharedNoteStatus(text, className) {
        if (!sharedNoteStatus) return;

        sharedNoteStatus.textContent = text;
        sharedNoteStatus.className = "note-status";

        if (className) {
            sharedNoteStatus.classList.add(className);
        }
    }

    function formatSharedNoteTime(value) {
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

        const text = formatSharedNoteTime(value);
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

            sharedNoteCloudAvailable = true;
            sharedNoteLoaded = true;
            lastServerUpdatedAt = data.updatedAt || "";

            if (document.activeElement !== sharedNoteEditor) {
                sharedNoteEditor.textContent = data.content || "";
            }

            setSharedNoteStatus("云端已同步", "is-saved");
            showSharedNoteUpdated(data.updatedAt);

        } catch (error) {
            sharedNoteCloudAvailable = false;
            sharedNoteLoaded = true;

            const localContent = localStorage.getItem(localPreviewKey);

            if (
                localContent !== null &&
                sharedNoteEditor.textContent.trim() === ""
            ) {
                sharedNoteEditor.textContent = localContent;
            }

            setSharedNoteStatus(
                "本机预览模式：尚未连接 Cloudflare 共享储存",
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

            sharedNoteCloudAvailable = true;
            lastServerUpdatedAt = data.updatedAt || "";
            localStorage.removeItem(localPreviewKey);

            setSharedNoteStatus("云端已保存", "is-saved");
            showSharedNoteUpdated(data.updatedAt);

        } catch (error) {
            sharedNoteCloudAvailable = false;

            localStorage.setItem(localPreviewKey, content);

            setSharedNoteStatus(
                "已保存在本机，尚未连接 Cloudflare 共享储存",
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
        }, 1200);
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

    // 每 10 秒读取一次云端最新内容。
    // 如果当前有人正在这台电脑输入，就不会覆盖正在输入的文字。
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


    openPage("home");
});
