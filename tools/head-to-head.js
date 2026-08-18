const fs = require("fs");
const path = require("path");

// ============================================================
// SETTINGS
// ============================================================

const DATA_FOLDER = path.join(__dirname, "..", "data");

const REPORT_FILE = path.join(
    __dirname,
    "head-to-head-report.txt"
);

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

const CLOSE_GAME_MARGIN = 10;


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
// IMPORTANT:
// These are the PERMANENT managerId values.
//
// They are NOT the season-specific ESPN team IDs.
//
// The script converts these manager IDs into the appropriate
// season-specific teams automatically.
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
// DETERMINE TRUE PLAYOFF MATCHUP
//
// A matchup counts as a playoff matchup ONLY when:
//
// 1. It happened during a designated playoff week.
// 2. BOTH managers were playoff managers that season.
//
// This prevents consolation games from being counted.
// ============================================================

function isPlayoffMatchup(
    season,
    week,
    awayManagerId,
    homeManagerId
) {

    // Make sure the season has defined playoff weeks.

    if (
        !PLAYOFF_WEEKS[season]
    ) {

        return false;

    }


    // Make sure this particular week is a playoff week.

    if (
        !PLAYOFF_WEEKS[season].includes(
            week
        )
    ) {

        return false;

    }


    // Get the permanent manager IDs that qualified
    // for the playoffs that season.

    const playoffManagers =
        PLAYOFF_MANAGERS[season] || [];


    // BOTH managers must have made the playoffs.

    return (
        playoffManagers.includes(
            awayManagerId
        ) &&
        playoffManagers.includes(
            homeManagerId
        )
    );

}


// ============================================================
// LOAD SEASON
// ============================================================

function loadSeason(season) {

    const filePath =
        path.join(
            DATA_FOLDER,
            `${season}.json`
        );


    if (!fs.existsSync(filePath)) {

        console.log(
            `WARNING: Could not find ${season}.json`
        );

        return null;

    }


    return JSON.parse(
        fs.readFileSync(
            filePath,
            "utf8"
        )
    );

}


// ============================================================
// HELPERS
// ============================================================

function cleanName(name) {

    if (!name) {
        return "";
    }


    return name
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


function round(
    number,
    decimals = 1
) {

    return Number(
        number.toFixed(decimals)
    );

}


function formatMargin(number) {

    return `${
        number >= 0 ? "+" : ""
    }${round(number)}`;

}


// ============================================================
// BUILD TEAM MAP
//
// This creates a map using the season-specific ESPN team ID.
//
// Example:
//
// ESPN team.id 5
//       ↓
// managerId 1
//       ↓
// Lake Johnson
//
// This is what lets us correctly translate the permanent
// manager IDs into each season's temporary ESPN team IDs.
// ============================================================

function buildTeamMap(seasonData) {

    const teamMap = new Map();


    if (
        !seasonData ||
        !Array.isArray(
            seasonData.teams
        )
    ) {

        return teamMap;

    }


    seasonData.teams.forEach(team => {

        teamMap.set(
            team.id,
            {

                teamId:
                    team.id,

                managerId:
                    team.managerId,

                managerName:
                    cleanName(
                        team.manager
                    ) ||
                    `Manager ${team.managerId}`,

                teamName:
                    cleanName(
                        team.name
                    )

            }
        );

    });


    return teamMap;

}


// ============================================================
// GET MATCHUPS
// ============================================================

function getMatchups(seasonData) {

    if (!seasonData) {
        return [];
    }


    if (
        Array.isArray(
            seasonData.matchups
        )
    ) {

        return seasonData.matchups;

    }


    if (
        Array.isArray(
            seasonData.schedule
        )
    ) {

        return seasonData.schedule;

    }


    return [];

}


// ============================================================
// MANAGER REPORT STORAGE
// ============================================================

const managerReports = new Map();


function getManagerReport(manager) {

    if (
        !managerReports.has(
            manager.managerId
        )
    ) {

        managerReports.set(
            manager.managerId,
            {

                manager,

                opponents: new Map()

            }
        );

    }


    return managerReports.get(
        manager.managerId
    );

}


// ============================================================
// ADD GAME
// ============================================================

function addGame(

    manager,

    opponent,

    managerScore,

    opponentScore,

    season,

    week,

    playoff

) {

    const report =
        getManagerReport(
            manager
        );


    // --------------------------------------------------------
    // CREATE OPPONENT RECORD IF NECESSARY
    // --------------------------------------------------------

    if (
        !report.opponents.has(
            opponent.managerId
        )
    ) {

        report.opponents.set(
            opponent.managerId,
            {

                opponent,

                meetings: 0,

                wins: 0,

                losses: 0,

                ties: 0,

                managerPoints: 0,

                opponentPoints: 0,

                pointDifferentials: [],

                closeGames: 0,

                playoffMeetings: 0,

                playoffWins: 0,

                playoffLosses: 0,

                playoffTies: 0,

                games: [],

                biggestWin: null,

                worstLoss: null

            }
        );

    }


    const matchup =
        report.opponents.get(
            opponent.managerId
        );


    // --------------------------------------------------------
    // BASIC STATS
    // --------------------------------------------------------

    matchup.meetings++;


    matchup.managerPoints +=
        managerScore;


    matchup.opponentPoints +=
        opponentScore;


    const difference =
        managerScore -
        opponentScore;


    matchup.pointDifferentials.push(
        difference
    );


    // --------------------------------------------------------
    // OVERALL RECORD
    // --------------------------------------------------------

    if (difference > 0) {

        matchup.wins++;

    }

    else if (difference < 0) {

        matchup.losses++;

    }

    else {

        matchup.ties++;

    }


    // --------------------------------------------------------
    // CLOSE GAME
    // --------------------------------------------------------

    if (
        Math.abs(difference) <=
        CLOSE_GAME_MARGIN
    ) {

        matchup.closeGames++;

    }


    // --------------------------------------------------------
    // PLAYOFF STATS
    // --------------------------------------------------------

    if (playoff) {

        matchup.playoffMeetings++;


        if (difference > 0) {

            matchup.playoffWins++;

        }

        else if (difference < 0) {

            matchup.playoffLosses++;

        }

        else {

            matchup.playoffTies++;

        }

    }


    // --------------------------------------------------------
    // STORE INDIVIDUAL GAME
    // --------------------------------------------------------

    matchup.games.push({

        season,

        week,

        managerScore,

        opponentScore,

        difference,

        playoff

    });


    // --------------------------------------------------------
    // BIGGEST WIN
    // --------------------------------------------------------

    if (difference > 0) {

        if (
            !matchup.biggestWin ||
            difference >
            matchup.biggestWin.margin
        ) {

            matchup.biggestWin = {

                margin:
                    difference,

                season,

                week,

                yourScore:
                    managerScore,

                opponentScore:
                    opponentScore

            };

        }

    }


    // --------------------------------------------------------
    // WORST LOSS
    // --------------------------------------------------------

    if (difference < 0) {

        const margin =
            Math.abs(
                difference
            );


        if (
            !matchup.worstLoss ||
            margin >
            matchup.worstLoss.margin
        ) {

            matchup.worstLoss = {

                margin,

                season,

                week,

                yourScore:
                    managerScore,

                opponentScore:
                    opponentScore

            };

        }

    }

}


// ============================================================
// LOAD ALL SEASONS
// ============================================================

console.log(
    "Loading seasons..."
);


SEASONS.forEach(season => {

    const seasonData =
        loadSeason(
            season
        );


    if (!seasonData) {
        return;
    }


    const teamMap =
        buildTeamMap(
            seasonData
        );


    const matchups =
        getMatchups(
            seasonData
        );


    console.log(
        `${season}: ${matchups.length} matchups`
    );


    matchups.forEach(matchup => {

        // ----------------------------------------------------
        // FIND THE TWO TEAMS
        // ----------------------------------------------------

        const awayTeam =
            teamMap.get(
                matchup.awayTeamId
            );


        const homeTeam =
            teamMap.get(
                matchup.homeTeamId
            );


        // Make sure both teams exist.

        if (
            !awayTeam ||
            !homeTeam
        ) {

            return;

        }


        // ----------------------------------------------------
        // GET SCORES
        // ----------------------------------------------------

        const awayScore =
            Number(
                matchup.awayScore
            );


        const homeScore =
            Number(
                matchup.homeScore
            );


        // Make sure scores are valid.

        if (
            Number.isNaN(
                awayScore
            ) ||
            Number.isNaN(
                homeScore
            )
        ) {

            return;

        }


        // ----------------------------------------------------
        // DETERMINE TRUE PLAYOFF STATUS
        //
        // IMPORTANT:
        // We use managerId here, NOT team.id.
        // ----------------------------------------------------

        const playoff =
            isPlayoffMatchup(

                season,

                matchup.week,

                awayTeam.managerId,

                homeTeam.managerId

            );


        // ----------------------------------------------------
        // AWAY MANAGER'S PERSPECTIVE
        // ----------------------------------------------------

        addGame(

            awayTeam,

            homeTeam,

            awayScore,

            homeScore,

            season,

            matchup.week,

            playoff

        );


        // ----------------------------------------------------
        // HOME MANAGER'S PERSPECTIVE
        // ----------------------------------------------------

        addGame(

            homeTeam,

            awayTeam,

            homeScore,

            awayScore,

            season,

            matchup.week,

            playoff

        );

    });

});


// ============================================================
// BUILD REPORT
// ============================================================

let output = "";


// ============================================================
// REPORT HEADER
// ============================================================

output +=
`GBD FANTASY FOOTBALL
HEAD-TO-HEAD ANALYSIS
2017–2025

Generated: ${new Date().toLocaleString()}

Close Game Definition: 10 points or less

IMPORTANT:
A game is considered a TRUE PLAYOFF MATCHUP only when:

1. It occurred during a designated playoff week.
2. BOTH managers were members of that season's
   championship playoff team list.

Consolation games are therefore NOT counted as playoff games.


PLAYOFF WEEKS
2017: 14, 15, 16, 17
2018: 14, 15
2019: 14, 15
2020: 14, 15, 16
2021: 15, 16, 17
2022: 15, 16, 17
2023: 15, 16, 17
2024: 15, 16, 17
2025: 15, 16, 17


PLAYOFF MANAGERS
These IDs are permanent managerId values.

2017: 15, 14, 6, 10
2018: 14, 15, 2, 9
2019: 7, 5, 10, 6
2020: 6, 2, 7, 11, 13, 5
2021: 10, 3, 1, 6, 5, 7
2022: 10, 8, 9, 2, 7, 3
2023: 10, 9, 12, 6, 7, 1
2024: 1, 4, 12, 6
2025: 1, 2, 5, 6, 3, 4


`;


// ============================================================
// SORT MANAGERS
// ============================================================

const reports =
    Array.from(
        managerReports.values()
    )
    .sort(
        (a, b) =>
            a.manager.managerName
                .localeCompare(
                    b.manager.managerName
                )
    );


// ============================================================
// MANAGER REPORTS
// ============================================================

reports.forEach(report => {

    output +=
`
============================================================
${report.manager.managerName.toUpperCase()} — HEAD-TO-HEAD
============================================================
`;


    const opponents =
        Array.from(
            report.opponents.values()
        )
        .sort(
            (a, b) => {

                // Most meetings first.

                if (
                    b.meetings !==
                    a.meetings
                ) {

                    return (
                        b.meetings -
                        a.meetings
                    );

                }


                // Alphabetical tie-breaker.

                return (
                    a.opponent.managerName
                        .localeCompare(
                            b.opponent.managerName
                        )
                );

            }
        );


    opponents.forEach(matchup => {

        // ----------------------------------------------------
        // AVERAGE POINT DIFFERENTIAL
        // ----------------------------------------------------

        const averagePointDifferential =
            matchup.meetings
                ? matchup.pointDifferentials
                    .reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum + value,
                        0
                    )
                    /
                    matchup.meetings

                : 0;


        // ----------------------------------------------------
        // AVERAGE SCORES
        // ----------------------------------------------------

        const averageManagerScore =
            matchup.meetings
                ? matchup.managerPoints /
                  matchup.meetings

                : 0;


        const averageOpponentScore =
            matchup.meetings
                ? matchup.opponentPoints /
                  matchup.meetings

                : 0;


        // ----------------------------------------------------
        // RECORDS
        // ----------------------------------------------------

        const playoffRecord =
            `${matchup.playoffWins}-${matchup.playoffLosses}` +
            (
                matchup.playoffTies
                    ? `-${matchup.playoffTies}`
                    : ""
            );


        const overallRecord =
            `${matchup.wins}-${matchup.losses}` +
            (
                matchup.ties
                    ? `-${matchup.ties}`
                    : ""
            );


        // ----------------------------------------------------
        // MATCHUP HEADER
        // ----------------------------------------------------

        output +=
`
vs ${matchup.opponent.managerName}
------------------------------------------------------------
Meetings:            ${matchup.meetings}

Record:              ${overallRecord}

Avg Point Diff:      ${formatMargin(
    averagePointDifferential
)}

Avg ${report.manager.managerName} Score:
                     ${round(
                         averageManagerScore
                     )}

Avg ${matchup.opponent.managerName} Score:
                     ${round(
                         averageOpponentScore
                     )}

Close Games (≤10):   ${matchup.closeGames}

Playoff Games:       ${matchup.playoffMeetings}

Playoff Record:      ${playoffRecord}
`;


        // ----------------------------------------------------
        // BIGGEST WIN
        // ----------------------------------------------------

        if (
            matchup.biggestWin
        ) {

            output +=
`
Biggest Win:         +${round(
    matchup.biggestWin.margin
)} points

                     ${matchup.biggestWin.season}
                     Week ${matchup.biggestWin.week}

                     ${round(
                         matchup.biggestWin.yourScore
                     )} - ${round(
                         matchup.biggestWin.opponentScore
                     )}
`;

        }


        // ----------------------------------------------------
        // WORST LOSS
        // ----------------------------------------------------

        if (
            matchup.worstLoss
        ) {

            output +=
`
Worst Loss:          -${round(
    matchup.worstLoss.margin
)} points

                     ${matchup.worstLoss.season}
                     Week ${matchup.worstLoss.week}

                     ${round(
                         matchup.worstLoss.yourScore
                     )} - ${round(
                         matchup.worstLoss.opponentScore
                     )}
`;

        }


        // ----------------------------------------------------
        // GAME HISTORY
        // ----------------------------------------------------

        output +=
`
Game History:
`;


        matchup.games
            .sort(
                (a, b) => {

                    if (
                        a.season !==
                        b.season
                    ) {

                        return (
                            a.season -
                            b.season
                        );

                    }


                    return (
                        a.week -
                        b.week
                    );

                }
            )
            .forEach(game => {

                const result =
                    game.difference > 0
                        ? "W"
                        : game.difference < 0
                            ? "L"
                            : "T";


                const playoffLabel =
                    game.playoff
                        ? "PLAYOFF"
                        : "";


                output +=
`  ${game.season} Wk ${String(
    game.week
).padStart(2, " ")} ${
    playoffLabel.padEnd(
        7,
        " "
    )
} ${result}  ${
    round(
        game.managerScore
    )
} - ${
    round(
        game.opponentScore
    )
}  (${
    formatMargin(
        game.difference
    )
})

`;

            });


    });

});


// ============================================================
// FOOTER
// ============================================================

output +=
`
============================================================
END OF REPORT
============================================================
`;


// ============================================================
// WRITE REPORT
// ============================================================

fs.writeFileSync(
    REPORT_FILE,
    output,
    "utf8"
);


// ============================================================
// CONSOLE MESSAGE
// ============================================================

console.log("");

console.log(
    "============================================================"
);

console.log(
    "HEAD-TO-HEAD ANALYSIS COMPLETE"
);

console.log(
    "============================================================"
);

console.log("");

console.log(
    `Report saved to: ${REPORT_FILE}`
);

console.log("");