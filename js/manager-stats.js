const managers = require("../data/managers.json");
const champions = require("../data/champions.json");

function getManagerHistory(managerId) {

    const manager = managers.find(
        manager => manager.managerId === managerId
    );

    if (!manager) {
        console.log(`Manager ${managerId} not found.`);
        return;
    }

    const history = [];

    for (let year = 2017; year <= 2025; year++) {

        const season = require(`../data/${year}.json`);

        const team = season.teams.find(
            team => team.managerId === managerId
        );

        if (team) {

            const matchups = season.matchups.filter(
                matchup =>
                    matchup.awayTeamId === team.id ||
                    matchup.homeTeamId === team.id
            );

            history.push({
                season: year,
                teamId: team.id,
                teamName: team.name,
                wins: team.wins,
                losses: team.losses,
                pointsFor: team.pointsFor,
                matchups: matchups
            });
        }
    }

    // Career wins
    const careerWins = history.reduce(
        (total, season) => total + season.wins,
        0
    );

    // Career losses
    const careerLosses = history.reduce(
        (total, season) => total + season.losses,
        0
    );

    // Best regular season based on wins
    const bestRegularSeason = history.reduce(
        (best, season) => {

            if (!best || season.wins > best.wins) {
                return season;
            }

            return best;
        },
        null
    );

    // Historical single-game stats
    let highestScore = null;
    let lowestScore = null;
    let biggestWin = null;
    let worstLoss = null;

    history.forEach(season => {

        season.matchups.forEach(matchup => {

            // 2017 had playoffs in Weeks 14 and 15.
            // Weeks 1-13 are the regular season.
            const regularSeasonEnd = season.season === 2017
                ? 13
                : 999;

            // Ignore playoff games
            if (matchup.week > regularSeasonEnd) {
                return;
            }

            const isAway = matchup.awayTeamId === season.teamId;

            const yourScore = isAway
                ? matchup.awayScore
                : matchup.homeScore;

            const opponentScore = isAway
                ? matchup.homeScore
                : matchup.awayScore;

            const opponent = isAway
                ? matchup.homeTeam
                : matchup.awayTeam;

            const margin = yourScore - opponentScore;

            // Highest regular-season score
            if (!highestScore || yourScore > highestScore.score) {

                highestScore = {
                    score: yourScore,
                    season: season.season,
                    week: matchup.week,
                    opponent: opponent
                };
            }

            // Lowest regular-season score
            if (!lowestScore || yourScore < lowestScore.score) {

                lowestScore = {
                    score: yourScore,
                    season: season.season,
                    week: matchup.week,
                    opponent: opponent
                };
            }

            // Biggest regular-season win
            if (
                margin > 0 &&
                (!biggestWin || margin > biggestWin.margin)
            ) {

                biggestWin = {
                    margin: margin,
                    yourScore: yourScore,
                    opponentScore: opponentScore,
                    season: season.season,
                    week: matchup.week,
                    opponent: opponent
                };
            }

            // Worst regular-season loss
            if (
                margin < 0 &&
                (!worstLoss || margin < worstLoss.margin)
            ) {

                worstLoss = {
                    margin: margin,
                    yourScore: yourScore,
                    opponentScore: opponentScore,
                    season: season.season,
                    week: matchup.week,
                    opponent: opponent
                };
            }

        });

    });

    // Championship finishes
    let championships = 0;
    let runnerUps = 0;
    let thirdPlaceFinishes = 0;

    for (const year in champions) {

        const finish = champions[year];

        if (finish.first === managerId) {
            championships++;
        }

        if (finish.second === managerId) {
            runnerUps++;
        }

        if (finish.third === managerId) {
            thirdPlaceFinishes++;
        }
    }

    return {
        managerId: manager.managerId,
        managerName: manager.managerName,
        teamName: manager.teamName,
        image: manager.image,
        active: manager.active,

        // Career stats
        careerWins: careerWins,
        careerLosses: careerLosses,

        // Best season
        bestRegularSeason: bestRegularSeason,

        // Single-game records
        highestScore: highestScore,
        lowestScore: lowestScore,
        biggestWin: biggestWin,
        worstLoss: worstLoss,

        // Finishes
        championships: championships,
        runnerUps: runnerUps,
        thirdPlaceFinishes: thirdPlaceFinishes,

        // Full season history
        history: history
    };
}


// Test Gage
const gage = getManagerHistory(10);

console.log(gage);