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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const csv = __importStar(require("fast-csv"));
const path = __importStar(require("path"));
class WorldCities {
    constructor(tableName = "world_cities") {
        this.tableName = tableName;
        this.database = new better_sqlite3_1.default(path.join(__dirname, "database", "worldcities.db"), { verbose: console.log });
    }
    createDatabase(max_lines) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const db = new better_sqlite3_1.default(path.join(__dirname, "database", "worldcities.db"), { verbose: console.log });
                let current_line_ = 0;
                db.exec(`drop table if exists ${this.tableName}`);
                db.exec(`create table if not exists ${this.tableName} (id INTEGER PRIMARY KEY, city TEXT, city_ascii TEXT, latitude REAL, longitude REAL, country TEXT, alpha_2 TEXT, alpha_3 TEXT, admin_name TEXT, capital TEXT, population INTEGER)`);
                let statement = db.prepare(`insert into ${this.tableName} values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                let readStream = (0, fs_1.createReadStream)(path.join(__dirname, "database", "worldcities.csv")).pipe(csv.parse({ headers: true }));
                readStream.on("error", err => reject(err));
                readStream.on("data", chunk => {
                    if (current_line_ == max_lines) {
                        db.close();
                        resolve(current_line_);
                    }
                    else {
                        current_line_++;
                        let values_ = [parseInt(chunk["id"]), chunk["city"], chunk["city_ascii"], parseFloat(chunk["lat"]), parseFloat(chunk["lng"]), chunk["country"], chunk["iso2"], chunk["iso3"], chunk["admin_name"], chunk["capital"], parseInt(chunk["population"])];
                        statement.run(values_);
                    }
                });
                readStream.on("end", (rowCount) => resolve(rowCount));
            });
        });
    }
    minimum(location_) {
        let findStatement = this.database.prepare("select id, latitude, longitude from world_cities");
        let initial = findStatement.get();
        let currentMinimumDistance = WorldCities.haversine([location_, {
                latitude: initial["latitude"],
                longitude: initial["longitude"]
            }]), nearestCityId = initial["id"];
        for (let row of findStatement.iterate()) {
            let latitude = row["latitude"], longitude = row["longitude"];
            let distance_ = WorldCities.haversine([location_, { latitude, longitude }]);
            if ((distance_ < currentMinimumDistance)) {
                currentMinimumDistance = distance_;
                nearestCityId = row["id"];
            }
        }
        return Object.assign(Object.assign({}, this.database.prepare("select * from world_cities where id = ?").get(nearestCityId)), { distance: currentMinimumDistance });
    }
    static haversine(coordinates_array) {
        let deg2rad_ = Math.PI / 180;
        let coordinates_array_rad = [
            { latitude: coordinates_array[0].latitude * deg2rad_, longitude: coordinates_array[0].longitude * deg2rad_ },
            { latitude: coordinates_array[1].latitude * deg2rad_, longitude: coordinates_array[1].longitude * deg2rad_ }
        ];
        let radius = 6371008.7714;
        let deltaLatitude = coordinates_array_rad[1].latitude - coordinates_array_rad[0].latitude;
        let deltaLongitude = coordinates_array_rad[1].longitude - coordinates_array_rad[0].longitude;
        return 2. * radius * Math.asin(Math.sqrt(Math.sin(deltaLatitude / 2) ** 2 + Math.cos(coordinates_array_rad[0].latitude) * Math.cos(coordinates_array_rad[1].latitude) * Math.sin(deltaLongitude / 2) ** 2));
    }
}
let berlin = {
    latitude: 52.52,
    longitude: 13.40
};
let athens = {
    latitude: 37.9838,
    longitude: 23.72
};
let london = {
    latitude: 51.5072,
    longitude: 0.1276
};
let paris = {
    latitude: 48.8566,
    longitude: 2.3522
};
let wcities = new WorldCities();
(() => __awaiter(void 0, void 0, void 0, function* () {
    let f = yield wcities.createDatabase(100);
    console.log(wcities.minimum(paris));
    console.log(wcities.minimum(athens));
    console.log(wcities.minimum(berlin));
    console.log(wcities.minimum(london));
}))();
