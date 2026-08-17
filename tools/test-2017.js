require("dotenv").config();

const leagueId = 1472105;
const season = 2017;

const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${leagueId}?seasonId=${season}`;

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
        console.log("2017 DATA:");
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error("ERROR:");
        console.error(error);
    });