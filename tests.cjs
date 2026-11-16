const assert=require('node:assert/strict');const {fresh,options,decide,advance,forecast,night,capacity}=require('./dist/engine.js');
function act(s,m,id,v){assert(decide(s,m,id,v),`Rejected ${s.day} ${id}`)}
let s=fresh();const plan=[ [['power','auto'],['shield','engine']], [['shield','engine'],['science','soil'],['power','charge']], [['life','fixLeak'],['science','soil'],['power','charge']], [['science','soil'],['telecom','aim',85],['telecom','transmit']], [['telecom','report'],['power','release']], [['telecom','aim',115],['telecom','transmit'],['power','release'],['telecom','request']],[] ];
for(const turn of plan){for(const a of turn)act(s,...a);advance(s)}console.log('Winning path:',s.won,s.life,s.water,s.food,s.energy,s.charge);assert(s.won);
s=fresh();const copy=JSON.stringify(s);forecast(s);assert.equal(JSON.stringify(s),copy);s.parts=0;assert(!decide(s,'life','repair'));assert.equal(s.tasks,4);
s=fresh();s.efficiency=50;act(s,'life','repair');assert.equal(s.efficiency,80);assert.equal(s.parts,8);
s=fresh();s.leak=true;act(s,'life','seal');assert.equal(s.lifeCap,70);assert(!s.leak);s.tasks=4;act(s,'life','fixLeak');assert.equal(s.lifeCap,100);
s=fresh();act(s,'science','volatiles');assert(!decide(s,'science','volatiles'));advance(s);act(s,'science','volatiles');assert(s.waterUpgrade);let water=s.water;act(s,'life','extract');assert.equal(s.water,Math.min(100,water+30));
s=fresh();act(s,'food','plant_potato');act(s,'food','water');act(s,'food','light_high');advance(s);assert.equal(s.crop.progress,2);advance(s);assert.equal(s.crop.progress,4);act(s,'food','harvest');assert(!s.crop);
s=fresh();act(s,'food','plant_lettuce');s.light='off';advance(s);assert.equal(s.crop.progress,0);
s=fresh();act(s,'shield','build_shelter');assert.equal(s.shelters,2);advance(s);assert.equal(s.shelters,2);advance(s);assert.equal(s.shelters,3);
s=fresh();s.day=4;s.energy=0;s.charge=35;const life=s.life;advance(s);assert(s.charge<35);assert(s.life>=life);assert(night(s));
s=fresh();act(s,'power','manual',180);const bad=forecast(s).state.energy;s=fresh();act(s,'power','manual',40);assert(forecast(s).state.energy>bad);
s=fresh();for(let i=0;i<7;i++)advance(s);assert(s.over&&!s.won);const final=JSON.stringify(s);advance(s);assert.equal(JSON.stringify(s),final);
for(let seed=1;seed<40;seed++){s=fresh();for(let day=0;day<7;day++){for(const m of ['life','food','science','shield','power']){const os=options(s,m).filter(o=>o.enabled);if(os.length){const o=os[(seed+day)%os.length];decide(s,m,o.id,60)}}advance(s);for(const k of ['energy','life','water','food','parts','materials','safety'])assert(Number.isFinite(s[k])&&s[k]>=0);assert(s.charge<=capacity(s));}}
console.log('PASS: connected systems, victory, failure, costs, crops, construction, batteries and forecast.');

// Telecommunications integration and one-time rewards.
s=fresh();assert(!decide(s,'telecom','transmit'));act(s,'science','soil');assert.equal(s.data,20);s.day=2;s.antenna=55;s.data=60;s.energy=100;s.tasks=5;act(s,'telecom','transmit');assert.equal(s.sent,30);assert.equal(s.data,30);act(s,'telecom','transmit');assert.equal(s.sent,60);assert.equal(s.budget,20);act(s,'telecom','report');assert.equal(s.budget,30);assert(!decide(s,'telecom','report'));s.engine=100;act(s,'telecom','request');assert(s.rescue);assert.equal(s.budget,10);assert(!decide(s,'telecom','request'));
s=fresh();s.day=5;s.data=60;s.energy=100;act(s,'telecom','transmit');assert.equal(s.sent,5);act(s,'telecom','boost');assert.equal(s.sent,35);assert.equal(s.energy,57);s.engine=100;s.sent=50;s.reportSent=true;s.budget=30;act(s,'telecom','request');assert(!s.rescue);assert.equal(s.budget,30);act(s,'telecom','requestBoost');assert(s.rescue);
s=fresh();act(s,'telecom','message');assert.equal(s.morale,82);assert(!decide(s,'telecom','message'));s.day=5;advance(s);assert.equal(s.panelHealth,65);
s=fresh();s.energy=0;s.leak=true;let withLeak=forecast(s).state.life;s.leak=false;assert(forecast(s).state.life>withLeak);
s=fresh();s.energy=8;assert(!decide(s,'science','soil'));assert(!decide(s,'telecom','boost'));assert.equal(s.tasks,4);
console.log('PASS: data dependency, rewards, rescue acknowledgement, weak/storm links, morale and energy contention.');
// Irrigation must be a separate decision, cannot be stacked beyond its capacity.
s=fresh();act(s,'food','plant_lettuce');let unwatered=forecast(s);assert.equal(unwatered.state.crop.progress,0);const waterBefore=s.water;act(s,'food','water');assert.equal(s.water,waterBefore-6);assert.equal(s.crop.moisture,2);assert(!decide(s,'food','water'));advance(s);assert.equal(s.crop.progress,1);assert.equal(s.crop.moisture,1);advance(s);assert.equal(s.crop.progress,2);assert(!decide(s,'food','water'));act(s,'food','harvest');assert.equal(s.crop,null);
s=fresh();act(s,'food','plant_potato');s.water=5;assert(!decide(s,'food','water'));assert.equal(s.crop.moisture,0);
console.log('PASS: dry crops stop, watering costs, humidity consumption, maturity and insufficient water.');
