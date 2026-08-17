console.log("MANAGERS JS LOADED");

fetch("data/managers.json")
    .then(response => response.json())
    .then(managers => {

        console.log("MANAGERS DATA:", managers);

        const container = document.getElementById("managers-container");

        managers.forEach(manager => {

            const card = document.createElement("div");

            card.className = "manager-page-card";

            card.innerHTML = `
                <img src="images/${manager.image}" alt="${manager.managerName}">

                <div class="manager-page-card-info">
                    <h2>${manager.managerName}</h2>
                    <p>${manager.teamName}</p>
                </div>
            `;

            // Make the card clickable
            card.addEventListener("click", () => {

                window.location.href =
                    `manager.html?id=${manager.managerId}`;

            });

            container.appendChild(card);
        });
    })
    .catch(error => {
        console.error("ERROR LOADING MANAGERS:", error);
    });