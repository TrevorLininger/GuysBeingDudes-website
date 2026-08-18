/* =========================================================
   GBD FANTASY FOOTBALL
   LEAGUE RECORDS
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

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

const DATA_PATH = "data";


/* =========================================================
   ACTIVE MANAGERS
========================================================= */

/*
   These are PERMANENT manager IDs.

   Only these managers are allowed to appear
   in the league records.

   1  = Lake Johnson
   2  = Jim Joyner
   3  = Ryker Johnson
   4  = Hayden Jenkins
   5  = Cousins Lover
   6  = Trevor Lininger
   7  = Wes Summers
   8  = Kip Unruh
   9  = Justin Madsen
   10 = Gage Kiesling
   11 = Austin Chisam
   12 = Matt Bush
*/

const ACTIVE_MANAGER_IDS = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12
];


/* =========================================================
   PLAYOFF TEAMS BY SEASON
========================================================= */

/*
   IMPORTANT:

   These are SEASONAL TEAM IDs from each year's JSON.

   They are NOT permanent manager IDs.

   A manager counts as making the playoffs if their
   seasonal team ID appears in this year's list.
*/

const PLAYOFF_TEAM_IDS = {

    2017: [15, 14, 6, 10],

    2018: [14, 15, 2, 9],

    2019: [7, 5, 10, 6],

    2020: [6, 2, 7, 11, 13, 5],

    2021: [10, 3, 1, 6, 5, 7],

    2022: [10, 8, 9, 2, 7, 3],

    2023: [10, 9, 12, 6, 7, 1],

    2024: [1, 4, 12, 6, 2, 11],

    2025: [1, 2, 5, 6, 3, 4]

};


/* =========================================================
   CHAMPIONS
========================================================= */

/*
   PUT THE PERMANENT MANAGER ID OF EACH CHAMPION HERE.

   Example:

   2017: 10

   would mean Gage Kiesling won in 2017.

   If two managers are tied for most championships,
   BOTH will automatically be displayed.

   I have left these blank because I don't want to
   guess your historical champions.
*/

const CHAMPIONS = {

    2017: 15,
    2018: 14,
    2019: 5,
    2020: 2,
    2021: 10,
    2022: 10,
    2023: 9,
    2024: 1,
    2025: 1

};


/* =========================================================
   LOAD ALL SEASONS
========================================================= */

async function loadAllSeasons() {

    const seasonData = [];

    for (const year of SEASONS) {

        try {

            const response = await fetch(
                `${DATA_PATH}/${year}.json`
            );

            if (!response.ok) {

                throw new Error(
                    `Could not load ${year}.json`
                );

            }

            const data = await response.json();

            seasonData.push({

                year: year,

                data: data

            });

        } catch (error) {

            console.error(
                `Error loading ${year}:`,
                error
            );

        }

    }

    return seasonData;
}


/* =========================================================
   BUILD MANAGER DATABASE
========================================================= */

function buildManagerDatabase(seasonData) {

    const managers = {};

    seasonData.forEach(season => {

        const year = season.year;
        const data = season.data;

        if (!data.teams) {
            return;
        }

        data.teams.forEach(team => {

            const managerId =
                Number(team.managerId);

            /*
               Ignore former managers.
            */

            if (
                !ACTIVE_MANAGER_IDS.includes(
                    managerId
                )
            ) {

                return;

            }


            /*
               Create manager.
            */

            if (!managers[managerId]) {

                managers[managerId] = {

                    managerId: managerId,

                    name:
                        team.manager ||
                        team.name,

                    seasons: [],

                    careerWins: 0,

                    careerLosses: 0,

                    careerPoints: 0,

                    careerPointsAllowed: 0,

                    gamesPlayed: 0,

                    totalPointsFromGames: 0,

                    playoffAppearances: 0,

                    championships: 0

                };

            }


            /*
               Add season.
            */

            managers[managerId].seasons.push({

                year: year,

                teamId: Number(team.id),

                teamName: team.name,

                wins:
                    Number(team.wins) || 0,

                losses:
                    Number(team.losses) || 0,

                pointsFor:
                    Number(team.pointsFor) || 0,

                pointsAgainst: 0

            });


            /*
               Career totals.
            */

            managers[managerId].careerWins +=
                Number(team.wins) || 0;

            managers[managerId].careerLosses +=
                Number(team.losses) || 0;

            managers[managerId].careerPoints +=
                Number(team.pointsFor) || 0;

        });

    });


    return managers;
}


/* =========================================================
   FIND MANAGER FOR SEASONAL TEAM
========================================================= */

function findManagerForTeam(
    teams,
    teamId,
    managers
) {

    if (!teams) {
        return null;
    }

    const team = teams.find(
        t =>
            Number(t.id) ===
            Number(teamId)
    );

    if (!team) {
        return null;
    }

    const managerId =
        Number(team.managerId);

    if (
        !ACTIVE_MANAGER_IDS.includes(
            managerId
        )
    ) {

        return null;

    }

    return managers[managerId] || null;
}


/* =========================================================
   SINGLE GAME RECORDS
========================================================= */

function calculateSingleGameRecords(
    seasonData
) {

    let highest = null;

    let lowest = null;


    seasonData.forEach(season => {

        const year = season.year;
        const data = season.data;

        if (!data.matchups) {
            return;
        }


        data.matchups.forEach(matchup => {

            const awayScore =
                Number(matchup.awayScore);

            const homeScore =
                Number(matchup.homeScore);


            if (
                Number.isNaN(awayScore) ||
                Number.isNaN(homeScore)
            ) {

                return;

            }


            const awayManager =
                findManagerForTeam(
                    data.teams,
                    matchup.awayTeamId,
                    {}
                );

            const homeManager =
                findManagerForTeam(
                    data.teams,
                    matchup.homeTeamId,
                    {}
                );


            /*
               We can't use the above manager objects
               directly here because this function only
               needs to determine whether the seasonal
               team belongs to an ACTIVE manager.

               Check the seasonal team directly.
            */

            const awayTeam =
                data.teams?.find(
                    t =>
                        Number(t.id) ===
                        Number(matchup.awayTeamId)
                );

            const homeTeam =
                data.teams?.find(
                    t =>
                        Number(t.id) ===
                        Number(matchup.homeTeamId)
                );


            const awayActive =
                awayTeam &&
                ACTIVE_MANAGER_IDS.includes(
                    Number(awayTeam.managerId)
                );

            const homeActive =
                homeTeam &&
                ACTIVE_MANAGER_IDS.includes(
                    Number(homeTeam.managerId)
                );


            if (awayActive) {

                const game = {

                    score: awayScore,

                    teamName:
                        matchup.awayTeam,

                    managerName:
                        awayTeam.manager,

                    week:
                        matchup.week,

                    year:
                        year

                };


                if (
                    highest === null ||
                    game.score > highest.score
                ) {

                    highest = game;

                }


                if (
                    lowest === null ||
                    game.score < lowest.score
                ) {

                    lowest = game;

                }

            }


            if (homeActive) {

                const game = {

                    score: homeScore,

                    teamName:
                        matchup.homeTeam,

                    managerName:
                        homeTeam.manager,

                    week:
                        matchup.week,

                    year:
                        year

                };


                if (
                    highest === null ||
                    game.score > highest.score
                ) {

                    highest = game;

                }


                if (
                    lowest === null ||
                    game.score < lowest.score
                ) {

                    lowest = game;

                }

            }

        });

    });


    return {

        highest,

        lowest

    };
}


/* =========================================================
   CAREER PPG + POINTS ALLOWED
========================================================= */

function calculateCareerStats(
    managers,
    seasonData
) {

    Object.values(managers).forEach(
        manager => {

            manager.gamesPlayed = 0;

            manager.totalPointsFromGames = 0;

            manager.careerPointsAllowed = 0;

        }
    );


    seasonData.forEach(season => {

        const data = season.data;

        if (!data.matchups) {
            return;
        }


        data.matchups.forEach(matchup => {

            const awayScore =
                Number(matchup.awayScore);

            const homeScore =
                Number(matchup.homeScore);


            const awayManager =
                findManagerForTeam(
                    data.teams,
                    matchup.awayTeamId,
                    managers
                );

            const homeManager =
                findManagerForTeam(
                    data.teams,
                    matchup.homeTeamId,
                    managers
                );


            if (
                awayManager &&
                !Number.isNaN(awayScore) &&
                !Number.isNaN(homeScore)
            ) {

                awayManager.gamesPlayed++;

                awayManager.totalPointsFromGames +=
                    awayScore;

                awayManager.careerPointsAllowed +=
                    homeScore;

            }


            if (
                homeManager &&
                !Number.isNaN(homeScore) &&
                !Number.isNaN(awayScore)
            ) {

                homeManager.gamesPlayed++;

                homeManager.totalPointsFromGames +=
                    homeScore;

                homeManager.careerPointsAllowed +=
                    awayScore;

            }

        });

    });


    let bestPPG = null;


    Object.values(managers).forEach(
        manager => {

            if (
                manager.gamesPlayed === 0
            ) {

                return;

            }


            manager.careerPPG =
                manager.totalPointsFromGames /
                manager.gamesPlayed;


            if (
                bestPPG === null ||
                manager.careerPPG >
                bestPPG.careerPPG
            ) {

                bestPPG = manager;

            }

        }
    );


    return bestPPG;
}


/* =========================================================
   PLAYOFF APPEARANCES
========================================================= */

function calculatePlayoffAppearances(
    managers,
    seasonData
) {

    Object.values(managers).forEach(
        manager => {

            manager.playoffAppearances = 0;

        }
    );


    seasonData.forEach(season => {

        const year = season.year;

        const playoffTeams =
            PLAYOFF_TEAM_IDS[year] || [];


        playoffTeams.forEach(teamId => {

            const team =
                season.data.teams?.find(
                    t =>
                        Number(t.id) ===
                        Number(teamId)
                );


            if (!team) {
                return;
            }


            const managerId =
                Number(team.managerId);


            if (
                !ACTIVE_MANAGER_IDS.includes(
                    managerId
                )
            ) {

                return;

            }


            if (managers[managerId]) {

                managers[managerId]
                    .playoffAppearances++;

            }

        });

    });


    let highest = 0;


    Object.values(managers).forEach(
        manager => {

            highest = Math.max(
                highest,
                manager.playoffAppearances
            );

        }
    );


    return Object.values(managers)
        .filter(
            manager =>
                manager.playoffAppearances ===
                highest
        );
}


/* =========================================================
   CHAMPIONSHIPS
========================================================= */

function calculateChampionships(
    managers
) {

    Object.values(managers).forEach(
        manager => {

            manager.championships = 0;

        }
    );


    Object.values(CHAMPIONS).forEach(
        managerId => {

            if (
                managerId === null ||
                managerId === undefined
            ) {

                return;

            }


            const id =
                Number(managerId);


            if (
                managers[id]
            ) {

                managers[id].championships++;

            }

        }
    );


    let highest = 0;


    Object.values(managers).forEach(
        manager => {

            highest = Math.max(
                highest,
                manager.championships
            );

        }
    );


    return Object.values(managers)
        .filter(
            manager =>
                manager.championships ===
                highest
        );

}


/* =========================================================
   MOST CAREER WINS
========================================================= */

function calculateMostCareerWins(
    managers
) {

    const highest =
        Math.max(
            ...Object.values(managers)
                .map(
                    manager =>
                        manager.careerWins
                )
        );


    return Object.values(managers)
        .filter(
            manager =>
                manager.careerWins ===
                highest
        );

}


/* =========================================================
   MOST CAREER POINTS
========================================================= */

function calculateMostCareerPoints(
    managers
) {

    const highest =
        Math.max(
            ...Object.values(managers)
                .map(
                    manager =>
                        manager.careerPoints
                )
        );


    return Object.values(managers)
        .filter(
            manager =>
                manager.careerPoints ===
                highest
        );

}


/* =========================================================
   BEST SINGLE SEASON
========================================================= */

function calculateBestSeason(
    managers
) {

    let best = null;


    Object.values(managers).forEach(
        manager => {

            manager.seasons.forEach(
                season => {

                    const games =
                        season.wins +
                        season.losses;


                    if (games === 0) {
                        return;
                    }


                    const winPercentage =
                        season.wins /
                        games;


                    const result = {

                        manager: manager,

                        year:
                            season.year,

                        teamName:
                            season.teamName,

                        wins:
                            season.wins,

                        losses:
                            season.losses,

                        pointsFor:
                            season.pointsFor,

                        winPercentage:
                            winPercentage

                    };


                    if (
                        best === null ||
                        result.winPercentage >
                        best.winPercentage
                    ) {

                        best = result;

                        return;

                    }


                    if (
                        result.winPercentage ===
                        best.winPercentage &&
                        result.wins >
                        best.wins
                    ) {

                        best = result;

                        return;

                    }


                    if (
                        result.winPercentage ===
                        best.winPercentage &&
                        result.wins ===
                        best.wins &&
                        result.pointsFor >
                        best.pointsFor
                    ) {

                        best = result;

                    }

                }
            );

        }
    );


    return best;
}


/* =========================================================
   HIGHEST SCORING SINGLE SEASON
========================================================= */

function calculateHighestScoringSeason(
    managers
) {

    let highest = null;


    Object.values(managers).forEach(
        manager => {

            manager.seasons.forEach(
                season => {

                    if (
                        highest === null ||
                        season.pointsFor >
                        highest.pointsFor
                    ) {

                        highest = {

                            manager: manager,

                            year:
                                season.year,

                            teamName:
                                season.teamName,

                            pointsFor:
                                season.pointsFor

                        };

                    }

                }
            );

        }
    );


    return highest;
}


/* =========================================================
   MOST POINTS ALLOWED IN A SEASON
========================================================= */

function calculateMostPointsAllowedSeason(
    managers
) {

    let highest = null;


    Object.values(managers).forEach(
        manager => {

            manager.seasons.forEach(
                season => {

                    const pointsAllowed =
                        season.pointsAgainst;


                    if (
                        highest === null ||
                        pointsAllowed >
                        highest.pointsAllowed
                    ) {

                        highest = {

                            manager: manager,

                            year:
                                season.year,

                            teamName:
                                season.teamName,

                            pointsAllowed:
                                pointsAllowed

                        };

                    }

                }
            );

        }
    );


    return highest;
}


/* =========================================================
   FEWEST WINS IN A SEASON
========================================================= */

function calculateFewestWinsSeason(
    managers
) {

    let lowest = null;


    Object.values(managers).forEach(
        manager => {

            manager.seasons.forEach(
                season => {

                    if (
                        lowest === null ||
                        season.wins <
                        lowest.wins
                    ) {

                        lowest = {

                            manager: manager,

                            year:
                                season.year,

                            teamName:
                                season.teamName,

                            wins:
                                season.wins,

                            losses:
                                season.losses

                        };

                    }

                }
            );

        }
    );


    return lowest;
}


/* =========================================================
   CALCULATE POINTS ALLOWED BY SEASON
========================================================= */

function calculateSeasonPointsAllowed(
    managers,
    seasonData
) {

    seasonData.forEach(season => {

        const data = season.data;

        if (!data.matchups) {
            return;
        }


        const pointsAllowed = {};


        data.matchups.forEach(matchup => {

            const awayId =
                Number(matchup.awayTeamId);

            const homeId =
                Number(matchup.homeTeamId);

            const awayScore =
                Number(matchup.awayScore);

            const homeScore =
                Number(matchup.homeScore);


            if (
                !pointsAllowed[awayId]
            ) {

                pointsAllowed[awayId] = 0;

            }


            if (
                !pointsAllowed[homeId]
            ) {

                pointsAllowed[homeId] = 0;

            }


            if (
                !Number.isNaN(homeScore)
            ) {

                pointsAllowed[awayId] +=
                    homeScore;

            }


            if (
                !Number.isNaN(awayScore)
            ) {

                pointsAllowed[homeId] +=
                    awayScore;

            }

        });


        Object.values(managers).forEach(
            manager => {

                const managerSeason =
                    manager.seasons.find(
                        s =>
                            s.year ===
                            season.year
                    );


                if (!managerSeason) {
                    return;
                }


                const allowed =
                    pointsAllowed[
                        managerSeason.teamId
                    ];


                managerSeason.pointsAgainst =
                    allowed || 0;

            }
        );

    });

}


/* =========================================================
   FORMAT MANAGER NAMES
========================================================= */

function formatManagerNames(
    managers
) {

    if (!managers || managers.length === 0) {

        return "—";

    }


    return managers
        .map(
            manager =>
                manager.name
        )
        .join(" & ");

}


/* =========================================================
   DISPLAY RECORDS
========================================================= */

function displayRecords(
    records
) {

    /*
       Helper function.
    */

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                value;

        }

    }


    /* =====================================================
       1. MOST POINTS SINGLE GAME
    ===================================================== */

    if (records.singleGameRecords.highest) {

        const record =
            records.singleGameRecords.highest;

        setText(
            "most-points",
            record.score.toFixed(2)
        );

        setText(
            "most-points-holder",
            `${record.teamName} • ` +
            `${record.year} Week ${record.week}`
        );

    }


    /* =====================================================
       2. LOWEST POINTS SINGLE GAME
    ===================================================== */

    if (records.singleGameRecords.lowest) {

        const record =
            records.singleGameRecords.lowest;

        setText(
            "lowest-points",
            record.score.toFixed(2)
        );

        setText(
            "lowest-points-holder",
            `${record.teamName} • ` +
            `${record.year} Week ${record.week}`
        );

    }


    /* =====================================================
       3. HIGHEST CAREER PPG
    ===================================================== */

    if (records.highestPPG) {

        setText(
            "highest-career-ppg",
            records.highestPPG.careerPPG
                .toFixed(2)
        );

        setText(
            "highest-career-ppg-holder",
            records.highestPPG.name
        );

    }


    /* =====================================================
       4. MOST CAREER WINS
    ===================================================== */

    if (records.mostWins.length) {

        setText(
            "most-career-wins",
            records.mostWins[0]
                .careerWins
        );

        setText(
            "most-career-wins-holder",
            formatManagerNames(
                records.mostWins
            )
        );

    }


    /* =====================================================
       5. MOST CAREER POINTS
    ===================================================== */

    if (records.mostPoints.length) {

        setText(
            "most-career-points",
            Math.round(
                records.mostPoints[0]
                    .careerPoints
            ).toLocaleString()
        );

        setText(
            "most-career-points-holder",
            formatManagerNames(
                records.mostPoints
            )
        );

    }


    /* =====================================================
       6. BEST SINGLE SEASON
    ===================================================== */

    if (records.bestSeason) {

        setText(
            "best-season",
            `${records.bestSeason.wins}-` +
            `${records.bestSeason.losses}`
        );

        setText(
            "best-season-holder",
            `${records.bestSeason.manager.name} • ` +
            `${records.bestSeason.year}`
        );

    }


    /* =====================================================
       7. MOST CHAMPIONSHIPS
    ===================================================== */

    if (records.championships.length) {

        const count =
            records.championships[0]
                .championships;

        setText(
            "most-championships",
            count
        );

        setText(
            "most-championships-holder",
            formatManagerNames(
                records.championships
            )
        );

    }


    /* =====================================================
       8. PLAYOFF APPEARANCES
    ===================================================== */

    if (records.playoffAppearances.length) {

        const count =
            records.playoffAppearances[0]
                .playoffAppearances;

        setText(
            "playoff-appearances",
            count
        );

        setText(
            "playoff-appearances-holder",
            formatManagerNames(
                records.playoffAppearances
            )
        );

    }


    /* =====================================================
       9. HIGHEST SCORING SINGLE SEASON
    ===================================================== */

    if (records.highestScoringSeason) {

        const record =
            records.highestScoringSeason;

        setText(
            "highest-single-season",
            record.pointsFor
                .toFixed(2)
        );

        setText(
            "highest-single-season-holder",
            `${record.manager.name} • ` +
            `${record.year}`
        );

    }


    /* =====================================================
       10. MOST POINTS ALLOWED
    ===================================================== */

    if (records.mostPointsAllowedSeason) {

        const record =
            records.mostPointsAllowedSeason;

        setText(
            "most-points-allowed",
            record.pointsAllowed
                .toFixed(2)
        );

        setText(
            "most-points-allowed-holder",
            `${record.manager.name} • ` +
            `${record.year}`
        );

    }


    /* =====================================================
       11. FEWEST WINS
    ===================================================== */

    if (records.fewestWinsSeason) {

        const record =
            records.fewestWinsSeason;

        setText(
            "fewest-wins",
            record.wins
        );

        setText(
            "fewest-wins-holder",
            `${record.manager.name} • ` +
            `${record.year}`
        );

    }

}


/* =========================================================
   MAIN
========================================================= */

async function initializeRecords() {

    console.log(
        "Loading GBD records..."
    );


    const seasonData =
        await loadAllSeasons();


    if (
        seasonData.length === 0
    ) {

        console.error(
            "No season data could be loaded."
        );

        return;

    }


    console.log(
        `Loaded ${seasonData.length} seasons.`
    );


    /* =====================================================
       BUILD DATABASE
    ===================================================== */

    const managers =
        buildManagerDatabase(
            seasonData
        );


    /* =====================================================
       CALCULATE POINTS ALLOWED
    ===================================================== */

    calculateSeasonPointsAllowed(
        managers,
        seasonData
    );


    /* =====================================================
       CALCULATE RECORDS
    ===================================================== */

    const singleGameRecords =
        calculateSingleGameRecords(
            seasonData
        );


    const highestPPG =
        calculateCareerStats(
            managers,
            seasonData
        );


    const mostWins =
        calculateMostCareerWins(
            managers
        );


    const mostPoints =
        calculateMostCareerPoints(
            managers
        );


    const bestSeason =
        calculateBestSeason(
            managers
        );


    const championships =
        calculateChampionships(
            managers
        );


    const playoffAppearances =
        calculatePlayoffAppearances(
            managers,
            seasonData
        );


    const highestScoringSeason =
        calculateHighestScoringSeason(
            managers
        );


    const mostPointsAllowedSeason =
        calculateMostPointsAllowedSeason(
            managers
        );


    const fewestWinsSeason =
        calculateFewestWinsSeason(
            managers
        );


    /* =====================================================
       PACKAGE RECORDS
    ===================================================== */

    const records = {

        singleGameRecords,

        highestPPG,

        mostWins,

        mostPoints,

        bestSeason,

        championships,

        playoffAppearances,

        highestScoringSeason,

        mostPointsAllowedSeason,

        fewestWinsSeason

    };


    /* =====================================================
       DISPLAY
    ===================================================== */

    displayRecords(
        records
    );


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "GBD Records:",
        records
    );

    console.log(
        "Active managers:",
        managers
    );

}


/* =========================================================
   START
========================================================= */

initializeRecords();