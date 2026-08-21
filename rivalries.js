console.log("RIVALRIES JS LOADED");


// ============================================================
// SETTINGS
// ============================================================

const SEASONS = [
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
    2025
];


// ============================================================
// PLAYOFF WEEKS
// ============================================================

const PLAYOFF_WEEKS = {

    2017: [14, 15, 16, 17],

    2018: [14, 15],

    2019: [14, 15],

    2020: [14, 15, 16],

    2021: [15, 16, 17],

    2022: [15, 16, 17],

    2023: [15, 16, 17],

    2024: [15, 16, 17],

    2025: [15, 16, 17]

};


// ============================================================
// PLAYOFF MANAGERS
//
// These are permanent managerId values.
// ============================================================

const PLAYOFF_MANAGERS = {

    2017: [15, 14, 6, 10],

    2018: [14, 15, 2, 9],

    2019: [7, 5, 10, 6],

    2020: [6, 2, 7, 11, 13, 5],

    2021: [10, 3, 1, 6, 5, 7],

    2022: [10, 8, 9, 2, 7, 3],

    2023: [10, 9, 12, 6, 7, 1],

    2024: [1, 4, 12, 6],

    2025: [1, 2, 5, 6, 3, 4]

};


// ============================================================
// LOAD DATA
// ============================================================

Promise.all([

    // --------------------------------------------------------
    // RIVALRIES
    // --------------------------------------------------------

    fetch("data/rivalries.json")
        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Could not load rivalries.json"
                );

            }

            return response.json();

        }),


    // --------------------------------------------------------
    // MANAGERS
    // --------------------------------------------------------

    fetch("data/managers.json")
        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Could not load managers.json"
                );

            }

            return response.json();

        }),


    // --------------------------------------------------------
    // SEASON DATA
    // --------------------------------------------------------

    ...SEASONS.map(year =>

        fetch(`data/${year}.json`)
            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        `Could not load ${year}.json`
                    );

                }

                return response.json();

            })

    )

])

.then(data => {

    const rivalries =
        data[0];

    const managers =
        data[1];

    const seasonData =
        data.slice(2);


    console.log(
        "RIVALRIES DATA:",
        rivalries
    );

    console.log(
        "MANAGERS DATA:",
        managers
    );

    console.log(
        "SEASON DATA LOADED:",
        seasonData.length
    );


    buildRivalries(
        rivalries,
        managers,
        seasonData
    );

})

.catch(error => {

    console.error(
        "ERROR LOADING RIVALRIES:",
        error
    );

});


// ============================================================
// BUILD RIVALRIES
// ============================================================

function buildRivalries(
    rivalries,
    managers,
    seasonData
) {

    const container =
        document.getElementById(
            "rivalries-container"
        );


    if (!container) {

        console.error(
            "Could not find #rivalries-container"
        );

        return;

    }


    // ========================================================
    // CREATE MANAGER LOOKUP
    // ========================================================

    const managerMap =
        new Map();


    managers.forEach(manager => {

        managerMap.set(
            Number(manager.managerId),
            manager
        );

    });


    // ========================================================
    // BUILD EACH RIVALRY
    // ========================================================

    rivalries.forEach(rivalry => {

        const manager1Id =
            Number(
                rivalry.manager1
            );


        const manager2Id =
            Number(
                rivalry.manager2
            );


        const manager1 =
            managerMap.get(
                manager1Id
            );


        const manager2 =
            managerMap.get(
                manager2Id
            );


        // ----------------------------------------------------
        // MAKE SURE MANAGERS EXIST
        // ----------------------------------------------------

        if (!manager1) {

            console.error(
                `Could not find manager ${manager1Id} ` +
                `for rivalry "${rivalry.name}"`
            );

            return;

        }


        if (!manager2) {

            console.error(
                `Could not find manager ${manager2Id} ` +
                `for rivalry "${rivalry.name}"`
            );

            return;

        }


        // ====================================================
        // CALCULATE RIVALRY STATS
        // ====================================================

        const stats =
            calculateRivalryStats(
                manager1Id,
                manager2Id,
                seasonData
            );


        // ====================================================
        // CREATE CARD
        // ====================================================

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "rivalry-card";


        card.innerHTML = `

            <!-- ============================================
                 RIVALRY TITLE
            ============================================= -->

            <div class="rivalry-card-title">

                <h2>
                    ${rivalry.name}
                </h2>

            </div>


            <!-- ============================================
                 MAIN RIVALRY AREA
            ============================================= -->

            <div class="rivalry-main">


                <!-- ========================================
                     MANAGER 1
                ========================================= -->

                <div class="
                    rivalry-manager
                    rivalry-manager-left
                ">

                    <img
                        src="images/${manager1.image}"
                        alt="${manager1.managerName}"
                        class="rivalry-manager-image"
                    >


                    <h3>
                        ${manager1.teamName}
                    </h3>


                    <p class="rivalry-manager-name">
                        ${manager1.managerName}
                    </p>


                    <div class="rivalry-manager-stats">


                        <div class="rivalry-stat">

                            <span class="stat-label">
                                Wins
                            </span>

                            <span class="stat-value">
                                ${stats.manager1.wins}
                            </span>

                        </div>


                        <div class="rivalry-stat">

                            <span class="stat-label">
                                Avg. Points
                            </span>

                            <span class="stat-value">
                                ${stats.manager1.averagePoints}
                            </span>

                        </div>


                        <div class="rivalry-stat">

                            <span class="stat-label">
                                High Score
                            </span>

                            <span class="stat-value">
                                ${stats.manager1.highScore}
                            </span>

                        </div>


                    </div>

                </div>



                <!-- ========================================
                     CENTER
                ========================================= -->

                <div class="rivalry-center">


                    <div class="rivalry-trophy">

                        <img
                            src="images/trophy.png"
                            alt="Trophy"
                        >

                    </div>


                    <!-- OVERALL RECORD -->

                    <div class="rivalry-overall-record">

                        <span class="record">

                            ${stats.manager1.wins}
                            -
                            ${stats.manager2.wins}

                            ${
                                stats.ties > 0
                                    ? `-${stats.ties}`
                                    : ""
                            }

                        </span>


                        <span class="record-label">
                            ALL-TIME RECORD
                        </span>

                    </div>


                    <!-- PLAYOFFS -->

                    <div class="rivalry-playoffs">

                        <span class="playoff-title">
                            PLAYOFF MATCHUPS
                        </span>


                        <span class="playoff-count">
                            ${stats.playoff.meetings}
                        </span>


                        <span class="playoff-record">

                            ${stats.playoff.manager1Wins}
                            -
                            ${stats.playoff.manager2Wins}

                            ${
                                stats.playoff.ties > 0
                                    ? `-${stats.playoff.ties}`
                                    : ""
                            }

                        </span>
                        <span class="playoff-leader">
                        ${
                            stats.playoff.manager1Wins >
                            stats.playoff.manager2Wins
                                ? `${manager1.managerName} leads`
                                : stats.playoff.manager2Wins >
                                stats.playoff.manager1Wins
                                    ? `${manager2.managerName} leads`
                                    : "Tied"
                        }
                        </span>

                    </div>


                </div>



                <!-- ========================================
                     MANAGER 2
                ========================================= -->

                <div class="
                    rivalry-manager
                    rivalry-manager-right
                ">


                    <img
                        src="images/${manager2.image}"
                        alt="${manager2.managerName}"
                        class="rivalry-manager-image"
                    >


                    <h3>
                        ${manager2.teamName}
                    </h3>


                    <p class="rivalry-manager-name">
                        ${manager2.managerName}
                    </p>


                    <div class="rivalry-manager-stats">


                        <div class="rivalry-stat">

                            <span class="stat-label">
                                Wins
                            </span>

                            <span class="stat-value">
                                ${stats.manager2.wins}
                            </span>

                        </div>


                        <div class="rivalry-stat">

                            <span class="stat-label">
                                Avg. Points
                            </span>

                            <span class="stat-value">
                                ${stats.manager2.averagePoints}
                            </span>

                        </div>


                        <div class="rivalry-stat">

                            <span class="stat-label">
                                High Score
                            </span>

                            <span class="stat-value">
                                ${stats.manager2.highScore}
                            </span>

                        </div>


                    </div>


                </div>


            </div>



            <!-- ============================================
                 RIVALRY WRITE-UP
            ============================================= -->

            <div class="rivalry-story">

                <p>
                    ${rivalry.description}
                </p>

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


// ============================================================
// CALCULATE RIVALRY STATS
// ============================================================

function calculateRivalryStats(
    manager1Id,
    manager2Id,
    seasonData
) {

    const stats = {

        meetings: 0,

        manager1: {

            wins: 0,

            averagePoints: 0,

            highScore: 0,

            totalPoints: 0

        },

        manager2: {

            wins: 0,

            averagePoints: 0,

            highScore: 0,

            totalPoints: 0

        },

        ties: 0,

        playoff: {

            meetings: 0,

            manager1Wins: 0,

            manager2Wins: 0,

            ties: 0

        }

    };


    // ========================================================
    // LOOP THROUGH EACH SEASON
    // ========================================================

    seasonData.forEach(
        (data, index) => {

            if (!data) {

                return;

            }


            const season =
                SEASONS[index];


            const teams =
                Array.isArray(
                    data.teams
                )
                    ? data.teams
                    : [];


            const matchups =
                Array.isArray(
                    data.matchups
                )
                    ? data.matchups
                    : [];


            // ------------------------------------------------
            // MAP ESPN TEAM ID → PERMANENT MANAGER ID
            // ------------------------------------------------

            const teamMap =
                new Map();


            teams.forEach(team => {

                teamMap.set(
                    Number(team.id),
                    Number(team.managerId)
                );

            });


            // ------------------------------------------------
            // CHECK EVERY MATCHUP
            // ------------------------------------------------

            matchups.forEach(
                matchup => {

                    const awayManagerId =
                        teamMap.get(
                            Number(
                                matchup.awayTeamId
                            )
                        );


                    const homeManagerId =
                        teamMap.get(
                            Number(
                                matchup.homeTeamId
                            )
                        );


                    // ----------------------------------------
                    // ONLY CONTINUE IF THIS IS OUR RIVALRY
                    // ----------------------------------------

                    const rivalryMatchup =

                        (
                            awayManagerId === manager1Id &&
                            homeManagerId === manager2Id
                        )

                        ||

                        (
                            awayManagerId === manager2Id &&
                            homeManagerId === manager1Id
                        );


                    if (
                        !rivalryMatchup
                    ) {

                        return;

                    }


                    // ----------------------------------------
                    // GET SCORES
                    // ----------------------------------------

                    const awayScore =
                        Number(
                            matchup.awayScore
                        );


                    const homeScore =
                        Number(
                            matchup.homeScore
                        );


                    if (
                        Number.isNaN(
                            awayScore
                        )
                        ||
                        Number.isNaN(
                            homeScore
                        )
                    ) {

                        return;

                    }


                    // ----------------------------------------
                    // PUT SCORES IN CORRECT ORDER
                    // ----------------------------------------

                    let manager1Score;
                    let manager2Score;


                    if (
                        awayManagerId === manager1Id
                    ) {

                        manager1Score =
                            awayScore;

                        manager2Score =
                            homeScore;

                    }

                    else {

                        manager1Score =
                            homeScore;

                        manager2Score =
                            awayScore;

                    }


                    // ----------------------------------------
                    // TOTAL MEETINGS
                    // ----------------------------------------

                    stats.meetings++;


                    // ----------------------------------------
                    // TOTAL POINTS
                    // ----------------------------------------

                    stats.manager1.totalPoints +=
                        manager1Score;


                    stats.manager2.totalPoints +=
                        manager2Score;


                    // ----------------------------------------
                    // HIGH SCORES
                    // ----------------------------------------

                    stats.manager1.highScore =
                        Math.max(
                            stats.manager1.highScore,
                            manager1Score
                        );


                    stats.manager2.highScore =
                        Math.max(
                            stats.manager2.highScore,
                            manager2Score
                        );


                    // ----------------------------------------
                    // OVERALL RECORD
                    // ----------------------------------------

                    if (
                        manager1Score >
                        manager2Score
                    ) {

                        stats.manager1.wins++;

                    }

                    else if (
                        manager2Score >
                        manager1Score
                    ) {

                        stats.manager2.wins++;

                    }

                    else {

                        stats.ties++;

                    }


                    // ----------------------------------------
                    // PLAYOFF STATUS
                    // ----------------------------------------

                    const playoff =
                        isPlayoffMatchup(
                            season,
                            Number(
                                matchup.week
                            ),
                            manager1Id,
                            manager2Id
                        );


                    if (playoff) {

                        stats.playoff.meetings++;


                        if (
                            manager1Score >
                            manager2Score
                        ) {

                            stats.playoff.manager1Wins++;

                        }

                        else if (
                            manager2Score >
                            manager1Score
                        ) {

                            stats.playoff.manager2Wins++;

                        }

                        else {

                            stats.playoff.ties++;

                        }

                    }

                }
            );

        }
    );


    // ========================================================
    // CALCULATE AVERAGE POINTS
    // ========================================================

    if (
        stats.meetings > 0
    ) {

        stats.manager1.averagePoints =
            round(
                stats.manager1.totalPoints /
                stats.meetings
            );


        stats.manager2.averagePoints =
            round(
                stats.manager2.totalPoints /
                stats.meetings
            );

    }


    return stats;

}


// ============================================================
// DETERMINE TRUE PLAYOFF MATCHUP
// ============================================================

function isPlayoffMatchup(
    season,
    week,
    manager1Id,
    manager2Id
) {

    // --------------------------------------------------------
    // MAKE SURE SEASON EXISTS
    // --------------------------------------------------------

    if (
        !PLAYOFF_WEEKS[season]
    ) {

        return false;

    }


    // --------------------------------------------------------
    // MAKE SURE WEEK IS A PLAYOFF WEEK
    // --------------------------------------------------------

    if (
        !PLAYOFF_WEEKS[season].includes(
            week
        )
    ) {

        return false;

    }


    // --------------------------------------------------------
    // GET PLAYOFF MANAGERS
    // --------------------------------------------------------

    const playoffManagers =
        PLAYOFF_MANAGERS[season] || [];


    // --------------------------------------------------------
    // BOTH MANAGERS MUST HAVE MADE PLAYOFFS
    // --------------------------------------------------------

    return (

        playoffManagers.includes(
            manager1Id
        )

        &&

        playoffManagers.includes(
            manager2Id
        )

    );

}


// ============================================================
// ROUND NUMBER
// ============================================================

function round(
    number,
    decimals = 1
) {

    return Number(
        Number(number).toFixed(
            decimals
        )
    );

}