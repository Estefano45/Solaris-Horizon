'use strict';
const crypto=require('node:crypto'),core=require('./multiplayer-core.cjs'),E=require('./dist/engine.js');
const rooms=new Map(),sessions=new Map();let firebase,adminModules;
function configuration(){try{const c=JSON.parse(process.env.FIREBASE_WEB_CONFIG||'null');return c?.apiKey&&c?.projectId&&c?.databaseURL&&process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?c:null}catch{return null}}
function admin(){if(firebase)return firebase;const c=configuration();if(!c)throw Error('Firebase no configurado.');const {initializeApp,cert}=adminModules?.app||require('firebase-admin/app'),{getAuth}=adminModules?.auth||require('firebase-admin/auth'),{getDatabase}=adminModules?.database||require('firebase-admin/database');const credentials=JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,'base64').toString());const app=initializeApp({credential:cert(credentials),databaseURL:c.databaseURL},'lunar-multiplayer');firebase={auth:getAuth(app),db:getDatabase(app)};return firebase}
const headers={'Cache-Control':'no-store','Content-Type':'application/json','X-Content-Type-Options':'nosniff'};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
async function handle(request,{local=false,missionFactory}={}){
 const path=new URL(request.url).pathname,config=configuration(),dev=local&&!config;
 if(path==='/api/multiplayer/config'&&request.method==='GET')return reply({enabled:!!config||dev,mode:dev?'local':'firebase',firebase:config});
 if(!config&&!dev)return reply({error:'Connect Firebase to enable online play. Solo play is available.'},503);
 try{
  if(path==='/api/multiplayer/session'&&dev&&request.method==='POST'){
   if(sessions.size>=1000)for(const [k,v]of sessions)if(v.expires<Date.now())sessions.delete(k);
   if(sessions.size>=1000)return reply({error:'Too many local sessions.'},429);
   const token=crypto.randomBytes(32).toString('hex'),uid=crypto.randomUUID();sessions.set(token,{uid,expires:Date.now()+86400000});return reply({token,uid});
  }
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'');let uid;
  if(dev){const session=sessions.get(token);if(!session||session.expires<Date.now())return reply({error:'Local session expired. Reconnect to continue.'},401);uid=session.uid}else{try{uid=(await admin().auth.verifyIdToken(token||'')).uid}catch{return reply({error:'Invalid Firebase session.'},401)}}
  const url=new URL(request.url),code=url.searchParams.get('code');
  if(request.method==='GET'&&path==='/api/multiplayer/room'){
   if(!/^[A-Z2-9]{6}$/.test(code||''))return reply({error:'Invalid code.'},400);
   const r=dev?rooms.get(code):(await admin().db.ref('rooms/'+code).get()).val();if(!r?.players?.[uid]||r.expires<Date.now())return reply({error:'You do not have access to this room.'},403);return reply(r);
  }
  if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
  const raw=await request.text();if(raw.length>8192)return reply({error:'Request too large.'},413);const c=JSON.parse(raw);
  if(path==='/api/multiplayer/create'){
   let state;
   if(missionFactory)state=await missionFactory();
   else if(c.offline===true){const snapshot=require('./dist/nasa-snapshot.json');state=E.fresh({site:snapshot.sites.find(s=>s.id===c.site)||snapshot.sites[0],eventPool:snapshot.events,mode:'offline',retrievedAt:snapshot.retrievedAt})}
   else {const [d,science]=await Promise.all([require('./nasa-service.cjs').getData(process.env.NASA_API_KEY),require('./science-service.cjs').getScience()]);state=E.fresh({site:d.sites.find(s=>s.id===c.site)||d.sites[0],eventPool:d.events,donki:d.donki,science,mode:d.mode,retrievedAt:d.retrievedAt})}
   if(dev){for(const [k,r]of rooms)if(r.expires<Date.now())rooms.delete(k);if(rooms.size>=100)return reply({error:'Local room limit reached.'},429)}
   for(let tries=0;tries<5;tries++){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',id=Array.from(crypto.randomBytes(6),b=>alphabet[b%alphabet.length]).join(''),r=core.makeRoom(uid,state,Date.now());r.players[uid].name=typeof c.name==='string'?c.name.replace(/[<>\x00-\x1f]/g,'').trim().slice(0,18):'Astronaut';if(dev){if(rooms.has(id))continue;rooms.set(id,r);return reply({code:id,room:r})}const result=await admin().db.ref('rooms/'+id).transaction(old=>old?undefined:r,undefined,false);if(result.committed)return reply({code:id,room:result.snapshot.val()})}
   throw Error('Could not allocate a room code.');
  }
  if(path!=='/api/multiplayer/command'||! /^[A-Z2-9]{6}$/.test(c.code||''))return reply({error:'Invalid route or code.'},400);
  if(dev){try{const r=core.apply(rooms.get(c.code),uid,c,Date.now());rooms.set(c.code,r);return reply(r)}catch(e){return reply({error:e.message},409)}}
  let reason='Could not apply the decision.';const result=await admin().db.ref('rooms/'+c.code).transaction(old=>{if(!old)return old;try{return core.apply(old,uid,c,Date.now())}catch(e){reason=e.message;return}},undefined,false);return result.committed&&result.snapshot.exists()?reply(result.snapshot.val()):reply({error:reason},409);
 }catch{return reply({error:'Could not connect. Check the configuration and try again.'},503)}
}
module.exports={handle,configuration,setAdminModules:modules=>{adminModules=modules}};
