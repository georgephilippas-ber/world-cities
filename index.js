"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asServer = void 0;
const world_cities_1 = require("./world-cities");
const express_1 = __importDefault(require("express"));
let Athens = {
    latitude: 37.98,
    longitude: 23.72
};
let Berlin = {
    latitude: 52.52,
    longitude: 13.40
};
let London = {
    latitude: 51.50,
    longitude: 0.12
};
let Paris = {
    latitude: 48.85,
    longitude: 2.35
};
function buildOnce() {
    let worldCities = new world_cities_1.WorldCities();
    worldCities.createDatabase().then(value => {
        console.log(value);
        let result = worldCities.minimum({ latitude: 37.38, longitude: 24.45 });
        console.log(result);
        console.log(worldCities.minimum(Athens));
        console.log(worldCities.minimum(Berlin));
        console.log(worldCities.minimum(London));
        console.log(worldCities.minimum(Paris));
    });
}
//
function asServer() {
    let application = (0, express_1.default)();
    let wcServer = new world_cities_1.WorldCities_server(application);
    wcServer.use();
    wcServer.start();
}
exports.asServer = asServer;
asServer();
