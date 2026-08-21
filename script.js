// ========================================
// 沙巴光伏自备电厂导航
// 搜索功能
// ========================================

const searchInput =
    document.getElementById("search");


const linkCards =
    document.querySelectorAll(".link-card");


searchInput.addEventListener(
    "input",
    function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        linkCards.forEach(
            function (card) {

                const text =
                    card.textContent
                        .toLowerCase();


                if (
                    text.includes(keyword)
                ) {

                    card.style.display =
                        "flex";

                } else {

                    card.style.display =
                        "none";

                }

            }
        );

    }
);