console.log("MANAGERS JS LOADED");

fetch("data/managers.json")
    .then(response => response.json())
    .then(managers => {
        console.log(managers);
    });