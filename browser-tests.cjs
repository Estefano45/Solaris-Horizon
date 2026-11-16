const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env:{...process.env,PORT:'18765'},stdio:'pipe',windowsHide:true});
 let browser;
 try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('Server exited '+code)))});
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:18765');await page.waitForFunction(()=>nasaData?.mode==='online',null,{timeout:95000});assert((await page.locator('#apiBanner').textContent()).includes('NASA conectada'));const live=await page.evaluate(()=>nasaData);assert.equal(live.events.length,live.donki.acceptedCount);await page.click('#nasaSetup');const firstTiles=await page.locator('.moonTiles img').evaluateAll(imgs=>imgs.map(i=>i.src).join('|'));await page.selectOption('#siteChoice','1');assert.equal(await page.locator('#eventChoice').count(),0);
 await page.waitForFunction(()=>[...document.querySelectorAll('.moonTiles img')].every(i=>i.complete&&i.naturalWidth>0));const secondTiles=await page.locator('.moonTiles img').evaluateAll(imgs=>imgs.map(i=>i.src).join('|'));assert.notEqual(firstTiles,secondTiles);assert((await page.locator('.apiProof').textContent()).includes('HTTP 200'));assert(!(await page.locator('#modal').textContent()).includes('TURNO 5'));console.log('Live DONKI events:',live.events.length,'queried:',live.donki.queriedAt);
 await page.screenshot({path:'nasa-briefing.png'});await page.click('[data-close]');await page.click('#start');
 assert.equal(await page.evaluate(()=>state.environment.site.id),'este');
 assert.equal(live.science.diviner.status,'online');assert.equal(live.science.osdr.status,'online');
 const originalState=await page.evaluate(()=>JSON.stringify(state));
 await page.evaluate(()=>showModule('food'));assert((await page.locator('#modal').textContent()).includes('OSD-267'));await page.click('[data-decision="plant_experiment"]');await page.click('#confirmChoice');await page.click('[data-decision="light_protocol"]');await page.click('#confirmChoice');assert.equal(await page.evaluate(()=>state.light),'protocol');
 await page.click('[data-decision="water"]');for(let i=0;i<12;i++){await page.locator('.plot').nth(i).hover();if((await page.locator('#miniStatus').textContent()).includes('Seca:'))await page.locator('.plot').nth(i).click();}assert(await page.locator('#miniDone').isEnabled());await page.click('#miniDone');assert.equal(await page.evaluate(()=>state.crop.moisture),2);
 await page.screenshot({path:'test-results/osdr-cultivos.png'});await page.click('#thermalControls');assert((await page.locator('#modal').textContent()).includes('TERMORREGULACIÓN'));await page.screenshot({path:'test-results/diviner-termico.png'});await page.click('#scienceProvenance');assert((await page.locator('#modal').textContent()).includes('HTTP 206'));assert.equal(await page.locator('.thermalChart svg').count(),1);await page.screenshot({path:'test-results/science-provenance.png'});await page.click('[data-close]');
 await page.evaluate(json=>{state=JSON.parse(json);update()},originalState);
 await page.evaluate(()=>{showModule('food');close();antennaGame()});await page.waitForFunction(()=>document.querySelector('#antennaReadout')?.textContent.includes('Antenna'));await page.click('[data-close]');
 const savedSchedule=await page.evaluate(()=>JSON.stringify(state.environment.crises));
 await page.evaluate(()=>{state.day=2;state.tasks=4;antennaGame()});
 await page.waitForTimeout(100);
 const earthAngle=async()=>Number((await page.locator('#antennaReadout').textContent()).split(' · ')[1].match(/[\d.]+/)[0]);
 const initialEarth=await earthAngle();await page.waitForTimeout(1800);assert(Math.abs(await earthAngle()-initialEarth)>5,'Earth must visibly move in under two seconds');
 const aimAtEarth=async()=>{const box=await page.locator('#antennaSky').boundingBox(),angle=await earthAngle();await page.mouse.move(box.x+(340+230*Math.cos(angle*Math.PI/180))*box.width/680,box.y+(300-230*Math.sin(angle*Math.PI/180))*box.height/330)};
 await aimAtEarth();await page.mouse.down();await page.mouse.up();await page.waitForTimeout(100);const read=await page.locator('#antennaReadout').textContent();await page.mouse.move(20,20);await page.waitForTimeout(200);assert.equal((await page.locator('#antennaReadout').textContent()).split(' · ')[0],read.split(' · ')[0]);await page.click('[data-close]');assert.equal(await page.evaluate(()=>state.tasks),4);
 await page.evaluate(()=>antennaGame());await page.waitForTimeout(50);await aimAtEarth();await page.mouse.down();
 const trackStarted=Date.now();let checkedEarly=false;
 while(Date.now()-trackStarted<6500&&await page.locator('#miniDone').isDisabled()){await aimAtEarth();await page.waitForTimeout(80);if(Date.now()-trackStarted>2800&&!checkedEarly){assert(await page.locator('#miniDone').isDisabled());checkedEarly=true}}
 await page.mouse.up();assert(checkedEarly);assert(await page.locator('#miniDone').isEnabled());const lockedRead=await page.locator('#antennaReadout').textContent();await page.mouse.move(10,10);await page.waitForTimeout(250);assert.equal(await page.locator('#antennaReadout').textContent(),lockedRead);
 await page.screenshot({path:'nasa-antenna.png'});await page.click('#miniDone');assert.equal(await page.evaluate(()=>state.tasks),3);console.log(await page.evaluate(()=>({antenna:state.antenna,target:target(state)})));assert(await page.evaluate(()=>Math.abs(state.antenna-target(state))<9));
 await page.click('[data-close]');await page.reload();await page.click('#resume');assert.equal(await page.evaluate(()=>state.environment.site.id),'este');assert.equal(await page.evaluate(()=>state.tasks),3);assert.equal(await page.evaluate(()=>JSON.stringify(state.environment.crises)),savedSchedule);
 await page.evaluate(()=>antennaGame());await page.click('[data-close]');assert.equal(await page.evaluate(()=>state.tasks),3);
 if(live.events.length>=2){
 await page.evaluate(d=>{state=fresh({site:d.sites[1],crises:[{turn:2,event:d.events[0]},{turn:4,event:d.events[1]}],donki:d.donki,mode:'online',retrievedAt:d.retrievedAt});update();endDay()},live);
 assert(!(await page.locator('#modal').textContent()).includes(live.events[0].id));await page.click('#confirmDay');assert((await page.locator('#modal').textContent()).includes('Actividad solar detectada'));assert((await page.locator('#modal').textContent()).includes(live.events[0].id));await page.screenshot({path:'nasa-crisis.png'});await page.click('[data-close]');await page.evaluate(()=>environmentScreen(false));assert((await page.locator('#modal').textContent()).includes(live.events[0].id));assert(!(await page.locator('#modal').textContent()).includes(live.events[1].id));await page.click('[data-close]');
 await page.evaluate(()=>endDay());await page.click('#confirmDay');await page.evaluate(()=>endDay());assert(!(await page.locator('#modal').textContent()).includes(live.events[1].id));await page.click('#confirmDay');assert((await page.locator('#modal').textContent()).includes(live.events[1].id));await page.click('[data-close]');
 }
 await page.evaluate(()=>{close();playing=false;$('title').hidden=false;$('hud').hidden=true;environmentScreen(true)});
 await page.route('**/api/nasa',route=>route.abort());await page.click('#syncNASA');await page.waitForFunction(()=>document.querySelector('#nasaStatus').textContent.includes('Consulta NASA fallida'));assert.equal(await page.evaluate(()=>nasaData.mode),'online');
 const empty=await browser.newPage();await empty.route('**/api/nasa',route=>route.abort());await empty.goto('http://127.0.0.1:18765');await empty.waitForFunction(()=>nasaError.includes('fallida'));assert(await empty.locator('#start').isDisabled());assert.equal(await empty.evaluate(()=>nasaData),null);await empty.click('#nasaSetup');await empty.click('#offlineNASA');assert.equal(await empty.evaluate(()=>nasaData.mode),'offline');await empty.close();
 const quiet=await browser.newPage();const noEvents=JSON.parse(JSON.stringify(live));noEvents.events=[];noEvents.donki.records=[];noEvents.donki.receivedCount=noEvents.donki.acceptedCount=0;await quiet.route('**/api/nasa',r=>r.fulfill({json:noEvents}));await quiet.goto('http://127.0.0.1:18765');await quiet.waitForFunction(()=>nasaData?.mode==='online');await quiet.click('#start');assert.equal(await quiet.evaluate(()=>{state.day=5;return storm(state)}),false);await quiet.close();
 assert.equal(errors.length,0,errors.join('\n'));
 const blocked=await page.request.get('http://127.0.0.1:18765/.env');assert.equal(blocked.status(),404);
 console.log('PASS: NASA briefing, map, selection, drag/release, 4-second lock, single cost, cancel, saved game and API audit, region-specific maps, visibly moving Earth, two surprise alerts, no future-event spoilers, no silent offline fallback, empty DONKI and explicit offline mode; no browser errors.');
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
