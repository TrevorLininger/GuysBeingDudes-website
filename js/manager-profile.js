console.log("MANAGER PROFILE JS LOADED");

const params = new URLSearchParams(window.location.search);

const managerId = Number(params.get("id"));

console.log("MANAGER ID:", managerId);


async function loadManagerProfile() {

    try {

        const manager = await getManagerHistory(managerId);

        if (!manager) {
            console.error("Manager not found.");
            return;
        }

        console.log("FULL MANAGER DATA:", manager);


        // ==============================
        // HEADER
        // ==============================

        document.getElementById("manager-name").textContent =
            manager.managerName;

        document.getElementById("manager-team").textContent =
            manager.teamName;


        // ==============================
        // CAREER OVERVIEW
        // ==============================

        document.getElementById("championships").textContent =
            manager.championships;

        document.getElementById("career-record").textContent =
            `${manager.careerWins}-${manager.careerLosses}`;

        document.getElementById("best-season").textContent =
            `${manager.bestRegularSeason.wins}-${manager.bestRegularSeason.losses}`;


        const careerPoints = manager.history.reduce(
            (total, season) => total + season.pointsFor,
            0
        );

        document.getElementById("career-points").textContent =
            careerPoints.toFixed(2);


        // ==============================
        // HIGHEST SCORE
        // ==============================

        document.getElementById("highest-score").textContent =
            manager.highestScore.score.toFixed(2);

        document.getElementById("highest-score-detail").textContent =
            `${manager.highestScore.season} • Week ${manager.highestScore.week} vs. ${manager.highestScore.opponent}`;


        // ==============================
        // LOWEST SCORE
        // ==============================

        document.getElementById("lowest-score").textContent =
            manager.lowestScore.score.toFixed(2);

        document.getElementById("lowest-score-detail").textContent =
            `${manager.lowestScore.season} • Week ${manager.lowestScore.week} vs. ${manager.lowestScore.opponent}`;


        // ==============================
        // BIGGEST WIN
        // ==============================

        document.getElementById("biggest-win").textContent =
            `+${manager.biggestWin.margin.toFixed(2)}`;

        document.getElementById("biggest-win-detail").textContent =
            `${manager.biggestWin.season} • Week ${manager.biggestWin.week} vs. ${manager.biggestWin.opponent}`;


        // ==============================
        // WORST LOSS
        // ==============================

        document.getElementById("worst-loss").textContent =
            manager.worstLoss.margin.toFixed(2);

        document.getElementById("worst-loss-detail").textContent =
            `${manager.worstLoss.season} • Week ${manager.worstLoss.week} vs. ${manager.worstLoss.opponent}`;


        // ==============================
        // SEASON HISTORY
        // ==============================

        const seasonContainer =
            document.getElementById("season-history");

        manager.history
            .slice()
            .reverse()
            .forEach(season => {

                const row = document.createElement("div");

                row.className = "manager-season-row";

                row.innerHTML = `
                    <div class="manager-season-year">
                        ${season.season}
                    </div>

                    <div class="manager-season-team">
                        ${season.teamName}
                    </div>

                    <div class="manager-season-record">
                        ${season.wins}-${season.losses}
                    </div>

                    <div class="manager-season-points">
                        ${season.pointsFor.toFixed(2)}
                    </div>
                `;

                seasonContainer.appendChild(row);

            });


    } catch (error) {

        console.error("ERROR LOADING MANAGER PROFILE:", error);

    }

}


loadManagerProfile();