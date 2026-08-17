console.log("MANAGER PROFILE JS LOADED");

const params = new URLSearchParams(window.location.search);

const managerId = Number(params.get("id"));

console.log("MANAGER ID:", managerId);

fetch("data/managers.json")
    .then(response => response.json())
    .then(managers => {

        const manager = managers.find(
            manager => manager.managerId === managerId
        );

        if (!manager) {
            console.error("Manager not found.");
            return;
        }

        console.log("MANAGER:", manager);

        document.getElementById("manager-name").textContent =
            manager.managerName;

        document.getElementById("manager-team").textContent =
            manager.teamName;

    })
    .catch(error => {
        console.error("ERROR LOADING MANAGER:", error);
    });