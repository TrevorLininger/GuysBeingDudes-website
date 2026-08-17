require("dotenv").config();

const fs = require("fs");
const path = require("path");

const leagueId = 1472105;
const season = 2017;

// 2017 ESPN Team ID → our permanent managerId
const managerAssignments = {
    1: 10, // Gage Kiesling
    2: 2,  // Jim Joyner
    3: 14, // Tyler Cawley
    4: 15, // Zach Vredenburg
    5: 1,  // Lake Johnson
    6: 7,  // Wes Summers
    7: 6,  // Trevor Lininger
    8: 5,  // Nick Yarbrough
    9: 9,  // Justin Madsen
    10: 3 // Ryker Johnson
};

// 2017 ESPN Team ID → actual 2017 team name
const teamNames = {
    1: "Real Slim Brady",
    2: "Andy Reid Clock MGMT",
    3: "Sammie's Last Ride",
    4: "Kareem On Your Gurley",
    5: "Taco Corp",
    6: "King of the WESt",
    7: "TD's for Harambe",
    8: "Cry Me A Rivers",
    9: "Team All my fri ends aremarried",
    10: "Joe Mixon's Right Hooks"
};

// 2017 ESPN Team ID → 2017 abbreviation
const teamAbbreviations = {
    1: "KIES",
    2: "JOYN",
    3: "Sam",
    4: "VRED",
    5: "TACO",
    6: "ð»",
    7: "DO4H",
    8: "YARB",
    9: "MADS",
    10: "JMRH"
};

const url =
    `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${leagueId}?seasonId=${season}&view=mMatchup`;

const headers = {
    Cookie: `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.SWID}`
};

fetch(url, {
    headers: headers
})
    .then(response => {

        console.log(`ESPN STATUS: ${response.status}`);

        if (!response.ok) {
            throw new Error(`ESPN API returned ${response.status}`);
        }

        return response.json();

    })
    .then(data => {

        const league = data[0];

        // Convert ESPN matchups into our standard format
        const matchups = league.schedule
            .filter(matchup => matchup.away && matchup.home)
            .map(matchup => {

                return {
                    week: matchup.matchupPeriodId,

                    awayTeam: teamNames[matchup.away.teamId],
                    awayTeamId: matchup.away.teamId,
                    awayScore: matchup.away.totalPoints,

                    homeTeam: teamNames[matchup.home.teamId],
                    homeTeamId: matchup.home.teamId,
                    homeScore: matchup.home.totalPoints,

                    winner: matchup.winner
                };

            });

        // Show us which matchup periods ESPN gave us
        console.log(
            "MATCHUP WEEKS:",
            [...new Set(matchups.map(matchup => matchup.week))]
                .sort((a, b) => a - b)
        );

        // Build our standard team data
        const teams = Object.keys(teamNames).map(teamId => {

            const id = Number(teamId);
            const managerId = managerAssignments[id];

            // Only use regular-season games for the team's record.
            const teamMatchups = matchups.filter(matchup =>
                matchup.week <= 13 &&
                (
                    matchup.awayTeamId === id ||
                    matchup.homeTeamId === id
                )
            );

            let wins = 0;
            let losses = 0;
            let pointsFor = 0;

            teamMatchups.forEach(matchup => {

                if (matchup.awayTeamId === id) {

                    pointsFor += matchup.awayScore;

                    if (matchup.winner === "AWAY") {
                        wins++;
                    } else if (matchup.winner === "HOME") {
                        losses++;
                    }

                } else {

                    pointsFor += matchup.homeScore;

                    if (matchup.winner === "HOME") {
                        wins++;
                    } else if (matchup.winner === "AWAY") {
                        losses++;
                    }

                }

            });

            return {
                id: id,
                name: teamNames[id],
                managerId: managerId,
                abbreviation: teamAbbreviations[id],
                wins: wins,
                losses: losses,
                pointsFor: pointsFor
            };

        });

        // Create our standard season structure
        const seasonData = {
            season: season,
            leagueName: "Guys Being Dudes",
            teams: teams,
            matchups: matchups
        };

        // Save the file
        const outputPath = path.join(
            __dirname,
            "..",
            "data",
            `${season}.json`
        );

        fs.writeFileSync(
            outputPath,
            JSON.stringify(seasonData, null, 2)
        );

        console.log(`Successfully imported ${season}!`);
        console.log(`Teams: ${teams.length}`);
        console.log(`Matchups: ${matchups.length}`);
        console.log(`Saved to: ${outputPath}`);

    })
    .catch(error => {

        console.error("Import failed:");
        console.error(error);

    });