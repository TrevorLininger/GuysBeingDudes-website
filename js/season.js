console.log("SEASON JS LOADED");

Promise.all([
    fetch("data/2026.json").then(response => response.json()),
    fetch("data/powerrankings.json").then(response => response.json()),
    fetch("data/highlights.json").then(response => response.json())
])
.then(([seasonData, powerRankings, highlights]) => {

    console.log("2026 DATA:", seasonData);
    console.log("POWER RANKINGS:", powerRankings);
    console.log("HIGHLIGHTS:", highlights);


    /* ============================= */
    /* CURRENT STANDINGS              */
    /* ============================= */

    const standingsContainer =
    document.getElementById("standings-container");

if (standingsContainer) {

    const teams = [...seasonData.teams].sort((a, b) => {

        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }

        if (a.losses !== b.losses) {
            return a.losses - b.losses;
        }

        return b.pointsFor - a.pointsFor;

    });

    teams.forEach((team, index) => {

        const ranking = powerRankings.find(
            power => power.managerID === team.managerID
        );

        const row = document.createElement("div");

        row.className = "standing-row";

        row.innerHTML = `
            <div class="standing-rank">
                ${index + 1}
            </div>

            <div class="standing-team">
                ${team.name}
            </div>

            <div class="standing-record">
                ${team.wins}-${team.losses}
            </div>

            <div class="standing-power">
                ${ranking ? ranking.espnRank : "-"}
            </div>

            <div class="standing-power">
                ${ranking ? ranking.fpRank : "-"}
            </div>
        `;

        standingsContainer.appendChild(row);
    });
}

    /* ============================= */
    /* WEEK 1 HIGHLIGHTS              */
    /* ============================= */

    const highlightsContainer =
        document.getElementById("week-highlights-container");

    if (highlightsContainer) {

        const weekOne = highlights.find(
            highlight => highlight.week === 1
        );

        if (weekOne) {

            highlightsContainer.innerHTML = `

                <div class="week-highlight">

                    <div class="week-highlight-label">
                        High Scoring Team
                    </div>

                    <div class="week-highlight-value">
                        ${weekOne.highScoringTeam.name}
                        <strong>
                            ${weekOne.highScoringTeam.score}
                        </strong>
                    </div>

                </div>


                <div class="week-highlight">

                    <div class="week-highlight-label">
                        Low Scoring Team
                    </div>

                    <div class="week-highlight-value">
                        ${weekOne.lowScoringTeam.name}
                        <strong>
                            ${weekOne.lowScoringTeam.score}
                        </strong>
                    </div>

                </div>


                <div class="top-players">

                    <h4>Top 3 Players</h4>

                    ${weekOne.topPlayers.map((player, index) => `

                        <div class="top-player">

                            <div class="top-player-rank">
                                ${index + 1}
                            </div>

                            <div class="top-player-info">

                                <strong>
                                    ${player.name}
                                </strong>

                                <span>
                                    ${player.team}
                                </span>

                            </div>

                            <div class="top-player-points">

                                <strong>
                                    ${player.points}
                                </strong>

                                <span>
                                    POINTS
                                </span>

                            </div>

                        </div>

                    `).join("")}

                </div>

            `;

        } else {

            highlightsContainer.innerHTML = `
                <p>No highlights available.</p>
            `;

        }

    }

})
.catch(error => {

    console.error(
        "ERROR LOADING SEASON DATA:",
        error
    );

});

