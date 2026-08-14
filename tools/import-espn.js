require("dotenv").config();

const fs = require("fs");
const path = require("path");

const leagueId = 1472105;
const season = 2025;
const managerNames = {
    "Taco Corp": "Lake Johnson",
    "Gage  Of Inches": "Gage Kiesling",
    "Andy Reid Clock MGMT": "Jim Joyner",
    "Cousins Lover": "Nick Yarbrough",
    "The Reid Rockets": "Austin Chisam",
    "Dicked Down in Dallas": "Wes Summers",
    "TD's for Harambe": "Trevor Lininger",
    "Travis Swifties": "Justin Madsen",
    "Bo-n*rs": "Ryker Johnson",
    "Tune Squad": "Kip Unruh",
    "That Was Legetteness": "Matt Bush",
    "TD Milk": "Hayden Jenkins"
}

const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mMatchup&view=mSettings`;

const headers = {
    Cookie: `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.SWID}`
};

fetch(url, {
    headers: headers
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`ESPN API returned ${response.status}`);
        }

        return response.json();
    })
    .then(data => {

        // Create a lookup table so we can turn ESPN team IDs into names
        const teamNames = {};

        data.teams.forEach(team => {
            teamNames[team.id] = team.name;
        });

        // Convert ESPN matchups into our much simpler format
        const matchups = data.schedule
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

        // Create our clean season data
        const seasonData = {
            season: season,
            leagueName: data.settings.name,

            teams: data.teams.map(team => ({
                id: team.id,
                name: team.name,
                manager: managerNames[team.name] || "",
                abbreviation: team.abbrev,
                wins: team.record?.overall?.wins || 0,
                losses: team.record?.overall?.losses || 0,
                pointsFor: team.record?.overall?.pointsFor || 0
            })),

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
        console.log(`Teams: ${seasonData.teams.length}`);
        console.log(`Matchups: ${seasonData.matchups.length}`);
        console.log(`Saved to: ${outputPath}`);

    })
    .catch(error => {
        console.error("Import failed:");
        console.error(error);
    });