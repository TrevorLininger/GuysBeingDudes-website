console.log("SEASON JS LOADED");

fetch("data/2026.json")
    .then(response => response.json())
    .then(seasonData => {

        console.log("2026 DATA:", seasonData);

        fetch("data/powerrankings.json")
            .then(response => response.json())
            .then(powerRankings => {

                console.log("POWER RANKINGS:", powerRankings);

                const container =
                    document.getElementById("standings-container");

                if (!container) {
                    console.error("STANDINGS CONTAINER NOT FOUND");
                    return;
                }

                seasonData.teams.forEach(team => {

                    const ranking = powerRankings.find(
                        power => power.managerID === team.managerID
                    );

                    const row = document.createElement("div");

                    row.className = "standing-row";

                    row.innerHTML = `
                        <div class="standing-rank">
                            ${team.id}
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

                    container.appendChild(row);

                });

            });

    })
    .catch(error => {

        console.error("ERROR LOADING 2026 DATA:", error);

    });
