# Lunar Guardians

**Lunar Guardians** is a 2D pixel art survival game for one astronaut or an online crew of up to four. You operate a lunar base, cross the surface on foot or by rover, and bring lunar dust and rock samples back to the lab. Your crew shares the base's supplies, so every use of energy, water, or spare parts affects what everyone can do next.

[Play Lunar Guardians](https://lunar-guardians-aurora.netlify.app/)

## Real-time survival

Your goal is to keep the base and crew alive for as many days as possible. Each day lasts **three minutes of gameplay**. Supplies, crops, and hazards change continuously, including while you work at a console. Resource demand and outdoor danger increase every three days. The seven reference phases repeat as a simulation cycle. Repairing the rescue engine and confirming rescue are optional milestones that you can complete during a longer run.

1. **Get an assignment at the Command Center.** In co-op, each astronaut has a personal assignment and can operate every module.
2. **Collect lunar dust or rock samples outside.** Use the rover to reach distant sites faster and return through the airlock before your suit oxygen runs low. Stay clear of marked radiation zones when they activate.
3. **Deposit and analyze your samples in the Laboratory.** Analyzing a sample adds 20 science, 20 data, 8 materials, 2 spare parts, and 4 safety to the shared base. Once your assigned sample is analyzed, return to the Command Center for the next mission.
4. **Keep the base running.** Aim the solar panels and store energy for lunar night, repair the air recycler and extract water, grow and harvest food, reinforce the shelter, and transmit science data to Earth.

The shared HUD shows base energy, food, oxygen, water, safety, science, and environmental radiation. Each astronaut has separate health, nutrition, and suit oxygen. Rest in the Bedroom to recover health, eat a ration in the Greenhouse, and return to the base to refill your suit. Zero health permanently removes that astronaut from the run. The expedition ends when the crew is lost, an essential base supply runs out, or both grid energy and the battery reserve reach zero.

English is the default language. Settings includes camera zoom, four music tracks, and volume controls. The camera follows the astronaut as they move across the base and the lunar surface.

## Controls

| Control | Action |
| --- | --- |
| WASD or arrow keys | Move |
| E | Use a console or the airlock, or collect a sample nearby |
| R | Board or leave the rover |
| F | Eat a ration in the Greenhouse |
| J | Open the logbook |
| Esc | Open the menu |
| 1–4 | Switch characters in solo play |

## Interactive operations

| Module | Procedure |
| --- | --- |
| Power | Aim the solar panels or install the precharged auxiliary battery by matching terminals and testing continuity. Installation adds 35 energy and 35 units of reserve capacity. Surplus energy goes into the reserve. |
| Life Support | Replace a clogged filter and rotate ducts to restore airflow. |
| Greenhouse | Scan for dry plots and water them. Crops depend on water, light, and suitable cabin temperature. |
| Laboratory | Compare simulated sample signatures or search for volatiles to improve water extraction. |
| Shelter | Find a pressure leak, replace the damaged seal, and balance the valves to repair the rescue engine. |
| Telecommunications | Track Earth inside the antenna beam for four seconds. The view locks when you succeed so you can save the alignment. |

Procedures apply their costs and rewards when you confirm. Canceling before confirmation leaves resources intact. Decisions draw from shared supplies in real time.

## Online co-op and saving

Choose **Online Crew** to create a room or join with a room code. Firebase stores each room and its astronauts. A room can hold one to four players. The server manages the clock, resource changes, and damage, and reserves active modules to prevent conflicting operations.

Use **Save and return to menu** to keep your room and astronaut. Rejoin from the same browser with **Online Crew → Join**. The room is retained for 30 days from its last activity, and the game clock stops when everyone disconnects. **Leave room** releases your slot. Solo games save in the browser. To save a solo run online, create a room and launch it on your own.

See [the multiplayer setup guide](MULTIPLAYER.md) for local testing and Firebase configuration.

## NASA data

**Prepare mission · NASA APIs** lets you choose Aurora or Aurora East and inspect the data used in the simulation. The game requests NASA data through its server and saves the selected data with the expedition.

| Data source | How the game uses it |
| --- | --- |
| [DONKI](https://ccmc.gsfc.nasa.gov/DONKI/) | Recent solar flare records supply surprise events that affect panels, communications, and radiation. The data panel shows the query period and links to records for events the crew has already encountered. |
| [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | Sun and Earth elevations from a May–June 2024 reference window inform solar generation and antenna alignment. |
| [Moon Trek](https://trek.nasa.gov/moon/) | Regional LRO WAC imagery shows the terrain around each fictional landing site. |
| [LRO Diviner](https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/) | Historical surface temperature measurements inform the simulated energy cost of heating and cooling the cabin. |
| [NASA Open Science Data Repository, OSD-267](https://osdr.nasa.gov/bio/repo/data/studies/OSD-267) | A lettuce study aboard the ISS provides a reference for the greenhouse's light cycle and temperature. Completing the simulated protocol earns additional science and improves irrigation efficiency. |

The game replays documented solar events within its reference cycle. Event timing, radiation, and resource effects are simulated. If the initial NASA request fails, choose **Retry connection** or explicitly select **Use offline mode (2024 archive)**.

## Run locally

Install Node.js 22.9 or newer. From the folder containing `package.json`, run:

```sh
npm ci
npm start
```

Open [the local game](http://127.0.0.1:8765/). Press **Ctrl+C** to stop the server before restarting it. For a local NASA key, copy `.env.example` to `.env` and set `NASA_API_KEY`. Without a key, the server queries the public CCMC DONKI endpoint. The server also uses that endpoint when the NASA API gateway returns HTTP 404 or 410.

## Verification and source files

| Command | What it checks |
| --- | --- |
| `npm test` | Game rules, NASA integrations, multiplayer logic, and real-time survival |
| `npm run test:browser` | Solo and four-player flows, missions, reconnection, and mobile layout in Edge |
| `npm run test:operations` | Interactive maintenance procedures, resource costs, cancellation, and keyboard controls in Edge |
| `npm run build` | JavaScript syntax, browser assets, and the published folder |

- [`dist/`](dist/) contains the browser game, its rules, minigames, and NASA interface.
- [`art-source/`](art-source/) contains the procedural pixel art used to build the Canvas assets.
- [`netlify/functions/`](netlify/functions/) exposes the NASA, science, map, and multiplayer routes in production.
- [`server.cjs`](server.cjs) runs the local game. [`nasa-service.cjs`](nasa-service.cjs), [`science-service.cjs`](science-service.cjs), and [`multiplayer-service.cjs`](multiplayer-service.cjs) implement the shared services.

## Deploy to Netlify

The live game runs on the `lunar-guardians-aurora` project. [`netlify.toml`](netlify.toml) configures `npm run build`, the `dist/` publish directory, and the serverless functions under `netlify/functions/`.

With access to the Netlify project, run these commands from the repository root:

```sh
npx netlify login
npx netlify link --name lunar-guardians-aurora
npm run deploy:preview
```

After checking the preview, run `npm run deploy` to update production. Set `NASA_API_KEY`, `FIREBASE_WEB_CONFIG`, and `FIREBASE_SERVICE_ACCOUNT_BASE64` in the project's environment variables for the serverless functions. The local `.env` is ignored by Git. Keep private credentials out of `dist/` and the repository.

## Art and audio

The game adapts the procedural pixel art and visual design contributed by a teammate. [`build.cjs`](build.cjs) converts the art sources into browser assets. The four music tracks are served with the game.
