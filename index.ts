import {WorldCities, wcLocation, wcResult} from "./world-cities";

let Berlin: wcLocation = {
    latitude: 52.52,
    longitude: 13.40
};

let Athens: wcLocation = {
    latitude: 37.9838,
    longitude: 23.72
}

let London: wcLocation = {
    latitude: 51.5072,
    longitude: 0.1276
};

let Paris: wcLocation = {
    latitude: 48.8566,
    longitude: 2.3522
}

let worldCities = new WorldCities();


worldCities.createDatabase(100).then(value =>
{
    console.log(value);
});
