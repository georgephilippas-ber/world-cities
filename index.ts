import {createReadStream} from "fs";

import Database from "better-sqlite3";

import * as csv from 'fast-csv';
import * as path from "path";

function createDatabase(table: string = "world_cities")
{
    const db = new Database(path.join(__dirname, "database", "worldcities.db"), {verbose: console.log});

    db.exec(`drop table if exists ${table}`);
    db.exec(`create table if not exists ${table} (city TEXT, city_ascii TEXT, latitude REAL, longitude REAL, country TEXT, alpha_2 TEXT, alpha_3 TEXT, admin_name TEXT, capital TEXT, population INTEGER, id INTEGER PRIMARY KEY)`);

    let statement = db.prepare(`insert into ${table} values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    createReadStream(path.join(__dirname, "database", "worldcities.csv")).pipe(csv.parse({headers: true})).on("error", err => console.log(err)).on("data", chunk =>
    {
        statement.run(Object.values(chunk));
    }).on("end", (rowCount: number) => console.log(rowCount));
}

createDatabase();
