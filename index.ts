import {WorldCities, wcLocation, wcResult, WorldCities_server} from "./world-cities";
import express from "express";

let Athens: wcLocation = {
    latitude: 37.98,
    longitude: 23.72
}

let Berlin: wcLocation = {
    latitude: 52.52,
    longitude: 13.40
};

let London: wcLocation = {
    latitude: 51.50,
    longitude: 0.12
};

let Paris: wcLocation = {
    latitude: 48.85,
    longitude: 2.35
}

function buildOnce()
{
    let worldCities = new WorldCities();

    worldCities.createDatabase().then(value =>
    {
        console.log(value);

        let result: wcResult = worldCities.minimum({latitude: 37.38, longitude: 24.45});

        console.log(result);

        console.log(worldCities.minimum(Athens));
        console.log(worldCities.minimum(Berlin));
        console.log(worldCities.minimum(London));
        console.log(worldCities.minimum(Paris));
    });
}

//
export function asServer()
{
    let application = express();

    let wcServer = new WorldCities_server(application);

    wcServer.use();

    wcServer.start();
}

asServer();
