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

        // Manager header
        document.getElementById("manager-name").textContent =
            manager.managerName;

        document.getElementById("manager-team").textContent =
            manager.teamName;

        document.getElementById("manager-image").src =
            `images/${manager.image}`;

        document.getElementById("manager-image").alt =
            manager.managerName;


        // Career statistics
        document.getElementById("championships").textContent =
            manager.championships;

        document.getElementById("career-record").textContent =
            `${manager.careerWins}-${manager.careerLosses}`;

        document.getElementById("best-season").textContent =
            `${manager.bestRegularSeason.wins}-${manager.bestRegularSeason.losses}`;


        // Career points
        const careerPoints = manager.history.reduce(
            (total, season) => total + season.pointsFor,
            0
        );

        document.getElementById("career-points").textContent =
            careerPoints.toFixed(2);


    } catch (error) {

        console.error("ERROR LOADING MANAGER PROFILE:", error);

    }

}

loadManagerProfile();