# world-cities

## Source

[World Cities Database](https://simplemaps.com/data/world-cities)

## Instalation

```shell
$ npm install world-cities
```

## Example

```typescript
import {WorldCities, wcLocation, wcResult} from "./world-cities";

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

let worldCities = new WorldCities();

worldCities.createDatabase(40).then(value =>
{
    console.log(value);

    let result: wcResult = worldCities.minimum({latitude: 37.38, longitude: 24.45});

    console.log(result);

    console.log(worldCities.minimum(Athens));
    console.log(worldCities.minimum(Berlin));
    console.log(worldCities.minimum(London));
    console.log(worldCities.minimum(Paris));
});
```

