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

        document.getElementById("manager-name").textContent =
            manager.managerName;

        document.getElementById("manager-team").textContent =
            manager.teamName;

    } catch (error) {

        console.error("ERROR LOADING MANAGER PROFILE:", error);

    }

}

loadManagerProfile();