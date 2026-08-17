const fs = require("fs");
const path = require("path");

const season = process.argv[2];

if (!season) {
    console.error("Please provide a season.");
    console.error("Example: node tools/assign-managers.js 2024");
    process.exit(1);
}

// Manager assignments by season
const managerAssignments = {
    2018: {
        "Boycott  Nike": 10,
        "Andy Reid Clock MGMT": 2,
        "Team Lininger": 14,
        "Odells Zookeeper": 15,
        "Taco Corp": 1,
        "King of  The WESt": 7,
        "TD's for Harambe": 6,
        "Cousins  Lover": 5,
        "Joe Mixon's Right Hooks": 3,
        "Team All my fri ends aremarried": 9
    },

    2019: {
        "Hard Knocked Life": 10,
        "Andy Reid Clock MGMT": 2,
        "Team EJ": 13,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Legion of Zoom": 7,
        "TD's for Harambe": 6,
        "Cousins  Lover": 5,
        "Joe Mixon's Right Hooks": 3,
        "Team All my fri ends aremarried": 9
    },

    2020: {
        "Gage  Of Inches": 10,
        "Andy Reid Clock MGMT": 2,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Chubby Daks": 7,
        "TD's for Harambe": 6,
        "Cousins  Lover": 5,
        "Kicking and Kareeming": 3,
        "Team E. Jacksulation": 13,
        "TomBucsHisKids ***": 9
    },

    2021: {
        "Gage  Of Inches": 10,
        "Andy Reid Clock MGMT": 2,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Dicked Down in Dallas": 7,
        "TD's for Harambe": 6,
        "Cousins  Lover": 5,
        "Team Johnson": 3,
        "Tune Squad": 8,
        "TomBucsHisKids ***": 9
    },

    2022: {
        "Gage  Of Inches": 10,
        "Andy Reid Clock MGMT": 2,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Dicked Down in Dallas": 7,
        "TD's for Harambe": 6,
        "Cousins Lover": 5,
        "Team Johnson": 3,
        "Tune Squad": 8,
        "TomBucsHisKids ***": 9
    },
    
    2023: {
        "Gage  Of Inches": 10,
        "Andy Reid Clock MGMT": 2,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Dicked Down in Dallas": 7,
        "TD's for Harambe": 6,
        "Cousins  Lover": 5,
        "Kareem Pies": 3,
        "Tune Squad": 8,
        "A Shrimp Fried This Rice?": 12,
        "Milk": 4,
        "TomBucsHisKids ***": 9
    },
    
    2024: {
        "Gage of Inches": 10,
        "Andy Reid Clock MGMT": 2,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Dicked Down in Dallas": 7,
        "TD's for Harambe": 6,
        "Cousins Lover": 5,
        "JK Hates Jags": 3,
        "Tune Squad": 8,
        "That Was Legetteness": 12,
        "Milk": 4,
        "TomBucsHisKids ***": 9
    },

    2025: {
        "Gage  Of Inches": 10,
        "Andy Reid Clock MGMT": 2,
        "The Reid Rockets": 11,
        "Taco Corp": 1,
        "Dicked Down in Dallas": 7,
        "TD's for Harambe": 6,
        "Cousins  Lover": 5,
        "Travis Swifties": 9,
        "Bo-n*rs": 3,
        "Tune Squad": 8,
        "That Was Legetteness": 12,
        "TD Milk": 4
    }

};

if (!managerAssignments[season]) {
    console.error(`No manager assignments found for ${season}.`);
    process.exit(1);
}

const filePath = path.join(
    __dirname,
    "..",
    "data",
    `${season}.json`
);

const seasonData = JSON.parse(
    fs.readFileSync(filePath, "utf8")
);

seasonData.teams.forEach(team => {

    team.managerId = managerAssignments[season][team.name] || null;

});

fs.writeFileSync(
    filePath,
    JSON.stringify(seasonData, null, 2)
);

console.log(`Manager IDs assigned for ${season}!`);

seasonData.teams.forEach(team => {
    console.log(
        `${team.name} → managerId ${team.managerId}`
    );
});