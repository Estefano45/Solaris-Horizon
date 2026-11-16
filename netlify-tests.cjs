const assert=require('node:assert/strict');
(async()=>{
 const {default:handler,config}=await import('./netlify/functions/nasa.mjs');
 assert.deepEqual(config.path,['/api/nasa','/api/nasa/audit','/api/moon-tile','/api/science']);
 const req=(path,method='GET')=>new Request('https://example.netlify.app'+path,{method});
 assert.equal((await handler(req('/api/nasa','POST'))).status,405);
 assert.equal((await handler(req('/api/other'))).status,404);
 assert.equal((await handler(req('/api/nasa/audit'))).status,404);
 for(const path of ['/api/moon-tile','/api/moon-tile?x=1','/api/moon-tile?x=-1&y=1','/api/moon-tile?x=64&y=0','/api/moon-tile?x=1&y=32','/api/moon-tile?x=1.5&y=0'])assert.equal((await handler(req(path))).status,400);
 process.env.NASA_API_KEY='TEST_PRIVATE_KEY';
 global.fetch=async()=>{throw Error('Failure with secret TEST_PRIVATE_KEY')};
 let r=await handler(req('/api/nasa'));assert.equal(r.status,503);assert(!(await r.text()).includes('TEST_PRIVATE_KEY'));
 r=await handler(req('/api/moon-tile?x=36&y=15'));assert.equal(r.status,502);
 global.fetch=async url=>{const u=new URL(url);if(u.hostname==='ssd.jpl.nasa.gov')return {ok:true,json:async()=>({result:'$$SOE\n'+Array.from({length:8},()=> '2024, , ,180,45,').join('\n')+'\n$$EOE'})};if(u.hostname==='trek.nasa.gov')return {ok:true,headers:new Headers({'Content-Type':'image/jpeg'}),arrayBuffer:async()=>new Uint8Array([255,216,255,217]).buffer};return {ok:true,json:async()=>[{flrID:'test-FLR',beginTime:'2026-11-01T00:00Z',classType:'M1.1',link:'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/1/-1'}]}};
 r=await handler(req('/api/nasa'));assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');const d=await r.json();assert.equal(d.mode,'online');assert.equal(d.sites.length,2);assert.equal(d.events.length,1);assert(!JSON.stringify(d).includes('TEST_PRIVATE_KEY'));
 r=await handler(req('/api/nasa/audit'));assert.equal(r.status,200);
 r=await handler(req('/api/moon-tile?x=36&y=15'));assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/jpeg');assert.equal((await r.arrayBuffer()).byteLength,4);
 console.log('PASS: Netlify routes, valid NASA responses, binary map tiles, errors, method restrictions and secret redaction.');
})().catch(e=>{console.error(e);process.exitCode=1});
