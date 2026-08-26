document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ========================================
        // 找到网页元素
        // ========================================

        const menuItems =
            document.querySelectorAll(
                ".menu-item[data-page]"
            );


        const pageSections =
            document.querySelectorAll(
                ".page-section"
            );


        const openPageButtons =
            document.querySelectorAll(
                "[data-open-page]"
            );


        const searchInput =
            document.getElementById(
                "search"
            );


        const pageTitle =
            document.getElementById(
                "page-title"
            );


        const pageSubtitle =
            document.getElementById(
                "page-subtitle"
            );



        // ========================================
        // 每个页面标题
        // ========================================

        const pageInformation = {


            home: {

                title:
                    "沙巴光伏自备电厂导航",

                subtitle:
                    "部门常用业务统一入口",

                search:
                    "搜索人员或岗位..."

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
                    "自备电厂部人员及岗位信息",

                search:
                    "搜索人员或岗位..."

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



            // 隐藏所有页面

            pageSections.forEach(
                function (page) {

                    page.classList.remove(
                        "active-page"
                    );

                }
            );



            // 显示目标页面

            targetPage.classList.add(
                "active-page"
            );



            // 左边菜单取消 active

            menuItems.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );



            // 找到当前菜单

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



            // 修改顶部标题

            const information =
                pageInformation[
                    pageName
                ];


            if (information) {


                pageTitle.textContent =
                    information.title;


                pageSubtitle.textContent =
                    information.subtitle;


                searchInput.placeholder =
                    information.search;


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
        // 左边菜单点击
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
        // 页面里面的跳转按钮
        // 例如：查看完整花名册
        // ========================================

        openPageButtons.forEach(
            function (button) {


                button.addEventListener(
                    "click",
                    function () {


                        const pageName =
                            this.getAttribute(
                                "data-open-page"
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


                        } else {


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
        // 第一次打开网站
        // 默认主页
        // ========================================

        openPage(
            "home"
        );


    }
);
