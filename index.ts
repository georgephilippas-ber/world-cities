import {createReadStream} from "fs";

import Database from "better-sqlite3";

import * as csv from 'fast-csv';
import * as path from "path";

function createDatabase(table: string = "world_cities", max_lines?: number)
{
    const db = new Database(path.join(__dirname, "database", "worldcities.db"), {verbose: console.log});

    let current_line_: number = 0;

    db.exec(`drop table if exists ${table}`);
    db.exec(`create table if not exists ${table} (id INTEGER PRIMARY KEY, city TEXT, city_ascii TEXT, latitude REAL, longitude REAL, country TEXT, alpha_2 TEXT, alpha_3 TEXT, admin_name TEXT, capital TEXT, population INTEGER)`);

    let statement = db.prepare(`insert into ${table} values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    createReadStream(path.join(__dirname, "database", "worldcities.csv")).pipe(csv.parse({headers: true})).on("error", err => console.log(err)).on("data", chunk =>
    {
        if (current_line_++ == max_lines)
        {
            db.close();

            process.exit();
        }

        let values_ = [parseInt(chunk["id"]), chunk["city"], chunk["city_ascii"], parseFloat(chunk["lat"]), parseFloat(chunk["lng"]), chunk["country"], chunk["iso2"], chunk["iso3"], chunk["admin_name"], chunk["capital"], parseInt(chunk["population"])];

        statement.run(values_);
    }).on("end", (rowCount: number) => console.log(rowCount));
}

//createDatabase(undefined, 0xff);

class WorldCities
{
    database: Database.Database;

    constructor()
    {
        this.database = new Database(path.join(__dirname, "database", "worldcities.db"), {verbose: console.log});

        let f = this.database.prepare("select * from world_cities").get();

        console.log(f);
    }


}
