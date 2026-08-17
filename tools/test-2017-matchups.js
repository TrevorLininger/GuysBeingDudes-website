require("dotenv").config();

const leagueId = 1472105;
const season = 2017;

const url =
    `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${leagueId}?seasonId=${season}&view=mMatchup`;

const headers = {
    Cookie: `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.SWID}`
};

fetch(url, {
    headers: headers
})
    .then(response => {
        console.log("STATUS:", response.status);

        if (!response.ok) {
            throw new Error(`ESPN API returned ${response.status}`);
        }

        return response.json();
    })
    .then(data => {

        console.log("TOP LEVEL:");
        console.log(data[0]);

        console.log("SCHEDULE:");
        console.log(data[0].schedule);

    })
    .catch(error => {
        console.error("TEST FAILED:");
        console.error(error);
    });