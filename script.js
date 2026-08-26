// ========================================
// 沙巴光伏自备电厂导航
// 页面切换 + 搜索
// ========================================


document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ========================================
        // 找到网页里面需要控制的东西
        // ========================================

        const menuItems =
            document.querySelectorAll(
                ".menu-item[data-page]"
            );


        const pageSections =
            document.querySelectorAll(
                ".page-section"
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
        // 每个页面的顶部标题
        // ========================================

        const pageInformation = {


            // 主页

            home: {

                title:
                    "沙巴光伏自备电厂导航",

                subtitle:
                    "部门常用业务统一入口",

                search:
                    "搜索功能..."

            },


            // 会议

            meeting: {

                title:
                    "会议",

                subtitle:
                    "会议相关业务快捷入口",

                search:
                    "搜索会议功能..."

            },


            // 日报

            daily: {

                title:
                    "日报",

                subtitle:
                    "日报相关业务入口",

                search:
                    "搜索日报..."

            },


            // 花名册

            roster: {

                title:
                    "花名册",

                subtitle:
                    "部门人员及岗位信息",

                search:
                    "搜索人员..."

            }


        };



        // ========================================
        // 打开指定页面
        // ========================================

        function openPage(pageName) {


            // 找到要显示的页面

            const targetPage =
                document.getElementById(
                    pageName + "-page"
                );


            // 如果找不到页面就停止

            if (!targetPage) {

                return;

            }



            // ====================================
            // 第一步
            // 把所有页面隐藏
            // ====================================

            pageSections.forEach(
                function (page) {

                    page.classList.remove(
                        "active-page"
                    );

                }
            );



            // ====================================
            // 第二步
            // 只显示用户点击的页面
            // ====================================

            targetPage.classList.add(
                "active-page"
            );



            // ====================================
            // 第三步
            // 左边菜单取消蓝色
            // ====================================

            menuItems.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );



            // ====================================
            // 第四步
            // 当前菜单变蓝
            // ====================================

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



            // ====================================
            // 第五步
            // 修改右边顶部标题
            // ====================================

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



            // ====================================
            // 第六步
            // 清除之前输入的搜索文字
            // ====================================

            searchInput.value = "";


            resetSearch();


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
        // 搜索框
        // ========================================

        searchInput.addEventListener(
            "input",
            function () {


                const keyword =
                    this.value
                        .trim()
                        .toLowerCase();



                // 找到现在正在显示的页面

                const activePage =
                    document.querySelector(
                        ".page-section.active-page"
                    );


                if (!activePage) {

                    return;

                }



                // 只搜索当前页面里面
                // 有 searchable 的项目

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


            const hiddenItems =
                document.querySelectorAll(
                    ".search-hidden"
                );


            hiddenItems.forEach(
                function (item) {


                    item.classList.remove(
                        "search-hidden"
                    );


                }
            );


        }



        // ========================================
        // 网站第一次打开
        //
        // 强制进入主页
        // ========================================

        openPage(
            "home"
        );


    }
);
