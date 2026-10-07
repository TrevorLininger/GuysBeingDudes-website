require("dotenv").config();

const fs = require("fs");
const path = require("path");

const leagueId = 1472105;
const season = 2026;


/* ============================= */
/* MANAGER MAPPINGS              */
/* ============================= */

const managerNames = {
    "Taco Corp": "Lake Johnson",
    "Gage  Of Inches": "Gage Kiesling",
    "Andy Reid Clock MGMT": "Jim Joyner",
    "Cousins Lover": "Nick Yarbrough",
    "The Reid Rockets": "Austin Chisam",
    "Eaton Boutte": "Wes Summers",
    "TD's for Harambe": "Trevor Lininger",
    "Travis Swifties": "Justin Madsen",
    "Bo-n*rs": "Ryker Johnson",
    "Tune Squad": "Kip Unruh",
    "Silence of the Lamb": "Matt Bush",
    "TD Milk": "Hayden Jenkins"
};


const managerIds = {
    "Taco Corp": 1,
    "Andy Reid Clock MGMT": 2,
    "Bo-n*rs": 3,
    "TD Milk": 4,
    "Cousins Lover": 5,
    "TD's for Harambe": 6,
    "EAton Boutte": 7,
    "Tune Squad": 8,
    "Travis Swifties": 9,
    "Gage  Of Inches": 10,
    "The Reid Rockets": 11,
    "Silence of the Lamb": 12
};


/* ============================= */
/* ESPN API                       */
/* ============================= */

const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mMatchup&view=mSettings`;

const headers = {
    Cookie: `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.SWID}`
};


/* ============================= */
/* FETCH ESPN DATA                */
/* ============================= */

fetch(url, {
    headers: headers
})
    .then(response => {

        if (!response.ok) {
            throw new Error(
                `ESPN API returned ${response.status}`
            );
        }

        return response.json();

    })
    .then(data => {


        /* ============================= */
        /* TEAM NAME LOOKUP              */
        /* ============================= */

        const teamNames = {};

        data.teams.forEach(team => {

            teamNames[team.id] = team.name;

        });


        /* ============================= */
        /* MATCHUPS                      */
        /* ============================= */

        const matchups = data.schedule
            .filter(matchup => matchup.away && matchup.home)
            .map(matchup => {

                return {

                    week: matchup.matchupPeriodId,

                    awayTeam:
                        teamNames[matchup.away.teamId],

                    awayTeamId:
                        matchup.away.teamId,

                    awayScore:
                        matchup.away.totalPoints,

                    homeTeam:
                        teamNames[matchup.home.teamId],

                    homeTeamId:
                        matchup.home.teamId,

                    homeScore:
                        matchup.home.totalPoints,

                    winner:
                        matchup.winner

                };

            });


        /* ============================= */
        /* SEASON DATA                   */
        /* ============================= */

        const seasonData = {

            season: season,

            leagueName:
                data.settings.name,

            teams: data.teams.map(team => ({

                id: team.id,

                name: team.name,

                manager:
                    managerNames[team.name] || "",

                managerID:
                    managerIds[team.name] || null,

                abbreviation:
                    team.abbrev,

                wins:
                    team.record?.overall?.wins || 0,

                losses:
                    team.record?.overall?.losses || 0,

                pointsFor:
                    team.record?.overall?.pointsFor || 0

            })),

            matchups: matchups

        };


        /* ============================= */
        /* SAVE FILE                     */
        /* ============================= */

        const outputPath = path.join(
            __dirname,
            "..",
            "data",
            `${season}.json`
        );


        fs.writeFileSync(

            outputPath,

            JSON.stringify(
                seasonData,
                null,
                2
            )

        );


        /* ============================= */
        /* SUCCESS MESSAGE                */
        /* ============================= */

        console.log(
            `Successfully imported ${season}!`
        );

        console.log(
            `Teams: ${seasonData.teams.length}`
        );

        console.log(
            `Matchups: ${seasonData.matchups.length}`
        );

        console.log(
            `Saved to: ${outputPath}`
        );

    })
    .catch(error => {

        console.error(
            "Import failed:"
        );

        console.error(
            error
        );

    });