console.log("MANAGERS JS LOADED");


// ============================================================
// LOAD MANAGERS + CHAMPIONSHIP HISTORY
// ============================================================

Promise.all([

    fetch("data/managers.json")
        .then(response => response.json()),

    fetch("data/champions.json")
        .then(response => response.json())

])

    .then(([managers, champions]) => {

        console.log(
            "MANAGERS DATA:",
            managers
        );

        console.log(
            "CHAMPIONS DATA:",
            champions
        );


        const container =
            document.getElementById(
                "managers-container"
            );


        // ====================================================
        // BUILD EACH MANAGER CARD
        // ====================================================

        managers.forEach(manager => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "manager-page-card";


            // =================================================
            // FIND ALL TOP-3 FINISHES FOR THIS MANAGER
            // =================================================

            const finishes = [];


            Object.entries(champions).forEach(
                ([year, results]) => {

                    const managerId =
                        Number(
                            manager.managerId
                        );


                    if (
                        Number(results.first) ===
                        managerId
                    ) {

                        finishes.push({

                            year: year,

                            place: 1

                        });

                    }


                    else if (
                        Number(results.second) ===
                        managerId
                    ) {

                        finishes.push({

                            year: year,

                            place: 2

                        });

                    }


                    else if (
                        Number(results.third) ===
                        managerId
                    ) {

                        finishes.push({

                            year: year,

                            place: 3

                        });

                    }

                }
            );


            // =================================================
            // BUILD FINISH DISPLAY
            // =================================================

            const championshipHTML =
                finishes.length > 0

                    ? `

                        <div class="manager-trophies">

                            ${finishes
                                .map(
                                    finish => {

                                        let trophy = "";

                                        let label = "";


                                        if (
                                            finish.place === 1
                                        ) {

                                            trophy = "trophy-gold.png";

                                            label =
                                                "Champion";

                                        }

                                        else if (
                                            finish.place === 2
                                        ) {

                                            trophy = "trophy-silver.png";

                                            label =
                                                "Runner-Up";

                                        }

                                        else {

                                            trophy = "trophy-bronze.png";

                                            label =
                                                "Third Place";

                                        }


                                        return `

                                            <div
                                                class="manager-trophy"
                                                title="${label} - ${finish.year}"
                                            >

                                                <img
                                                    class="manager-trophy"
                                                    src="images/${trophy}"
                                                    alt="${label}"
                                                >

                                                <span
                                                    class="championship-year"
                                                >
                                                    ${finish.year}
                                                </span>

                                            </div>

                                        `;

                                    }
                                )
                                .join("")
                            }

                        </div>

                    `

                    : "";


            // =================================================
            // BUILD CARD
            // =================================================

            card.innerHTML = `

                <img
                    src="images/${manager.image}"
                    alt="${manager.managerName}"
                >

                <div class="manager-page-card-info">

                    <h2>
                        ${manager.managerName}
                    </h2>

                    <p>
                        ${manager.teamName}
                    </p>

                    ${championshipHTML}

                </div>

            `;


            // =================================================
            // MAKE CARD CLICKABLE
            // =================================================

            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `manager.html?id=${manager.managerId}`;

                }
            );


            container.appendChild(
                card
            );

        });

    })

    .catch(error => {

        console.error(
            "ERROR LOADING MANAGER DATA:",
            error
        );

    });