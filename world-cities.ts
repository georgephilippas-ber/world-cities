import express, {Express, Router} from "express";

import {createReadStream} from "fs";
import Database from "better-sqlite3";

import path from "path";

import * as csv from "fast-csv";
import {faker} from "@faker-js/faker";

export type wcLocation = { latitude: number; longitude: number };

export type wcResult =
    {
        id: number;
        city: string;
        city_ascii: string;
        latitude: number;
        longitude: number;
        country: string;
        alpha_2: string;
        alpha_3: string;
        admin_name: string;
        capital: string;
        population: number;
        distance: number;
    }

export class WorldCities_server
{
    endpoint: string;
    expressApplication: Express;

    router: Router;
    worldCities: WorldCities;

    constructor(expressApplication: Express, endpoint: string = "worldcities")
    {
        this.endpoint = endpoint;

        this.worldCities = new WorldCities();

        this.expressApplication = expressApplication;
        this.router = Router();
    }

    public createWorldCitiesRoute()
    {
        this.router.use(express.json());
        this.router.get("/minimum", (req, res) =>
        {
            const latitude = parseInt(req.query["latitude"] as string ?? ""),
                longitude = parseInt(req.query["longitude"] as string ?? "");

            if (isNaN(latitude) || isNaN(longitude))
                res.status(400).send();
            else
                res.send(this.worldCities.minimum({latitude, longitude}));
        });

        this.expressApplication.use("/" + this.endpoint, this.router);
    }

    start(port: number = 0x2000)
    {
        let wcServer = this.expressApplication.listen(port, () =>
        {
            console.log("WorldCities");

            console.log("http://localhost:" + port + `/worldcities/minimum?latitude=${faker.address.latitude()}&longitude=${faker.address.longitude()}`)
        });

        process.on("SIGINT", args =>
        {
            console.log();
            console.log("!WorldCities");

            wcServer.close();
        });
    }
}

export class WorldCities
{
    database: Database.Database;

    tableName: string;

    constructor(tableName: string = "world_cities")
    {
        this.tableName = tableName;

        this.database = new Database(path.join(__dirname, "database", "worldcities.db"));
    }

    async createDatabase(max_lines?: number): Promise<number>
    {
        return new Promise<number>((resolve, reject) =>
        {

            const db = new Database(path.join(__dirname, "database", "worldcities.db"));

            let current_line_: number = 0;

            db.exec(`drop table if exists ${this.tableName}`);
            db.exec(`create table if not exists ${this.tableName} (id INTEGER PRIMARY KEY, city TEXT, city_ascii TEXT, latitude REAL, longitude REAL, country TEXT, alpha_2 TEXT, alpha_3 TEXT, admin_name TEXT, capital TEXT, population INTEGER)`);

            let statement = db.prepare(`insert into ${this.tableName} values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            let readStream = createReadStream(path.join(__dirname, "database", "worldcities.csv")).pipe(csv.parse({headers: true}));

            readStream.on("error", err => reject(err))
            readStream.on("data", chunk =>
            {
                if (current_line_ == max_lines)
                {
                    db.close();

                    resolve(current_line_);
                } else
                {
                    current_line_++;

                    let values_ = [parseInt(chunk["id"]), chunk["city"], chunk["city_ascii"], parseFloat(chunk["lat"]), parseFloat(chunk["lng"]), chunk["country"], chunk["iso2"], chunk["iso3"], chunk["admin_name"], chunk["capital"], parseInt(chunk["population"])];

                    console.log(current_line_, values_[1]);

                    statement.run(values_);
                }
            });
            readStream.on("end", (rowCount: number) => resolve(rowCount));
        });
    }

    minimum(location_: wcLocation): wcResult
    {
        let findStatement = this.database.prepare("select id, latitude, longitude from world_cities");

        let initial = findStatement.get();

        let currentMinimumDistance: number = WorldCities.haversine([location_, {
            latitude: initial["latitude"],
            longitude: initial["longitude"]
        }]), nearestCityId: number = initial["id"];

        for (let row of findStatement.iterate())
        {
            let latitude = row["latitude"], longitude = row["longitude"];

            let distance_: number = WorldCities.haversine([location_, {latitude, longitude}]);

            if ((distance_ < currentMinimumDistance))
            {
                currentMinimumDistance = distance_;
                nearestCityId = row["id"];
            }
        }

        return {
            ...this.database.prepare("select * from world_cities where id = ?").get(nearestCityId),
            distance: currentMinimumDistance
        };
    }

    static haversine(coordinates_array: wcLocation[]): number
    {
        let deg2rad_: number = Math.PI / 180;

        let coordinates_array_rad: wcLocation[] = [
            {latitude: coordinates_array[0].latitude * deg2rad_, longitude: coordinates_array[0].longitude * deg2rad_},
            {latitude: coordinates_array[1].latitude * deg2rad_, longitude: coordinates_array[1].longitude * deg2rad_}
        ];

        let radius: number = 6371008.7714;

        let deltaLatitude = coordinates_array_rad[1].latitude - coordinates_array_rad[0].latitude;
        let deltaLongitude = coordinates_array_rad[1].longitude - coordinates_array_rad[0].longitude;

        return 2. * radius * Math.asin(Math.sqrt(
            Math.sin(deltaLatitude / 2) ** 2 + Math.cos(coordinates_array_rad[0].latitude) * Math.cos(coordinates_array_rad[1].latitude) * Math.sin(deltaLongitude / 2) ** 2
        ))
    }
}
