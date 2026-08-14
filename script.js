const league = {
    name: "Fantasy Football League",

    managers: [
        {
            name: "Trevor",
            championships: 4,
            wins: 137,
            playoffAppearances: 11
        },
        {
            name: "Ryan",
            championships: 2,
            wins: 124,
            playoffAppearances: 9
        },
        {
            name: "Jake",
            championships: 1,
            wins: 119,
            playoffAppearances: 8
        }
    ]
};

const championships = [
    {year: 2025, champion: "Taco Corp"},
    {year: 2024, champion: "Taco Corp"},
    {year: 2023, champion: "Mad Dog"},
    {year: 2022, champion: "Gage of Inches"},
    {year: 2021, champion: "Gage of Inches"},
    {year: 2020, champion: "Andy Reid Clock Management"},
    {year: 2019, champion: "Cousins Lover"},
    {year: 2018, champion: "Cawley"},
    {year: 2017, champion: "Vredenburg"},
];

const championshipWall = document.getElementById("championship-wall");

championships.forEach(championship => {

    const banner = document.createElement("div");

    banner.classList.add("championship-banner");

    banner.innerHTML = `
        <div class="banner-year">${championship.year}</div>
        <div class="banner-title">CHAMPION</div>
        <div class="banner-name">${championship.champion}</div>
    `;

    championshipWall.appendChild(banner);
});
console.log(league);
console.log(championships);

const draftDate = new Date("August 30, 2026 15:25:00").getTime();

function updateDraftCountdown() {

    const now = new Date().getTime();
    const distance = draftDate - now;

    if (distance <= 0) {
        document.getElementById("draft-countdown").innerHTML =
            "<strong>THE DRAFT IS HERE!</strong>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
        (distance % (1000 * 60)) /
        1000
    );

    document.getElementById("days").textContent =
        String(days).padStart(2, "0");

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");
}

updateDraftCountdown();

setInterval(updateDraftCountdown, 1000);