const assert=require('node:assert/strict');
const {events,recentRange,getData}=require('./nasa-service.cjs');
const {fresh,storm,advance,transfer,earthPreview,solarProfile}=require('./dist/engine.js');
const snapshot=require('./dist/nasa-snapshot.json');
(async()=>{
 assert.deepEqual(recentRange(new Date('2026-11-14T22:00:00Z')),{start:'2026-10-16',end:'2026-11-14'});
 let requests=[];const sample={flrID:'2026-11-11T21:06:00-FLR-001',beginTime:'2026-11-11T21:06Z',classType:'C1.7',link:'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/1/-1'};
 global.fetch=async url=>{requests.push(new URL(url));return requests.length===1?{ok:false,status:404}:{ok:true,json:async()=>[sample]}};
 const result=await events('TEST_SECRET',new Date('2026-11-14'));
 assert.equal(requests.length,2);assert.equal(requests[0].searchParams.get('api_key'),'TEST_SECRET');assert.equal(requests[1].searchParams.has('api_key'),false);
 assert.equal(result.audit.gatewayStatus,404);assert.equal(result.audit.httpStatus,200);assert(!JSON.stringify(result).includes('TEST_SECRET'));assert.equal(result.events.length,1);
 global.fetch=async()=>({ok:true,json:async()=>[]});assert.deepEqual((await events()).events,[]);
 global.fetch=async()=>{throw Error('network down')};await assert.rejects(getData());
 global.fetch=async()=>({ok:false,status:403});await assert.rejects(events('BAD_KEY'));
 let s=fresh({site:snapshot.sites[0],event:null,stormTurn:null});s.day=5;s.data=60;assert(!storm(s));assert.equal(transfer(s),12);advance(s);assert.equal(s.panelHealth,100);
 for(const c of ['C','M','X']){s=fresh({site:snapshot.sites[0],event:{...snapshot.events[0],classType:c+'1.0'},stormTurn:5});s.day=4;advance(s);assert(storm(s));assert(s.log[0].includes('DONKI SOLAR ALERT'));s.data=60;assert.equal(transfer(s),solarProfile(s).transfer);const health=solarProfile(s).health;advance(s);assert(!storm(s));assert.equal(s.panelHealth,health)}
 s=fresh({site:JSON.parse(JSON.stringify(snapshot.sites[0])),event:snapshot.events[0]});s.environment.site.turns[0].earthNext={el:60,az:250};const begin=earthPreview(s,0),end=earthPreview(s,40);assert.equal(end,60);assert(earthPreview(s,4)<begin);assert(earthPreview(s,4)>end);assert.equal(earthPreview(s,80),60);
 console.log('PASS: live-query provenance, no leaked keys, gateway 404 migration, empty catalog, no silent archive, crisis turn 5 and slow interpolation.');
})().catch(e=>{console.error(e);process.exitCode=1});
