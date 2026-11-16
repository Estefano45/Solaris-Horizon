const assert=require('node:assert/strict');
const service=require('./science-service.cjs'),E=require('./dist/engine.js'),snapshot=require('./dist/nasa-snapshot.json');
const dataset={'OSD-267':{metadata:{accession:'OSD-267','study title':'Lettuce ISS study','project identifier':'VEG-01A','flight program':'ISS'}}};
const csv='id.accession,study.factor value.spaceflight,study.parameter value.light cycle,study.parameter value.mean growth temperature,study.parameter value.light intensity,study.parameter value.age at sample harvest,study.parameter value.hardware\r\nOSD-267,Space Flight,16:8 light:dark {hour},23.25 {degree Celsius},200 {micromole per square meter per second},33 {day},"Veggie, ISS"\r\n';
const row=(lon,lat,i,t)=>[lon,lat,((i+.5)/4).toFixed(2),1,1,1,1,1,1,1,t].join(',').padEnd(111)+'\r\n';
const cell=(lon,lat)=>Array.from({length:96},(_,i)=>row(lon,lat,i,i===0?-9999:100+290*Math.sin(i/96*Math.PI)**2)).join('');
const parsed=service.parseDiviner(cell(23.25,.75),snapshot.sites[0]);assert.equal(parsed.curve.length,95);assert(parsed.minK>0);assert.equal(parsed.maxK,390);
assert.throws(()=>service.parseDiviner(cell(30.25,5.25),snapshot.sites[0]));
assert.throws(()=>service.parseDiviner(Array.from({length:96},(_,i)=>row(23.25,.75,i,-9999)).join(''),snapshot.sites[0]));
assert.throws(()=>service.parseDiviner(cell(23.25,.75).slice(113),snapshot.sites[0]));
const osdr=service.parseStudy(dataset,csv);assert.equal(osdr.lightHours,16);assert.equal(osdr.temperatureC,23.25);assert.equal(osdr.hardware,'Veggie, ISS');assert.throws(()=>service.parseStudy(dataset,csv.replace('degree Celsius','kelvin')));assert.throws(()=>service.parseStudy(dataset,csv.replace('16:8','17:8')));
const science={diviner:{status:'online',cells:[parsed,{...parsed,siteId:'este'}]},osdr:{status:'online',...osdr}};
const fresh=()=>E.fresh({site:snapshot.sites[0],science,crises:[]});
let s=fresh();s.day=4;const cost=E.thermal(s).cost;assert(cost>=10);assert(E.decide(s,'life','insulate'));assert(E.thermal(s).cost<cost);assert(E.decide(s,'life','thermal_eco'));assert(E.thermal(s).cost<cost);s.energy=100;E.advance(s);assert.equal(s.cabinC,16);
s=fresh();s.day=4;s.thermalMode='off';s.crop={type:'lettuce',progress:0,moisture:2};E.advance(s);E.advance(s);assert.equal(s.cabinC,6);assert.equal(s.crop.progress,1,'Unsafe cabin must stop growth');assert(s.safety<80);
s=fresh();s.day=4;s.energy=0;s.charge=0;E.advance(s);assert.equal(s.cabinC,14,'No free heating without shared power');
s=fresh();assert(E.decide(s,'food','plant_experiment'));assert(E.decide(s,'food','light_protocol'));assert(E.decide(s,'food','water'));E.advance(s);assert.equal(s.cabinC,23.25);assert.equal(s.crop.protocolTurns,1);E.advance(s);assert.equal(s.crop.protocolTurns,2);assert(E.decide(s,'food','water'));E.advance(s);assert(E.decide(s,'food','harvest'));assert.equal(s.data,36);assert.equal(s.science,36);assert(s.irrigationUpgrade);assert(E.decide(s,'food','plant_lettuce'));assert.equal(E.options(s,'food').find(o=>o.id==='water').cost.water,5);
s=fresh();E.decide(s,'food','plant_experiment');E.decide(s,'food','water');E.decide(s,'food','light_protocol');E.decide(s,'life','thermal_eco');E.advance(s);assert.equal(s.crop.protocolTurns,0,'Growing in cool economy mode is not a replicated protocol');
s=fresh();s.crop={type:'experiment',progress:2,moisture:0,protocolTurns:1};s.light='protocol';E.advance(s);assert.equal(s.crop.protocolTurns,1,'Unwatered protocol must not accumulate validation');
s=fresh();s.day=4;s.energy=E.thermal(s).cost+8;s.crop={type:'lettuce',progress:0,moisture:2};E.advance(s);assert.equal(s.crop.progress,0,'Thermal and life support compete with crop lighting for energy');
s=fresh();const before=JSON.stringify(s),f=E.forecast(s);assert.equal(JSON.stringify(s),before);E.advance(s);assert.equal(s.cabinC,f.state.cabinC);assert.equal(s.energy,f.state.energy);assert.equal(E.thermal(JSON.parse(JSON.stringify(s))).cost,E.thermal(s).cost);
const old=E.fresh();delete old.cabinC;delete old.thermalMode;assert.equal(E.thermal(old),null);assert(!E.options(old,'food').some(o=>o.id==='light_protocol'));E.advance(old);assert(Number.isFinite(old.energy));
// A rescue remains feasible with both new systems and two crises.
for(const site of snapshot.sites){const run=E.fresh({site,science,crises:[{turn:3,event:snapshot.events[0]},{turn:5,event:snapshot.events[1]}]});const act=(m,id)=>assert(E.decide(run,m,id,id==='aim'?E.target(run):undefined),id);
act('power','auto');for(let i=0;i<3;i++)act('science','soil');E.advance(run);act('life','eco');act('shield','engine');act('power','charge');E.advance(run);act('life','fixLeak');act('power','charge');act('power','manualMode');E.advance(run);act('telecom','aim');act('telecom','transmit');act('telecom','transmit');act('telecom','report');E.advance(run);act('shield','engine');E.advance(run);act('telecom','aim');if(run.energy<10)act('power','release');act('telecom','request');E.advance(run);if(run.charge&&run.energy<100)act('power','release');E.advance(run);assert(run.won);}
(async()=>{
 let calls=0;
 global.fetch=async(url,options)=>{calls++;if(url===service.DIVINER){const range=options.headers.Range;const first=range.includes('88096721');const body=first?cell(23.25,.75):cell(30.25,5.25);return new Response(body,{status:206,headers:{'Content-Range':range.replace('=',' ')+'/156211313'}})}return url===service.ASSAYS?new Response(csv):Response.json(dataset)};
 const [a,b]=await Promise.all([service.getScience(),service.getScience()]);assert.deepEqual(a,b);assert.equal(calls,4);assert.equal(a.diviner.status,'online');assert.equal(a.osdr.status,'online');
 global.fetch=async url=>{if(url===service.DIVINER)return new Response('Whole archive must not be accepted',{status:200});return url===service.ASSAYS?new Response(csv):Response.json(dataset)};
 const partial=await service.getScience();assert.equal(partial.diviner.status,'unavailable');assert.equal(partial.osdr.status,'online');assert(!partial.diviner.cells,'No silent cached thermal replacement');
 global.fetch=async()=>{throw Error('upstream failure')};const failed=await service.getScience();assert.equal(failed.osdr.status,'unavailable');assert.equal(failed.diviner.status,'unavailable');
 const {default:handler}=await import('./netlify/functions/nasa.mjs');const response=await handler(new Request('https://test.netlify.app/api/science'));assert.equal(response.status,200);assert.equal((await response.json()).diviner.status,'unavailable');assert.equal((await handler(new Request('https://test.netlify.app/api/science',{method:'POST'}))).status,405);
 console.log('PASS: real-format PDS parsing, missing/invalid records, OSDR units, partial outages, bounded range requests, thermal contention, crop validation, irrigation reward, save/forecast compatibility and rescue.');
})().catch(e=>{console.error(e);process.exitCode=1});
