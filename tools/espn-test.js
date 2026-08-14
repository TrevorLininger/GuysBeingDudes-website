require("dotenv").config();

const leagueId = 1472105;
const season = 2025;

const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mMatchup&view=mSettings`;

const headers = {
    Cookie: `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.SWID}`
};

fetch(url, {
    headers: headers
})
    .then(response => {
        console.log("Status:", response.status);
        return response.json();
    })
    .then(data => {

        console.log("\nNumber of teams:");
        console.log(data.teams?.length);

        console.log("\nSchedule entries:");
        console.log(data.schedule?.length);

        console.log("\nLast matchup:");
        console.dir(data.schedule?.[data.schedule.length - 1], { depth: null });

    })
    .catch(error => {
        console.error("Error:", error);
    });