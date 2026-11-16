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


**Base systems.** Life Support recycles oxygen and extracts water. Researching volatiles makes extraction more efficient. The Greenhouse requires separate planting, watering, and lighting. At the moisture radar, identify three dry plots and apply irrigation for 6 water and 2 energy, or 5 water after the OSDR upgrade. An irrigation run provides moisture for two days of normal growth. Shelter construction, system repairs, and engine repair share the same materials and parts. Stored battery energy can run essential systems at night.

**Rescue milestone.** Repair the engine to 100%, transmit 50 data, and report system status. The report earns 10 rescue budget and reaching 50 transmitted data earns 20 more. The rescue request spends 20 budget on confirmation. Request rescue in an optimal reception window or use the high-power request outside one. The science tally remains when you transmit data.

### Personal health and shared supplies

The base panel also tracks materials, spare parts, analyzed dust, and analyzed rock. The personal HUD uses ten hearts, ten food icons, and ten suit oxygen icons. Each icon represents up to ten points and fills partially.

Walking uses 0.18 nutrition per second inside and 0.24 outside. Driving uses 0.035 per second, and standing still uses none. An astronaut at zero nutrition loses health. Resting in the Bedroom restores 30 health with a 45-second cooldown. Pressing F in the Greenhouse uses 5 shared food and restores up to 35 personal nutrition.

A full suit buffer provides 20 seconds of protection before the tank starts draining. On foot without an upgrade, the tank loses 0.4 oxygen per second outdoors. At zero buffer and tank oxygen, the astronaut loses health. Returning to the base refills the tank and buffer over time using base oxygen.

The rover is available outside the airlock from the start. With charge remaining, it travels at 300 game units per second, compared with 85 on foot before upgrades. The Hangar recharge costs 10 shared energy and restores up to 35 percentage points of rover battery. Analyzed dust and rock can be used in the Workshop to upgrade the tank, boots, and headlamp.

Radiation zones give a warning and then directly damage astronauts in their radius. **Shelter → Reinforce EVA suits** costs 12 materials, 2 spare parts, and 6 energy and halves simulated outdoor exposure and storm contact damage. Personal damage and suit oxygen are calculated by the server in co-op.

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

The maintenance procedures in [`dist/operations.js`](dist/operations.js) give each repair or calibration a short hands-on task:

- **Power → Install battery.** Dock the unit, connect matching positive and negative terminals, and test continuity. One installation per expedition adds 35 energy and 35 reserve capacity. Any energy above the grid's capacity goes into the reserve.
- **Shelter → Repair rescue engine.** Check the pressure in each section, replace the damaged seal, and adjust both valves within tolerance. Each confirmed repair restores 50 percentage points of engine condition.
- **Laboratory → Analyze lunar samples.** Deposit dust or rocks, scan the tray, and classify three clear readings by comparing their three-channel patterns. A confirmed analysis consumes one deposited sample, 9 energy, and 1 CPU. It adds the science, data, and shared resources listed above. The training patterns are simulated.
- **Life Support → Repair air recycler.** Find the clogged filter, replace it, and rotate six ducts to restore airflow. Confirming restores up to 30 percentage points of efficiency, capped at 100%. A built workshop reduces the spare parts cost.
- **Power → Aim panels manually.** Adjust the angle toward the Sun until the output check shows enough alignment.
- **Laboratory → Search for ice and volatiles.** Use six readings per sweep to find the strongest signal, then drill and analyze a core. You can reset a sweep before committing resources.

The separate greenhouse moisture radar and antenna tracking procedures are described above. The procedures accept mouse, touch, or keyboard input. You can correct unsuccessful attempts, and canceling before confirmation preserves resources. The server or solo game rechecks resource availability upon confirmation. Only confirmed results enter the game state.

`npm run test:operations` checks the four core maintenance procedures in Edge, including incorrect attempts, cancellation, single confirmation, insufficient resources, keyboard controls, the workshop discount, and mobile layout.

## Online co-op and saving

Choose **Online Crew** to create a room or join with a room code. Firebase stores each room and its astronauts. A room can hold one to four players. The server manages the clock, resource changes, and damage, and reserves active modules to prevent conflicting operations.

Use **Save and return to menu** to keep your room and astronaut. Rejoin from the same browser with **Online Crew → Join**. The room is retained for 30 days from its last activity, and the game clock stops when everyone disconnects. **Leave room** releases your slot. Solo games save in the browser. To save a solo run online, create a room and launch it on your own.

See [the multiplayer setup guide](MULTIPLAYER.md) for local testing and Firebase configuration.

## NASA APIs

Opening the game automatically requests **DONKI and JPL Horizons** through the game server. Wait for **NASA connected**, open **Prepare mission · NASA APIs**, and choose a landing site. **Refresh API data** makes a new query. Simultaneous requests can share one in-flight operation.

The two landing sites are independent of the solar events. DONKI supplies records for the most recent 30 days in UTC. The game uses class C, M, and X records and, depending on the available records, assigns one or two distinct events to separate phases. The schedule remains hidden and is saved with the expedition. If the catalog contains no usable records, the game schedules no DONKI events.

### How to verify DONKI and when events occur

In **Prepare mission · NASA APIs** or the **Lunar environment and data sources** panel, open **View DONKI connection**. The panel lists:

- The endpoint, requested date range, query time, HTTP status, and access method.
- The number of records NASA returned and the number of usable C, M, and X events.
- Each detected event's ID, class, observation date, and link to the NASA record.
- The original JSON for detected events under **View DONKI records for detected events (JSON)**.

A scheduled phase starts with a warning period. Signal quality is affected during the phase. After 25 seconds, the event reduces panel health and increases outdoor exposure. Base safety also wears down during the active part of the event. A later, weaker event cannot restore panel health lost in an earlier event. The timing and effects are simulated using real records.

| Class | Panel health cap | Data per standard transmission during the event | Additional base safety loss rate without the third shelter |
| --- | ---: | ---: | ---: |
| C | 90% | 10 | 8 per full game day |
| M | 80% | 8 | 16 per full game day |
| X | 65% | 5 | 24 per full game day |

During the active event, ordinary storm wear adds another 4 safety points of loss per full game day. Building the third shelter removes the additional class-based loss. High-power transmission costs 25 energy and can send up to 30 data even during a storm. Solar generation remains zero at lunar night.

In the browser's developer tools, look for `/api/nasa` in **Network** to inspect the response that prepared the expedition. `/api/nasa/audit` can show the most recent successful query for the server instance without making a new NASA request. The responses omit the API key.

### NASA API key and endpoint

Copy `.env.example` to `.env` in the folder containing `package.json` and set:

```dotenv
NASA_API_KEY=YOUR_KEY
```

Restart `npm start`. The server reads the key. Git excludes `.env`, and the server serves browser files from `dist/`. With no key, the server queries the public [CCMC DONKI endpoint](https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR).

If the `https://api.nasa.gov/DONKI/FLR` gateway returns HTTP 404 or 410, the server retries through CCMC. The data panel reports the gateway status and the endpoint that supplied the records. Authentication, network, and formatting failures are surfaced to the player.

### Lunar maps and positions

- **Aurora** is at 0.674° N, 23.47° E. **Aurora East** is at 5° N, 30° E. These are fictional bases at real coordinates.
- Each site loads nine regional tiles from [Moon Trek WMTS](https://trek.nasa.gov/moon/). The LRO WAC mosaic is credited to NASA, GSFC, and Arizona State University. Zoom level 5 covers 16.875° on each side with north up. The service caches imagery and reports missing tiles for the selected region.
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) supplies reference positions from **May 17 to June 10, 2024**, sampled every four days. A June 14 sample supplies the next-position reference for the final phase. The cycle contains three daylight and four nighttime phases.
- The observer uses `coord@301`, east-positive longitude, and 0 km reference altitude. The apparent azimuth and elevation calculations omit atmospheric refraction and terrain shadows. The game links to the original Sun and Earth queries.
- For the panels, you adjust the elevation. Azimuth adjusts automatically. Output depends on alignment and panel health. Automatic tracking draws 4 energy per full game day.
- The antenna exercise uses a 28-second elliptical tracking path. Earth moves left to right, exits the screen, and returns from the left. Tracking progress resets when it wraps. The exercise uses a simulated path, while the locked calibration applies the remaining alignment error to the Horizons reference.
- Drag to aim with a mouse or touch, or use the arrow keys. Release the pointer to hold the angle. Keep Earth in the beam for four seconds, then save the locked alignment. Aiming is free. Transmitting requires energy.
- Optimal reception windows are assigned to phases 2, 4, and 6 of the reference cycle, subject to alignment, Earth elevation, and storm conditions.

Refreshing the NASA data changes the preparation screen. An expedition in progress keeps the data and event schedule it started with.

### Connection failures and the offline archive

If the initial request fails, select **Retry connection** or explicitly choose **Use offline mode (2024 archive)**. The archive includes two historical events and a global map. If a later refresh fails, the game shows the error and keeps the previous successful response with its timestamp. Online NASA data requires the local server or the deployed functions.

## Diviner and OSDR data and gameplay

Start a fresh expedition to use the most recently retrieved science data. The preparation screen reports each service's status. The environment panel includes the query time, thermal curve, crop protocol, and source links.

`GET /api/science` requests both public services in parallel with a 12-second timeout per HTTP request. Neither source requires an additional API key. Concurrent requests can share a single operation. If one source fails, the response keeps the source that succeeded and reports the other as unavailable. The retrieved data is stored with the expedition.

### Diviner

The [PDS Geosciences Diviner product](https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/) is `LRO-L-DLRE-5-GCP-V1.0`, table `global_cumul_avg_cyl_00n10n_002.tab`. HTTP Range requests read 96 rows for each selected 0.5° cell from the roughly 156 MB table. The selected cells are 23.25° E / 0.75° N and 30.25° E / 5.25° N. The server checks coordinates, row size, and order and ignores invalid temperatures such as `-9999`. The July 2009 to April 2015 data is averaged in quarter-hour bins of local solar time and records bolometric surface temperatures.

In **Life Support**, automatic mode targets 22 °C or the recorded OSDR temperature when its protocol is active. Eco mode targets 16 °C, and the system can be turned off. Insulation costs 12 materials, 2 spare parts, and 4 energy. It reduces thermal demand by 35% before rounding. In the simulation, leak pumps draw power before thermal control, the recycler, and crop lighting.

The educational model estimates the surface temperature as `minimum + (maximum - minimum) × sin(positive solar elevation)^0.25`. At night, the model uses the recorded minimum. Energy cost is based on the gap from the cabin setpoint, divided by 18 for heating or 35 for cooling, adjusted for insulation and eco mode, then rounded up. When thermal control is off or lacks power, cabin temperature moves toward the simulated surface temperature. Below 12 °C or above 30 °C, crop growth stops and the base loses safety and morale at rates of 12 and 6 points per full game day. If Diviner is unavailable, nighttime heating uses 14 energy per full game day.

### OSDR

The server uses [NASA OSDR dataset metadata](https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-267/) and an assay conditions CSV for [OSD-267](https://osdr.nasa.gov/bio/repo/data/studies/OSD-267). The VEG-01A study compared the microbiology and nutrition of lettuce grown on the ISS with Earth controls. The flight sample used 16 hours of light, 8 hours of darkness, an intensity of 200 µmol/m²/s, a recorded mean temperature of 23.25 °C, and harvest at 33 days.

In the **Greenhouse**, plant lettuce or an experiment and select **Apply OSD-267 protocol**. Lighting costs `ceil(8 × light hours ÷ 24)` energy per full game day, or 6 with the recorded light cycle. The crop also needs water. To validate the experiment, complete two days' worth of growth under the protocol with cabin temperature within 3 °C of the reference. The crop requires three growth units in total. Harvest yields 26 science and data, plus 10 more if the protocol was validated. A validated harvest reduces later irrigation costs from 6 to 5 water. Eco thermal mode allows standard growth but does not meet the experiment's temperature requirement. Growth duration, rewards, and irrigation savings are gameplay rules.

`science-tests.cjs` covers the PDS and CSV formats, missing data, incorrect units, partial outages, shared energy demand, experiment conditions, rewards, and persistence.

## Run locally

Install Node.js 22.9 or newer. From the folder containing `package.json`, run:

```sh
npm ci
npm start
```

Open [the local game](http://127.0.0.1:8765/). Press **Ctrl+C** to stop the server before restarting it. For a local NASA key, copy `.env.example` to `.env` and set `NASA_API_KEY`. Without a key, the server queries the public CCMC DONKI endpoint. The server also uses that endpoint when the NASA API gateway returns HTTP 404 or 410.

## Verification and source files

- `npm test` covers the game rules, the legacy deterministic engine scenarios, both landing sites, C/M/X events, empty DONKI responses, outages without an automatic archive fallback, gateway migration, key handling, hidden event schedules, persistence, and real-time survival.
- `npm run test:browser` runs the Playwright suite in Microsoft Edge. It starts a temporary local server on port 18769 and explicitly uses offline data for repeatable scenarios. It checks the English default, camera motion, rover and sample delivery, four-player rooms, module reservations, reconnection, saving, and mobile layout.
- `node verify-public.cjs https://lunar-guardians-aurora.netlify.app` checks the actual Netlify deployment in Edge, including NASA data, Moon Trek tiles, the NASA reference links, moving antenna target, and the absence of private server and credential files on the public site.
- `node netlify-tests.cjs` checks the Netlify function adapter. `node cozy-visual-tests.cjs` generates local screenshots of the menu, base, modules, exterior, and mobile layout.
- `npm run build` checks JavaScript syntax, generates the browser's Firebase and pixel art bundles, and checks the publish directory.

| File | Purpose |
| --- | --- |
| [`dist/engine.js`](dist/engine.js) and [`dist/realtime-core.js`](dist/realtime-core.js) | Resource rules and the shared real-time simulation |
| [`dist/game.js`](dist/game.js) and [`dist/world.js`](dist/world.js) | Game interface, saved games, movement, camera, and rendering |
| [`dist/minigames.js`](dist/minigames.js) and [`dist/operations.js`](dist/operations.js) | Irrigation, antenna tracking, and maintenance procedures |
| [`dist/nasa-ui.js`](dist/nasa-ui.js) and [`dist/nasa-snapshot.json`](dist/nasa-snapshot.json) | Mission preparation, API evidence, and the optional historical archive |
| [`nasa-service.cjs`](nasa-service.cjs), [`science-service.cjs`](science-service.cjs), and [`multiplayer-service.cjs`](multiplayer-service.cjs) | Data retrieval and online room services |
| [`server.cjs`](server.cjs) | Local server |
| [`dist/sources.js`](dist/sources.js) and [`dist/guia-extraida.txt`](dist/guia-extraida.txt) | References and extracted text from the original guide |

The repository retains `dist/app.js` and `dist/style.css` for reference. The current game loads its own scripts and styles through `dist/index.html`.

## Deploy to Netlify

The live game runs on the `lunar-guardians-aurora` project. [`netlify.toml`](netlify.toml) configures `npm run build`, the `dist/` publish directory, and the serverless functions under `netlify/functions/`.

With access to the Netlify project, run these commands from the repository root:

```sh
npx netlify login
npx netlify link --name lunar-guardians-aurora
npm run deploy:preview
```

After checking the preview, run `npm run deploy` to update production. Set `NASA_API_KEY`, `FIREBASE_WEB_CONFIG`, and `FIREBASE_SERVICE_ACCOUNT_BASE64` in the project's environment variables for the serverless functions. The local `.env` is ignored by Git. Keep private credentials out of `dist/` and the repository.


Netlify CLI builds and deploys the browser files and functions together. The production game is served from `dist/`. [`netlify/functions/nasa.mjs`](netlify/functions/nasa.mjs) handles `/api/nasa`, `/api/nasa/audit`, `/api/moon-tile`, and `/api/science`. [`netlify/functions/multiplayer.mjs`](netlify/functions/multiplayer.mjs) handles `/api/multiplayer/*`. The public game stays available independently of the developer's local server.

The CLI stores the project link locally in `.netlify/state.json`, which Git ignores. On another computer, install the project dependencies and link the project using the commands above. Updating a local `.env` does not update the Netlify project's environment variables. Edit those variables in Netlify and redeploy to apply changes.

Each upstream DONKI or Horizons request has an eight-second timeout. Retry from the mission setup screen if a request fails. Because serverless functions may run on different instances, `/api/nasa/audit` can return 404 if its instance has no successful query in memory. The complete evidence is included in the original `/api/nasa` response and stays with the expedition when you save.

## Visual style and audio

The game uses a top-down pixel art style with directional astronaut animations, a scrolling camera, labeled module entrances, an illuminated airlock, and a gray lunar landscape around the base. The HUD shows shared reserves at the top and each astronaut's hearts, nutrition, and suit oxygen below. Illustrated module screens show resource costs before you commit. In co-op, players use individual names and suit colors. The start menu adapts to smaller screens, and the antenna keeps its dedicated tracking display.

The visual design and procedural art were adapted from a teammate's prototype. [`art-source/PixelArtGenerator.ts`](art-source/PixelArtGenerator.ts) provides environment art, and [`art-source/CharacterArt.ts`](art-source/CharacterArt.ts) provides the character drawing routines. [`build.cjs`](build.cjs) converts those sources into Canvas assets without adding Phaser to the current engine. [`dist/cozy.js`](dist/cozy.js) draws the menu diorama, textures, windows, and lighting. [`dist/cozy.css`](dist/cozy.css) styles the interface, and [`dist/cozy-ui.js`](dist/cozy-ui.js) arranges the HUD.

Four background music tracks ship as local assets in [`dist/assets/music/`](dist/assets/music/). In **Settings**, players can change the track, lower the volume, mute the audio, or turn music off. Sound effects provide feedback during interactions and procedure completion.
