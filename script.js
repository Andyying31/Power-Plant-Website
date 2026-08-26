// ========================================
// 沙巴光伏自备电厂导航
// ========================================


// ========================================
// 页面切换
// ========================================

const menuItems =
    document.querySelectorAll(".menu-item");


const meetingPage =
    document.getElementById("meeting-page");


const organizationPage =
    document.getElementById("organization-page");


menuItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                // 移除所有 active

                menuItems.forEach(
                    function (menu) {

                        menu.classList.remove(
                            "active"
                        );

                    }
                );


                // 当前菜单添加 active

                this.classList.add("active");


                // 获取页面名称

                const page =
                    this.dataset.page;


                // 显示会议

                if (page === "meeting") {

                    meetingPage.classList.remove(
                        "hidden"
                    );

                    organizationPage.classList.add(
                        "hidden"
                    );

                }


                // 显示组织架构

                if (
                    page === "organization"
                ) {

                    meetingPage.classList.add(
                        "hidden"
                    );

                    organizationPage.classList.remove(
                        "hidden"
                    );

                }


                // 切换页面时清空搜索

                searchInput.value = "";

                resetSearch();

            }

        );

    }
);



// ========================================
// 搜索功能
// ========================================

const searchInput =
    document.getElementById("search");


const searchableItems =
    document.querySelectorAll(
        ".searchable, .person-card"
    );



searchInput.addEventListener(
    "input",
    function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        searchableItems.forEach(
            function (item) {

                const text =
                    item.textContent
                        .toLowerCase();


                if (
                    text.includes(keyword)
                ) {

                    item.style.display = "";

                } else {

                    item.style.display = "none";

                }

            }
        );

    }
);



// ========================================
// 清除搜索
// ========================================

function resetSearch() {

    searchableItems.forEach(
        function (item) {

            item.style.display = "";

        }
    );

}
