async function getManagerHistory(managerId) {

    const managersResponse = await fetch("data/managers.json");
    const managers = await managersResponse.json();

    const championsResponse = await fetch("data/champions.json");
    const champions = await championsResponse.json();

    const manager = managers.find(
        manager => manager.managerId === managerId
    );

    if (!manager) {
        console.error(`Manager ${managerId} not found.`);
        return null;
    }

    const history = [];

    for (let year = 2017; year <= 2025; year++) {

        const seasonResponse = await fetch(`data/${year}.json`);
        const season = await seasonResponse.json();

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

    const careerWins = history.reduce(
        (total, season) => total + season.wins,
        0
    );

    const careerLosses = history.reduce(
        (total, season) => total + season.losses,
        0
    );

    const bestRegularSeason = history.reduce(
        (best, season) => {

            if (!best || season.wins > best.wins) {
                return season;
            }

            return best;
        },
        null
    );

    let highestScore = null;
    let lowestScore = null;
    let biggestWin = null;
    let worstLoss = null;

    history.forEach(season => {

        season.matchups.forEach(matchup => {

            const regularSeasonEnd = season.season === 2017
                ? 13
                : 999;

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

            if (!highestScore || yourScore > highestScore.score) {

                highestScore = {
                    score: yourScore,
                    season: season.season,
                    week: matchup.week,
                    opponent: opponent
                };
            }

            if (!lowestScore || yourScore < lowestScore.score) {

                lowestScore = {
                    score: yourScore,
                    season: season.season,
                    week: matchup.week,
                    opponent: opponent
                };
            }

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

        careerWins: careerWins,
        careerLosses: careerLosses,

        bestRegularSeason: bestRegularSeason,

        highestScore: highestScore,
        lowestScore: lowestScore,
        biggestWin: biggestWin,
        worstLoss: worstLoss,

        championships: championships,
        runnerUps: runnerUps,
        thirdPlaceFinishes: thirdPlaceFinishes,

        history: history
    };
}