# Lunar Guardians

2D Canvas game about lunar exploration, solo or online co-op for up to four players. Open the folder in VS Code and run `npm start` (from the root or lunar-guardians); visit http://127.0.0.1:8765. You can also use F5 with the project configuration. Stop the previous server with Ctrl+C before restarting it. Node.js 22.9 or later; run `npm install` the first time.

## Real-time continuous exploration version

- Pixel art aesthetics and directional animations, base with eight modules, music (four tracks), controls and ES/EN menus. The scientific texts and detailed procedures remain in Spanish.
- Mission Control assigns two expeditions: collect samples and explore a beacon. The rover is available from the start next to the exterior exit. Return through the airlock to deliver your findings: they generate science, data and resources for the original modules.
- WASD/arrows: walk. E: console, pick up or airlock. R: get in/out of the rover. J: log. Esc: menu. In solo mode, 1-4 switches character. Online each player enters their name and receives a color; they can use all modules.
- Each phase lasts 110 seconds (compressed game time, not a real lunar day). Energy, air, water, food and crops evolve continuously, even during minigames and menus. There is no button to end the turn. The mission lasts seven phases; the screen shows remaining time and objectives.
- Bedroom: recovers 30 health without consuming food, with 45 seconds between rests. Crops: F consumes 5 food from the reserve and recovers 35 personal food. Workshop: build improved tank, boots and flashlight using exterior mineral/ice; recharges rover for 10 energy.
- Exterior exposure zones are signaled before activating. Radiation and health are game indicators, not predictions or scientific doses. Documented DONKI crises are preserved and worsen exposure and systems.
- Victory: 60 science, engine at 100%, 50 data sent, report delivered and rescue confirmed. Excursions help; you still need to manage the modules and their minigames.
- Multiplayer: Firebase keeps rooms and names. The server computes the clock, resources, deliveries and damage, with module reservations to prevent incompatible simultaneous decisions. With no players connected, the clock stops. A disconnected slot can reconnect using the same session.

Current tests: `node realtime-tests.cjs`, `node realtime-browser-tests.cjs`, `npm run test:operations`. The deterministic browser scenarios explicitly choose offline data; normal operation queries NASA. The old turn-based tests are kept as a reference of the previous engine.

Procedural art, layout and audio adapted from the teammate's version in `otra version del juego/juegos-main`; the reference code is kept unmodified. The four audio tracks are distributed as local resources.

## Publishing updates to Netlify

Linked site: https://lunar-guardians-aurora.netlify.app/

The game is served from `dist`. The four routes `/api/nasa`, `/api/nasa/audit`, `/api/moon-tile` and `/api/science` run in `netlify/functions/nasa.mjs`, reusing `nasa-service.cjs`. They do not depend on your computer being on. `npm start` keeps the local behavior.

From the NASA SPEACE root or from lunar-guardians:

```powershell
npm run deploy:preview
```

Check the preview URL. To update the public link:

```powershell
npm run deploy
```

Netlify CLI builds and uploads the game and its functions. Do not just drag `dist` into the dashboard: that does not publish these functions. The site is linked locally in `.netlify/state.json` (not shared via Git). On another computer, install dependencies inside lunar-guardians, run `npx netlify login` and `npx netlify link --name superb-travesseiro-23b15a` with an account that has access.

`NASA_API_KEY` is configured in Netlify as a private variable for production and previews. Changing the local `.env` does not automatically update that variable: change it in the project's Netlify Environment variables and redeploy. Do not paste the key into `netlify.toml` or into `dist`.

The api.nasa.gov gateway may respond 404; the service then queries the official CCMC API and reports it in the evidence. It does not substitute network errors with local files.

DONKI/Horizons requests have an 8-second limit so the whole set of queries stays within a synchronous function's time. If there is an error, retry from mission preparation.

In Netlify, `/api/nasa/audit` can only return the last query of the instance serving the request: a new instance returns an informative 404. The complete and reliable evidence of each mission travels in `/api/nasa` and is stored in the game, without depending on that temporary memory.

Additional verification: `node netlify-tests.cjs` tests the adapter. `node verify-public.cjs https://YOUR-SITE.netlify.app` checks the real deployment with Edge, NASA, maps and that `.env` and the server files are not public.

## NASA APIs: current behavior

When the game opens, **DONKI and JPL Horizons are queried automatically** through the local server. Wait for the "NASA connected" indicator, open **Prepare mission · NASA APIs** and select the location; events are not chosen. "Query APIs again" performs a new query, it does not use the old 24-hour cache. Simultaneous requests share a single operation.

There are **two landing locations**, distinct from the **solar events**: these come from the DONKI response of the last 30 UTC days. The C/M/X catalog automatically feeds the crises. At start, one or two are drawn, from different records and at different phases. The amount and schedule are not announced. They are preserved on save/load: reloading does not reshuffle them. An empty response is valid and produces a mission without a solar crisis. No fictional events are generated to fill the selector.

### How to verify DONKI and when the crisis happens

In Prepare mission or Environment and NASA connection, press **View query evidence**. It shows:

- Queried endpoint, date range, query time and HTTP status.
- Number of records received and usable events.
- ID, class and date of crises already detected, with a link to their NASA record. Future events remain hidden in the interface.
- Original JSON of the records of already detected crises, collapsible.

Crises are recreated **in surprise turns**: an alert upon entering the turn lets you react before closing it. Each crisis immediately affects transmission; when that turn closes, panel damage and crew exposure are applied. The HUD announces the turn and the log keeps the DONKI ID. The closing projection does not reveal alerts for future turns. A less intense crisis does not repair panels damaged by a previous one. The effects are simulated; the date observed by NASA is not presented as a prediction of impact on the base.

| Class | Panels after the crisis | Data per normal transmission during alert | Safety loss per unprotected crew member |
| --- | ---: | ---: | ---: |
| C | 90% | 10 | 8 |
| M | 80% | 8 | 16 |
| X | 65% | 5 | 24 |

There are 4 common wear during the alert. Extra power preserves 30 data for 25 energy. A third shelter protects all four crew members. During the night generation is already zero, regardless of solar damage.

The server's last full response can be inspected at `/api/nasa/audit`, with its dates; it does not start another query. In the browser tools, Network → `/api/nasa` lets you see the query that prepared the mission. Keys are never included in these responses.

### API key and official endpoint

Put your key in `lunar-guardians/.env`:

```dotenv
NASA_API_KEY=YOUR_KEY
```

Restart `npm start`. The key is not sent to the browser nor served from `dist`; `.env` is excluded from Git. Without a key, the public CCMC service is queried directly.

If the gateway `https://api.nasa.gov/DONKI/FLR` responds 404 or 410, the server queries the **active official API** `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR`, which requires no key. The screen reports the gateway code and the endpoint actually used. This is another internet query, not a replacement file. Authentication, network or format errors are shown as failure; they are not hidden as success.

### Lunar map and positions

- Aurora: 0.674° N, 23.47° E. Aurora Este: 5° N, 30° E. They are fictional bases at real coordinates.
- Each location loads nine different regional tiles from **Moon Trek WMTS**, LRO WAC, NASA/GSFC/Arizona State University. Zoom 5, region 16.875° per side; north up. The mosaic is an archive product queried by API, not a live camera. Immutable tiles are cached temporarily to avoid repeated downloads. A map failure is indicated without substituting another region.
- Changing location changes terrain and geometry. DONKI crises are assigned automatically; there is no disaster selector.
- Horizons is queried for the training calendar **May 17–June 10, 2024**, with samples every four days; an eighth sample on June 14 allows animating the last turn. It keeps the mission's three daytime and four nighttime turns. They are calculations obtained by API for those dates, not today's positions.
- Observer `coord@301`, positive longitude east, reference altitude 0 km; apparent elevation/azimuth without atmosphere. Original queries linked on screen. No mountain shadows.
- Panels: you adjust elevation from the normal; azimuth is automatic. Generation depends on orientation error and panel health; automatic tracking costs 4 energy per turn.
- Antenna: you adjust elevation, azimuth is automatic. Earth travels an elliptical arc from left to right in 28-second cycles. It fully exits the right edge and reappears from the left without reversing direction; upon reappearing, tracking time resets. It is a **training trajectory**, not the real movement of Earth as seen from the lunar base. The residual tracking error at save is kept relative to that turn's target.
- Antenna with mouse/touch: press and hold and drag; direction is kept on release. Arrows also work. Alignment lasts **4 seconds**; then the view freezes to save without accidentally moving the antenna. Saving costs one action; canceling costs nothing.

DONKI uses recent observations recreated in the training calendar. It is not claimed that the two dates coincide. Saving keeps the data used by that expedition; refreshing APIs does not change a game in progress.

### Connection failures

Normal mode **does not automatically load the local copy**. If the initial query fails, starting is blocked until you retry or explicitly choose **Offline mode (2024 archive)**. This mode keeps the two historical events and a global map, clearly identified as archive. If an update fails after a successful query, it is reported and the previous selection is kept with its date.

Old games keep their rules. To use the new integration, start a new expedition. Static hosting only allows choosing the archive mode: it needs `server.cjs` and its routes running for the APIs. Do not publish `.env`.

## Controls and objective

WASD/arrows: move. E: console. 1-4: crew member. Esc: menu. Solo mode with character switching and co-op mode of up to four sessions. Public co-op connection requires configuring Firebase; see MULTIPLAYER.md.

Survive seven turns with oxygen, water, food and safety positive; achieve 60 science, engine 100%, 50 data delivered, report sent and rescue confirmed. You have four actions per turn (five with morale ≥85) and three CPUs. Laboratory produces science and data; comms delivers data without erasing science. The first two missions from Earth provide budget for rescue. Optimal reception on turns 2/4/6, with antenna aligned and no crises; they are assigned schedules, not Earth occultations.

Life support recycles air and extracts water using energy; research volatiles to improve extraction. Crops require sowing, separate watering and light. The humidity radar lets you water three dry zones: confirming costs 6 water, 2 energy and one action, and provides humidity for two turns of growth. Shelters, repairs and engine compete for materials. Batteries sustain nighttime services. The closing forecast shows consumption and consequences before confirming.

## Verification and files

`npm test`: original rules, winning runs in both locations and C/M/X classes, empty DONKI response, connection error without silent replacement, key protection, 404 migration, persistent surprise scheduling, absence of early warnings and visible movement.

`npm run test:browser` from lunar-guardians: Playwright with Edge installed, temporary server 18765. Checks real connection, DONKI evidence, distinct maps, visibly moving Earth, two surprise alerts, four seconds, pointer release, single cost, canceling, saving, network failure and explicit archive. Requires internet and `npm install` for the development dependencies.

`dist/engine.js`: rules. `game.js`: game and saving. `minigames.js`: watering/antenna. `nasa-ui.js`: preparation and evidence. `nasa-service.cjs`: server APIs. `nasa-snapshot.*`: archive for explicit offline mode. `sources.js`, `guia-extraida.txt`: original guide references. `server.cjs`: local server. `app.js` and `style.css` belong to the old version and are not loaded.

## Diviner and OSDR: queried data and mechanics

Start a **new expedition** to incorporate these sources. Previous games keep their rules and are not modified when reconnecting. In "Prepare mission" the status of each service is shown; in "Environment and NASA connection" you find the links, date, thermal curve and protocol.

`GET /api/science` queries both public services in parallel, with a 12-second maximum per request. They need no other API key: `NASA_API_KEY` remains only in the local `.env` / private Netlify variables for DONKI. Simultaneous requests are grouped, but a failed query is not replaced with a previous copy. A partial failure keeps the service that did respond and shows the other as unavailable. Each expedition's data is saved to reproduce its rules.

### Diviner

Source: PDS Geosciences, product `LRO-L-DLRE-5-GCP-V1.0`, table `global_cumul_avg_cyl_00n10n_002.tab`. The 96 rows of each 0.5° cell are read via HTTP Range/206 (23.25° E / 0.75° N and 30.25° E / 5.25° N), validating coordinates, size and order. Invalid bolometric temperatures are ignored, including -9999; the 156 MB file is not downloaded. Data from July 2009 to April 2015, averages per 0.25 local solar hour interval. They are **surface** temperatures, not air or current telemetry.

In **Life support**: automatic control (22 °C, or OSDR temperature when using its protocol), eco mode (16 °C), off, and insulation (12 materials, 2 parts, 4 energy, 1 action). Shared energy: pumps → thermal control → recycler → crops. Insulation reduces demand by 35% before rounding.

Pedagogical model: estimated surface = Diviner minimum + (maximum − minimum) × sin(positive solar elevation)^0.25. At night it uses the observed minimum. It is not a validated thermal prediction. Thermal cost = difference with setpoint / 18 (heating) or / 35 (cooling), with insulation and eco factors, rounded up. With no energy or turned off, the cabin drifts up to 8 °C per turn toward surface temperature. Outside 12–30 °C: crops halted, −12 safety and −6 morale. These thresholds and costs are game rules. Without Diviner, the classic heating of 14 nighttime energy applies, expressly announced.

### OSDR

API `https://visualization.osdr.nasa.gov/biodata/api/v2/`: metadata of `dataset/OSD-267/` and CSV query of its experiment conditions. Experiment **VEG-01A**, lettuce on the ISS, microbiology/nutrition and comparison with ground controls. Units are extracted and validated from the flight sample: 16 h light / 8 h darkness, 200 µmol/m²/s, recorded mean temperature 23.25 °C and harvest at 33 days. It is an experimental reference, not proof of lunar yields or a universal optimal temperature.

In **Greenhouse**: sow lettuce or experiment and choose "Apply OSDR-267 protocol". It consumes ceil(8 × light hours / 24) energy per turn (6 with the current protocol), grows one step and requires watering. To validate the experiment, complete two growth turns with that protocol and the cabin at ±3 °C of the recorded temperature. The experiment still takes three growth steps: compressed duration for the game. Harvesting it validated gives 26 base science/data +10 additional and unlocks watering for 5 water instead of 6. Bonus and savings are simulated effects; not results measured by NASA. Eco thermal mode allows growth, but does not validate the replica at 23.25 °C.

`science-tests.cjs` covers the PDS/CSV format, missing values, wrong units, partial failures, shared energy, experiment conditions, rewards, persistence and victory with the new rules. Browser tests also check watering, consoles and scientific evidence.

## Base interactive operations

Four decisions now open procedures in `dist/operations.js`, without changing their costs or rewards:

- **Energy → Install battery:** dock the unit, connect +/+ and −/−, test continuity. Adds 35 of empty capacity; charging it is still another decision.
- **Shelter → Repair engine:** inspect pressure per section, replace the defective gasket and balance two valves within the indicated tolerance. Confirming repairs 50% of the engine.
- **Laboratory → Analyze soil:** explore a tray, select three clear readings and compare their patterns with didactic references. Confirming delivers 20 science and 20 data; consumes energy, CPU and one action. The patterns are simulated, not NASA spectra.
- **Life support → Repair recycler:** identify the clogged filter, replace it and rotate six ducts to restore the air path. Confirming recovers up to 30 efficiency points, respecting the 100% limit and workshop discounts.

The procedures support mouse, touch and keyboard. They have no penalty for mistakes: they are corrected before confirming. Canceling or closing discards the attempt without consuming resources. Costs are applied once on confirm; mission, turn and resources are revalidated. Incomplete progress is not saved; confirmed operations use the existing save. The antenna and watering keep their minigames. Modes, constructions and the other decisions keep their behavior.

Run `npm run test:operations` to check the four complete runs in Edge, wrong attempts, canceling, single confirmation, insufficient resources, keyboard controls, workshop discount and mobile layout.

## Co-op rooms

See [MULTIPLAYER.md](MULTIPLAYER.md) to test four players in local tabs and link Firebase with Netlify. Without a configured Firebase project, public rooms stay disabled; they are not replaced with a fake connection.

## Teammate's version art

The design is reused from `art-source/PixelArtGenerator.ts` (copy of the original) and `art-source/CharacterArt.ts` (SpriteRegistry drawing functions). `build.cjs` generates the Canvas adaptations without adding Phaser to the current engine. `dist/cozy.js` mounts the original MainMenuScene diorama, textures, windows and lighting; `dist/cozy.css` ports the palette, typography and panels from the original CSS; `dist/cozy-ui.js` organizes the compact HUD. The map and interaction points keep the shared system's coordinates. `node cozy-visual-tests.cjs` generates menu, base, module and mobile screenshots.

### Exploration and legibility adjustments

Initial zoom 2.4, signs at all entrances, lit airlock and gray floor around the base. The HUD shows pixel icons, suit health and oxygen; the four-character selector screen was removed. Module windows have illustrations and explicit initial costs, including no-immediate-cost adjustments. There is no action counter or budget in real-time games.

Rover: available outside from the start, E or R to get in/out; speed 300 versus 85 on foot, with shared battery and recharging in the hangar. Radiation zones announce their activation and deal direct damage while the astronaut is inside. Shelter → Reinforce EVA suit costs 12 materials, 2 parts and 6 energy; reduces exterior exposure and damage by 50% for the crew. These are game effects, not real protection or doses.

## Personal state and shared mission

The top panel represents general reserves of energy, food, base oxygen, water, safety, science and a common radiation environmental index (simulated). Materials, parts, ice and mineral are shown below. Each player's bottom panel has ten hearts, ten food icons and ten oxygen tanks; each icon represents ten points and admits partial fill.

Walking consumes food (0.18 points/s inside, 0.24 outside); driving consumes less (0.035 points/s). Standing still consumes no food. At zero food, health is lost. Bedroom heals 30 health; Crops lets you eat with F: −5 shared food, +35 personal food. An empty food reserve does not instantly end a mission if the crew is still fed.

The suit has 20 seconds of savings before draining the tank outside. Once depleted it loses 0.4 oxygen points/s (less with upgrades/rover); with no oxygen and no savings it loses health. In the base, tank and savings recharge using life support; entering and exiting does not freely reset the 20 seconds. Storms damage the exposed; personal values are computed on the server in multiplayer. At zero health there is a medical evacuation with a morale penalty.

Each multiplayer slot receives a different mission at Mission Control: ice, beacon, minerals or volatiles. E picks up the exterior objective; to deliver you must return to that console. Each delivery grants only once 15 science, 15 data and 5 shared materials. Assignments and progress are kept on reconnect. In solo mode the two-expedition campaign is kept. The ambient background is fixed; actors and camera keep working. Minigames adopt the pixel style except the antenna, whose design is kept.

### Continuous survival (November 15, 2026)

- 180-second days, with no automatic ending on day 7 or on confirming the rescue. Rescue is an optional milestone. Every 3 days consumption and damage increase; afterwards more radiation areas appear.
- Base oxygen, water, food and safety are essential; depleting them, or both energy and reserve empty, ends the game. Zero hearts eliminates the astronaut with no revival; in a room they can watch the survivors.
- Mission Control → personal mission → collect dust/rock with E → Laboratory: Deposit samples → Analyze soil minigame. Each sample gives 20 science/data, 8 materials, 2 parts and 4 safety; also analyzed material for the workshop. Then request another mission. Free outcrops become available again when the day changes.
- Pre-charged auxiliary battery: single installation, +35 energy (overflow to reserve) and +35 capacity. Panels remain the renewable source; orienting them or activating tracking increases daytime capture.
- Pause menu → Save and main menu keeps the Firebase rooms. Online crew → Join recovers the last room and astronaut using the same browser and its anonymous authentication. Validity: 30 days since last activity. With nobody connected, the clock stops. Leaving a room frees the slot and discards that character. PLAY solo still saves locally; to save to the cloud, create a room, even if you play alone. The creator's computer does not need to stay on.
- The camera stays fixed within each sector and changes view when crossing its border. The decorative floor does not scroll. Menu with adaptable vertical layout.
- The seven astronomical reference phases are reused as the simulation cycle, including the documented events. They are not presented as new NASA measurements nor as a prediction of the future.
