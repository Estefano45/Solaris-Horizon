const assert=require('node:assert/strict');
const {fresh,decide,createSchedule,currentCrisis,encounteredCrises,storm,forecast,advance,transfer,antennaTarget,antennaPosition,target}=require('./dist/engine.js');
const data=require('./dist/nasa-snapshot.json');
const sample={site:data.sites[0],eventPool:data.events};
assert.deepEqual(createSchedule([]),[]);
assert.equal(createSchedule(data.events,()=>0).length,1);
assert.equal(createSchedule(data.events,()=>.99).length,2);
const turns=new Set();
for(let seed=1;seed<=80;seed++){
 let x=seed;const rng=()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296};
 const s=fresh(sample,rng),schedule=JSON.stringify(s.environment.crises);
 assert(s.environment.crises.length>=1&&s.environment.crises.length<=2);
 assert.equal(new Set(s.environment.crises.map(c=>c.turn)).size,s.environment.crises.length);
 assert.equal(new Set(s.environment.crises.map(c=>c.event.id)).size,s.environment.crises.length);
 for(const c of s.environment.crises){assert(c.turn>=2&&c.turn<=6);turns.add(c.turn)}
 assert.equal(encounteredCrises(s).length,0);
 for(let i=1;i<=7;i++){
  const before=JSON.stringify(s),f=forecast(s);assert.equal(JSON.stringify(s),before);
  if(!storm(s))assert(!f.summary.includes('DONKI SOLAR ALERT'));
  const loaded=JSON.parse(JSON.stringify(s));assert.equal(JSON.stringify(loaded.environment.crises),schedule);
  assert.equal(currentCrisis(loaded)?.id,currentCrisis(s)?.id);
  s.data=60;if(storm(s))assert(transfer(s)<12);
  advance(s);assert.equal(JSON.stringify(s.environment.crises),schedule);
 }
}
assert.equal(turns.size,5);
let s=fresh({site:data.sites[0],crises:[{turn:2,event:data.events[0]},{turn:4,event:data.events[1]}]});
s.day=2;advance(s);assert.equal(s.panelHealth,65);s.day=4;advance(s);assert.equal(s.panelHealth,65,'A weaker second crisis must not heal panels');
s=fresh({site:data.sites[0],crises:[]});s.day=5;assert(!storm(s));
for(let day=1;day<=7;day++){s.day=day;let prev=antennaPosition(s,0),wraps=0;for(let t=.1;t<100;t+=.1){const p=antennaPosition(s,t);assert(Math.abs(((p.x-340)/390)**2+((p.y-300)/235)**2-1)<1e-9);if(p.cycle===prev.cycle){assert(p.x>prev.x);assert(p.angle<prev.angle)}else{assert(prev.x>680&&p.x<0);wraps++}prev=p}assert(wraps>=3);assert(antennaTarget(s,0)-antennaTarget(s,2)>5)}
console.log('PASS: 1–2 distinct surprise crises, all eligible turns, no forecast spoilers, persistent schedule, cumulative damage and visible continuous Earth motion.');
// A complete expedition with two crises still admits a resource-conscious rescue.
for(const site of data.sites){
 const run=fresh({site,crises:[{turn:3,event:data.events[0]},{turn:5,event:data.events[1]}]});
 const act=(m,id)=>assert(decide(run,m,id,id==='aim'?target(run):undefined),`${run.day}: ${id}`);
 act('power','auto');for(let i=0;i<3;i++)act('science','soil');advance(run);
 act('life','eco');act('shield','engine');act('power','charge');advance(run);
 act('life','fixLeak');act('power','charge');act('power','manualMode');advance(run);
 act('telecom','aim');act('telecom','transmit');act('telecom','transmit');act('telecom','report');advance(run);
 act('shield','engine');advance(run);
 act('telecom','aim');if(run.energy<10)act('power','release');act('telecom','request');advance(run);
 if(run.charge&&run.energy<100)act('power','release');advance(run);assert(run.won,site.id+' double-crisis rescue');
}
console.log('PASS: successful rescue with two crises at both lunar sites.');
