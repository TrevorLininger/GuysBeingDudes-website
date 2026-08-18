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


/*
   Change this ONLY if your JSON files live somewhere else.

   Example:
   data/2025.json

   would mean:

   const DATA_PATH = "data";
*/

const DATA_PATH = "data";


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

            const managerId = team.managerId;

            if (managerId === undefined || managerId === null) {
                return;
            }


            /* Create manager if we haven't seen them yet */

            if (!managers[managerId]) {

                managers[managerId] = {

                    managerId: managerId,

                    name: team.manager || team.name,

                    seasons: [],

                    careerWins: 0,

                    careerLosses: 0,

                    careerPoints: 0,

                    gamesPlayed: 0,

                    totalPointsFromGames: 0

                };

            }


            /* Add season information */

            managers[managerId].seasons.push({

                year: year,

                teamId: team.id,

                teamName: team.name,

                wins: Number(team.wins) || 0,

                losses: Number(team.losses) || 0,

                pointsFor: Number(team.pointsFor) || 0

            });


            /* Career totals */

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
   SINGLE GAME RECORDS
========================================================= */

function calculateSingleGameRecords(seasonData) {

    let highest = null;
    let lowest = null;


    seasonData.forEach(season => {

        const year = season.year;
        const data = season.data;

        if (!data.matchups) {
            return;
        }


        data.matchups.forEach(matchup => {

            const awayScore = Number(matchup.awayScore);
            const homeScore = Number(matchup.homeScore);


            /* Ignore malformed matchups */

            if (
                Number.isNaN(awayScore) ||
                Number.isNaN(homeScore)
            ) {
                return;
            }


            /* =========================
               AWAY TEAM
            ========================= */

            const awayGame = {

                score: awayScore,

                teamName: matchup.awayTeam,

                week: matchup.week,

                year: year

            };


            /* =========================
               HOME TEAM
            ========================= */

            const homeGame = {

                score: homeScore,

                teamName: matchup.homeTeam,

                week: matchup.week,

                year: year

            };


            /* Highest */

            if (
                highest === null ||
                awayGame.score > highest.score
            ) {

                highest = awayGame;

            }

            if (
                homeGame.score > highest.score
            ) {

                highest = homeGame;

            }


            /* Lowest */

            if (
                lowest === null ||
                awayGame.score < lowest.score
            ) {

                lowest = awayGame;

            }

            if (
                homeGame.score < lowest.score
            ) {

                lowest = homeGame;

            }

        });

    });


    return {
        highest,
        lowest
    };
}


/* =========================================================
   CAREER PPG
========================================================= */

function calculateCareerPPG(managers, seasonData) {

    /*
       We calculate games played from the actual matchups
       rather than assuming every season had 14 games.

       This makes the calculation much safer historically.
    */

    Object.values(managers).forEach(manager => {

        manager.gamesPlayed = 0;

        manager.totalPointsFromGames = 0;

    });


    seasonData.forEach(season => {

        const data = season.data;

        if (!data.matchups) {
            return;
        }


        data.matchups.forEach(matchup => {

            const awayTeamId = matchup.awayTeamId;
            const homeTeamId = matchup.homeTeamId;

            const awayScore = Number(matchup.awayScore);
            const homeScore = Number(matchup.homeScore);


            /*
               Find the permanent manager associated with
               each seasonal team ID.
            */

            const awayManager = findManagerForTeam(
                data.teams,
                awayTeamId,
                managers
            );

            const homeManager = findManagerForTeam(
                data.teams,
                homeTeamId,
                managers
            );


            if (
                awayManager &&
                !Number.isNaN(awayScore)
            ) {

                awayManager.gamesPlayed++;

                awayManager.totalPointsFromGames +=
                    awayScore;

            }


            if (
                homeManager &&
                !Number.isNaN(homeScore)
            ) {

                homeManager.gamesPlayed++;

                homeManager.totalPointsFromGames +=
                    homeScore;

            }

        });

    });


    let best = null;


    Object.values(managers).forEach(manager => {

        if (manager.gamesPlayed === 0) {
            return;
        }


        const ppg =
            manager.totalPointsFromGames /
            manager.gamesPlayed;


        manager.careerPPG = ppg;


        if (
            best === null ||
            ppg > best.careerPPG
        ) {

            best = manager;

        }

    });


    return best;
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
        t => Number(t.id) === Number(teamId)
    );


    if (!team) {
        return null;
    }


    const managerId = team.managerId;


    return managers[managerId] || null;
}


/* =========================================================
   MOST CAREER WINS
========================================================= */

function calculateMostCareerWins(managers) {

    let best = null;


    Object.values(managers).forEach(manager => {

        if (
            best === null ||
            manager.careerWins > best.careerWins
        ) {

            best = manager;

        }

    });


    return best;
}


/* =========================================================
   MOST CAREER POINTS
========================================================= */

function calculateMostCareerPoints(managers) {

    let best = null;


    Object.values(managers).forEach(manager => {

        if (
            best === null ||
            manager.careerPoints > best.careerPoints
        ) {

            best = manager;

        }

    });


    return best;
}


/* =========================================================
   BEST SINGLE SEASON
========================================================= */

function calculateBestSeason(managers) {

    let best = null;


    Object.values(managers).forEach(manager => {

        manager.seasons.forEach(season => {

            const wins = season.wins;
            const losses = season.losses;

            const games =
                wins + losses;


            if (games === 0) {
                return;
            }


            const winPercentage =
                wins / games;


            const seasonResult = {

                manager: manager,

                year: season.year,

                teamName: season.teamName,

                wins: wins,

                losses: losses,

                pointsFor: season.pointsFor,

                winPercentage: winPercentage

            };


            /*
               Ranking rules:

               1. Highest win percentage
               2. Most wins
               3. Most points scored
            */

            if (best === null) {

                best = seasonResult;

                return;

            }


            if (
                seasonResult.winPercentage >
                best.winPercentage
            ) {

                best = seasonResult;

                return;

            }


            if (
                seasonResult.winPercentage ===
                best.winPercentage &&
                seasonResult.wins >
                best.wins
            ) {

                best = seasonResult;

                return;

            }


            if (
                seasonResult.winPercentage ===
                best.winPercentage &&
                seasonResult.wins ===
                best.wins &&
                seasonResult.pointsFor >
                best.pointsFor
            ) {

                best = seasonResult;

            }

        });

    });


    return best;
}


/* =========================================================
   DISPLAY RECORDS
========================================================= */

function displayRecords(
    singleGameRecords,
    highestPPG,
    mostWins,
    mostPoints,
    bestSeason
) {


    /* =====================================================
       MOST POINTS
    ===================================================== */

    if (singleGameRecords.highest) {

        document.getElementById(
            "most-points"
        ).textContent =
            singleGameRecords.highest.score.toFixed(2);

        document.getElementById(
            "most-points-holder"
        ).textContent =
            `${singleGameRecords.highest.teamName} • ` +
            `${singleGameRecords.highest.year} Week ` +
            `${singleGameRecords.highest.week}`;

    }


    /* =====================================================
       LOWEST POINTS
    ===================================================== */

    if (singleGameRecords.lowest) {

        document.getElementById(
            "lowest-points"
        ).textContent =
            singleGameRecords.lowest.score.toFixed(2);

        document.getElementById(
            "lowest-points-holder"
        ).textContent =
            `${singleGameRecords.lowest.teamName} • ` +
            `${singleGameRecords.lowest.year} Week ` +
            `${singleGameRecords.lowest.week}`;

    }


    /* =====================================================
       HIGHEST CAREER PPG
    ===================================================== */

    if (highestPPG) {

        document.getElementById(
            "highest-career-ppg"
        ).textContent =
            highestPPG.careerPPG.toFixed(2);

        document.getElementById(
            "highest-career-ppg-holder"
        ).textContent =
            highestPPG.name;

    }


    /* =====================================================
       MOST CAREER WINS
    ===================================================== */

    if (mostWins) {

        document.getElementById(
            "most-career-wins"
        ).textContent =
            mostWins.careerWins;

        document.getElementById(
            "most-career-wins-holder"
        ).textContent =
            mostWins.name;

    }


    /* =====================================================
       MOST CAREER POINTS
    ===================================================== */

    if (mostPoints) {

        document.getElementById(
            "most-career-points"
        ).textContent =
            Math.round(
                mostPoints.careerPoints
            ).toLocaleString();

        document.getElementById(
            "most-career-points-holder"
        ).textContent =
            mostPoints.name;

    }


    /* =====================================================
       BEST SINGLE SEASON
    ===================================================== */

    if (bestSeason) {

        document.getElementById(
            "best-season"
        ).textContent =
            `${bestSeason.wins}-${bestSeason.losses}`;

        document.getElementById(
            "best-season-holder"
        ).textContent =
            `${bestSeason.manager.name} • ${bestSeason.year}`;

    }

}


/* =========================================================
   MAIN
========================================================= */

async function initializeRecords() {

    console.log("Loading GBD records...");


    const seasonData =
        await loadAllSeasons();


    if (seasonData.length === 0) {

        console.error(
            "No season data could be loaded."
        );

        return;

    }


    console.log(
        `Loaded ${seasonData.length} seasons.`
    );


    /* Build manager database */

    const managers =
        buildManagerDatabase(
            seasonData
        );


    /* Calculate records */

    const singleGameRecords =
        calculateSingleGameRecords(
            seasonData
        );


    const highestPPG =
        calculateCareerPPG(
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


    /* Display everything */

    displayRecords(

        singleGameRecords,

        highestPPG,

        mostWins,

        mostPoints,

        bestSeason

    );


    /* Debug information */

    console.log(
        "GBD Records:",
        {
            singleGameRecords,
            highestPPG,
            mostWins,
            mostPoints,
            bestSeason
        }
    );

}


/* =========================================================
   START
========================================================= */

initializeRecords();