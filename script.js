document.addEventListener("DOMContentLoaded", function () {

    const menuItems = document.querySelectorAll(".menu-item[data-page]");
    const pages = document.querySelectorAll(".page-section");
    const searchInput = document.getElementById("search");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");

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

        searchInput.value = "";
        resetSearch();

        if (pageName === "roster") {
            applyRosterFilters();
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

    openPage("home");
});
