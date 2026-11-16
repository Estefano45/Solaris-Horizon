const assert=require('node:assert/strict');
const {fresh,decide,advance,forecast,target,optimum,night,signal,transfer}=require('./dist/engine.js');
const {parseEphemeris,cleanEvent}=require('./nasa-service.cjs');
const data=require('./dist/nasa-snapshot.json');
assert.throws(()=>parseEphemeris('upstream error'));
assert.throws(()=>parseEphemeris('$$SOE\n2024, , ,n.a.,0\n$$EOE'));
assert.equal(cleanEvent({beginTime:'bad'}),null);
for(const site of data.sites)for(const event of [...data.events,{...data.events[0],classType:'C1.0'}]){
 const s=fresh({site,event,stormTurn:5});
 const plan=[[['power','auto'],['shield','engine']],[['shield','engine'],['science','soil'],['power','charge']],[['life','fixLeak'],['science','soil'],['power','charge']],[['science','soil'],['telecom','aim'],['telecom','transmit']],[['telecom','report'],['power','release']],[['telecom','aim'],['telecom','transmit'],['power','release'],['telecom','request']],[]];
 for(const turn of plan){assert.equal(night(s),s.day>=4);const before=JSON.stringify(s);forecast(s);assert.equal(JSON.stringify(s),before);for(const[m,id]of turn)assert(decide(s,m,id,id==='aim'?target(s):undefined),site.id+' '+s.day+' '+id);advance(s)}
 assert(s.won,site.id+' '+event.classType+' must remain winnable');
 assert.equal(s.panelHealth,event.classType.startsWith('C')?90:event.classType.startsWith('M')?80:65);
 const restored=JSON.parse(JSON.stringify(s));assert.equal(target(restored),target(s));
}
let s=fresh({site:data.sites[0],event:data.events[0]});s.angle=optimum(s);const aligned=forecast(s).state.energy;s.angle=180;assert(forecast(s).state.energy<aligned);
s.day=2;s.antenna=target(s);assert(signal(s));s.antenna=0;assert(!signal(s));
console.log('PASS: both lunar sites and solar scenarios remain winnable; geometry, snapshots, parsing and forecasts.');

for(const event of data.events){const t=fresh({site:data.sites[0],event});t.day=5;t.data=60;assert.equal(transfer(t),event.classType.startsWith('M')?8:5);assert.equal(transfer(t,true),30)}
