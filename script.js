// ========================================
// 沙巴光伏自备电厂导航
// 页面切换 + 搜索
// ========================================


const menuItems =
    document.querySelectorAll(".menu-item");


const meetingPage =
    document.getElementById("meeting-page");


const organizationPage =
    document.getElementById("organization-page");


const searchInput =
    document.getElementById("search");


const pageDescription =
    document.getElementById("page-description");



// ========================================
// 左侧菜单切换
// ========================================

menuItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                const page =
                    this.dataset.page;


                // -------------------------
                // 清除 active
                // -------------------------

                menuItems.forEach(
                    function (menu) {

                        menu.classList.remove(
                            "active"
                        );

                    }
                );


                // 当前菜单 active

                this.classList.add(
                    "active"
                );



                // -------------------------
                // 切换页面
                // -------------------------

                if (page === "meeting") {

                    meetingPage.style.display =
                        "block";


                    organizationPage.style.display =
                        "none";


                    pageDescription.textContent =
                        "常用业务系统快捷入口";


                    searchInput.placeholder =
                        "搜索功能...";


                }


                else if (
                    page === "organization"
                ) {

                    meetingPage.style.display =
                        "none";


                    organizationPage.style.display =
                        "block";


                    pageDescription.textContent =
                        "自备电厂部组织结构";


                    searchInput.placeholder =
                        "搜索姓名或岗位...";

                }



                // -------------------------
                // 切换页面时清空搜索
                // -------------------------

                searchInput.value = "";


                resetSearch();

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
                .toLowerCase()
                .trim();


        // 当前是会议

        if (
            meetingPage.style.display !== "none"
        ) {

            const cards =
                document.querySelectorAll(
                    "#meeting-links .link-card"
                );


            cards.forEach(
                function (card) {

                    const text =
                        card.textContent
                            .toLowerCase();


                    if (
                        text.includes(keyword)
                    ) {

                        card.style.display =
                            "flex";

                    }

                    else {

                        card.style.display =
                            "none";

                    }

                }
            );

        }



        // 当前是组织架构

        else {

            const cards =
                document.querySelectorAll(
                    "#organization-page .organization-card"
                );


            cards.forEach(
                function (card) {

                    const text =
                        card.textContent
                            .toLowerCase();


                    if (
                        text.includes(keyword)
                    ) {

                        card.style.display =
                            "";

                    }

                    else {

                        card.style.display =
                            "none";

                    }

                }
            );

        }

    }
);



// ========================================
// 清除搜索结果
// ========================================

function resetSearch() {


    const meetingCards =
        document.querySelectorAll(
            "#meeting-links .link-card"
        );


    meetingCards.forEach(
        function (card) {

            card.style.display =
                "flex";

        }
    );



    const organizationCards =
        document.querySelectorAll(
            "#organization-page .organization-card"
        );


    organizationCards.forEach(
        function (card) {

            card.style.display =
                "";

        }
    );

}
