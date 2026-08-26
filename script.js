document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ========================================
        // 找到左边菜单
        // ========================================

        const menuItems =
            document.querySelectorAll(
                ".menu-item[data-page]"
            );


        // 找到所有页面

        const pages =
            document.querySelectorAll(
                ".page-section"
            );


        // 搜索框

        const searchInput =
            document.getElementById(
                "search"
            );


        // 顶部标题

        const pageTitle =
            document.getElementById(
                "page-title"
            );


        const pageSubtitle =
            document.getElementById(
                "page-subtitle"
            );



        // ========================================
        // 每个页面的标题
        // ========================================

        const pageInformation = {


            home: {

                title:
                    "沙巴光伏自备电厂导航",

                subtitle:
                    "自备电厂部组织结构",

                search:
                    "搜索姓名或岗位..."

            },


            meeting: {

                title:
                    "会议",

                subtitle:
                    "会议相关业务快捷入口",

                search:
                    "搜索会议功能..."

            },


            daily: {

                title:
                    "日报",

                subtitle:
                    "日报相关业务入口",

                search:
                    "搜索日报..."

            },


            roster: {

                title:
                    "花名册",

                subtitle:
                    "部门人员信息",

                search:
                    "搜索人员..."

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


            if (!targetPage) {
                return;
            }



            // 所有页面先隐藏

            pages.forEach(
                function (page) {

                    page.classList.remove(
                        "active-page"
                    );

                }
            );



            // 显示当前页面

            targetPage.classList.add(
                "active-page"
            );



            // 左边所有按钮取消蓝色

            menuItems.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );



            // 当前按钮变蓝

            const currentMenu =
                document.querySelector(
                    '.menu-item[data-page="' +
                    pageName +
                    '"]'
                );


            if (currentMenu) {

                currentMenu.classList.add(
                    "active"
                );

            }



            // 修改顶部标题

            const info =
                pageInformation[
                    pageName
                ];


            if (info) {

                pageTitle.textContent =
                    info.title;


                pageSubtitle.textContent =
                    info.subtitle;


                searchInput.placeholder =
                    info.search;

            }



            // 清空搜索

            searchInput.value = "";


            resetSearch();


            // 回到顶部

            window.scrollTo(
                0,
                0
            );

        }



        // ========================================
        // 左边按钮点击
        // ========================================

        menuItems.forEach(
            function (item) {


                item.addEventListener(
                    "click",
                    function () {


                        const pageName =
                            this.getAttribute(
                                "data-page"
                            );


                        openPage(
                            pageName
                        );


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



                const searchableItems =
                    activePage.querySelectorAll(
                        ".searchable"
                    );


                searchableItems.forEach(
                    function (item) {


                        const text =
                            item
                                .textContent
                                .toLowerCase();


                        if (
                            text.includes(
                                keyword
                            )
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
        // 清除搜索
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
        // 网站打开默认主页
        // ========================================

        openPage(
            "home"
        );


    }
);
