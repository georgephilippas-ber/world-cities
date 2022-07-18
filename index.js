"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const csv = __importStar(require("fast-csv"));
const path = __importStar(require("path"));
function createDatabase(table = "world_cities", max_lines) {
    const db = new better_sqlite3_1.default(path.join(__dirname, "database", "worldcities.db"), { verbose: console.log });
    let current_line_ = 0;
    db.exec(`drop table if exists ${table}`);
    db.exec(`create table if not exists ${table} (id INTEGER PRIMARY KEY, city TEXT, city_ascii TEXT, latitude REAL, longitude REAL, country TEXT, alpha_2 TEXT, alpha_3 TEXT, admin_name TEXT, capital TEXT, population INTEGER)`);
    let statement = db.prepare(`insert into ${table} values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    (0, fs_1.createReadStream)(path.join(__dirname, "database", "worldcities.csv")).pipe(csv.parse({ headers: true })).on("error", err => console.log(err)).on("data", chunk => {
        if (current_line_++ == max_lines) {
            db.close();
            process.exit();
        }
        let values_ = [parseInt(chunk["id"]), chunk["city"], chunk["city_ascii"], parseFloat(chunk["lat"]), parseFloat(chunk["lng"]), chunk["country"], chunk["iso2"], chunk["iso3"], chunk["admin_name"], chunk["capital"], parseInt(chunk["population"])];
        statement.run(values_);
    }).on("end", (rowCount) => console.log(rowCount));
}
createDatabase(undefined, 10);
