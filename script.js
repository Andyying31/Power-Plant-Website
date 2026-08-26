document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================
           首页搜索
        ====================================== */

        const homeSearch =
            document.getElementById(
                "searchInput"
            );


        if (homeSearch) {

            const cards =
                document.querySelectorAll(
                    ".link-card"
                );


            homeSearch.addEventListener(
                "input",
                function () {

                    const keyword =
                        this.value
                            .trim()
                            .toLowerCase();


                    cards.forEach(
                        function (card) {

                            const text =
                                card
                                    .textContent
                                    .toLowerCase();


                            if (
                                text.includes(
                                    keyword
                                )
                            ) {

                                card.style.display =
                                    "";

                            } else {

                                card.style.display =
                                    "none";

                            }

                        }
                    );

                }
            );

        }



        /* =====================================
           组织架构搜索
        ====================================== */

        const organizationSearch =
            document.getElementById(
                "organizationSearch"
            );


        if (organizationSearch) {

            const people =
                document.querySelectorAll(
                    ".searchable-person"
                );


            organizationSearch.addEventListener(
                "input",
                function () {

                    const keyword =
                        this.value
                            .trim()
                            .toLowerCase();


                    people.forEach(
                        function (person) {

                            const searchText =
                                (
                                    person.dataset.search ||
                                    person.textContent
                                ).toLowerCase();


                            if (
                                searchText.includes(
                                    keyword
                                )
                            ) {

                                person.classList.remove(
                                    "search-hidden"
                                );

                            } else {

                                person.classList.add(
                                    "search-hidden"
                                );

                            }

                        }
                    );

                }
            );

        }

    }
);
