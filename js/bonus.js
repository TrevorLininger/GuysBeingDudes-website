console.log("BONUS JS LOADED");

fetch("data/bonus.json")
    .then(response => response.json())
    .then(bonuses => {

        console.log("BONUS DATA:", bonuses);

        const container =
            document.getElementById(
                "weekly-bonuses-container"
            );


        if (!container) {

            console.error(
                "Could not find weekly-bonuses-container"
            );

            return;

        }


        bonuses.forEach(bonus => {

            const card =
                document.createElement("div");


            card.className =
                "weekly-bonus-card";


            card.innerHTML = `

                <div class="weekly-bonus-image">

                    ${
                        bonus.image
                            ? `<img
                                src="images/${bonus.image}"
                                alt="${bonus.name}"
                              >`
                            : ""
                    }

                </div>


                <div class="weekly-bonus-info">

                    <h3>
                        WEEK ${bonus.week}: ${bonus.name}
                    </h3>

                    <p>
                        ${bonus.description}
                    </p>

                </div>


                <div class="weekly-bonus-stat">

                    <strong>
                        ${bonus.entries}
                    </strong>

                    <span>
                        ENTERED
                    </span>

                </div>


                <div class="weekly-bonus-stat">

                    <strong>
                        $${bonus.payout}
                    </strong>

                    <span>
                        PAYOUT
                    </span>

                </div>

            `;


            container.appendChild(card);

        });

    })

    .catch(error => {

        console.error(
            "ERROR LOADING BONUSES:",
            error
        );

    });