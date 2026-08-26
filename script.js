document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // 获取元素
    // ========================================

    const menuItems =
        document.querySelectorAll(".menu-item[data-page]");

    const pageSections =
        document.querySelectorAll(".page-section");

    const moduleCards =
        document.querySelectorAll("[data-open-page]");

    const searchInput =
        document.getElementById("search");

    const pageTitle =
        document.getElementById("page-title");

    const pageSubtitle =
        document.getElementById("page-subtitle");


    // ========================================
    // 每个页面资料
    // ========================================

    const pageInfo = {

        home: {
            title: "沙巴光伏自备电厂导航",
            subtitle: "部门常用业务统一入口",
            placeholder: "搜索功能..."
        },

        meeting: {
            title: "会议",
            subtitle: "会议相关业务快捷入口",
            placeholder: "搜索会议功能..."
        },

        daily: {
            title: "日报",
            subtitle: "日报相关业务入口",
            placeholder: "搜索日报..."
        },

        roster: {
            title: "花名册",
            subtitle: "部门人员及岗位信息",
            placeholder: "搜索人员..."
        }

    };


    // ========================================
    // 打开页面
    // ========================================

    function openPage(pageName) {

        const targetPage =
            document.getElementById(
                pageName + "-page"
            );


        // 找不到页面就停止
        if (!targetPage) {

            console.error(
                "找不到页面：",
                pageName
            );

            return;

        }


        // -----------------------------
        // 隐藏全部页面
        // -----------------------------

        pageSections.forEach(
            function (section) {

                section.classList.remove(
                    "active-page"
                );

            }
        );


        // -----------------------------
        // 显示目标页面
        // -----------------------------

        targetPage.classList.add(
            "active-page"
        );


        // -----------------------------
        // 左边菜单 active
        // -----------------------------

        menuItems.forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


        const activeMenu =
            document.querySelector(
                '.menu-item[data-page="' +
                pageName +
                '"]'
            );


        if (activeMenu) {

            activeMenu.classList.add(
                "active"
            );

        }


        // -----------------------------
        // 修改顶部文字
        // -----------------------------

        const info =
            pageInfo[pageName];


        if (info) {

            pageTitle.textContent =
                info.title;

            pageSubtitle.textContent =
                info.subtitle;

            searchInput.placeholder =
                info.placeholder;

        }


        // 清除搜索
        searchInput.value = "";

        resetSearch();


        // 回到页面顶部
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }



    // ========================================
    // 左侧菜单
    // ========================================

    menuItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const page =
                        this.getAttribute(
                            "data-page"
                        );

                    openPage(page);

                }
            );

        }
    );



    // ========================================
    // 首页模块卡片
    // ========================================

    moduleCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const page =
                        this.getAttribute(
                            "data-open-page"
                        );

                    openPage(page);

                }
            );

        }
    );



    // ========================================
    // 搜索
    // ========================================

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            const activePage =
                document.querySelector(
                    ".page-section.active-page"
                );


            if (!activePage) {
                return;
            }


            const items =
                activePage.querySelectorAll(
                    ".searchable"
                );


            items.forEach(
                function (item) {

                    const text =
                        item
                            .textContent
                            .toLowerCase();


                    if (
                        text.includes(keyword)
                    ) {

                        item.classList.remove(
                            "search-hidden"
                        );

                    }

                    else {

                        item.classList.add(
                            "search-hidden"
                        );

                    }

                }
            );

        }
    );



    // ========================================
    // 清除搜索隐藏
    // ========================================

    function resetSearch() {

        document
            .querySelectorAll(
                ".search-hidden"
            )
            .forEach(
                function (item) {

                    item.classList.remove(
                        "search-hidden"
                    );

                }
            );

    }


    // ========================================
    // 默认打开主页
    // ========================================

    openPage("home");

});
