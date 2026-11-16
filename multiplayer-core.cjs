'use strict';
const E=require('./dist/engine.js'),RT=require('./dist/realtime-core.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const online=(p,now)=>now-p.seen<25000;
function fail(message){throw Error(message)}
function normalize(s){for(const k of ['log','used','buildings'])s[k]??=[];if(s.environment?.crises===undefined&&s.environment?.mode)s.environment.crises=[];return s}
function member(uid,slot,now){return {uid,slot,x:150+slot*26,y:224,name:'',health:100,suit:100,rad:0,scene:'base',dir:0,rover:false,facing:1,moving:false,seen:now,ready:false}}
function makeRoom(uid,state,now){return {version:1,created:now,expires:now+30*86400000,status:'lobby',revision:0,sequence:0,snapshot:JSON.stringify(RT.init(state)),players:{[uid]:member(uid,0,now)},leases:{},receipts:{}}}
function apply(input,uid,c,now){
 if(!input||input.expires<now)fail('Room not found or expired.');
 const r=clone(input);r.players??={};r.leases??={};r.receipts??={};
 if(typeof c.id!=='string'||! /^[a-zA-Z0-9-]{8,80}$/.test(c.id))fail('Invalid request.');
 if(r.receipts[c.id]){if(r.receipts[c.id]!==uid)fail('Invalid request.');return r}
 const previousScene=r.players[uid]?.scene,previousEvacuations=r.players[uid]?.evacuations||0;r.state=normalize(JSON.parse(r.snapshot));if(r.status==='playing'){const active=Object.fromEntries(Object.entries(r.players).filter(([,p])=>online(p,now)));if(Object.keys(active).length){RT.tick(r.state,active,Math.max(0,Math.min(5,(now-(r.lastTick||now))/1000)),r.players);r.revision++}r.lastTick=now;if(r.state.over)r.status='finished'}
 if(r.state.rover?.driver&&!online(r.players[r.state.rover.driver]||{seen:0},now)){const driver=r.players[r.state.rover.driver];if(driver)driver.rover=false;delete r.state.rover.driver}
 for(const [k,l]of Object.entries(r.leases))if(l.until<now||!r.players[l.uid]||!online(r.players[l.uid],now))delete r.leases[k];
 if(c.type==='join'){
  if(!r.players[uid]){const slots=Object.values(r.players).map(p=>p.slot);if(slots.length>=4)fail('The room already has four players.');r.players[uid]=member(uid,[0,1,2,3].find(i=>!slots.includes(i)),now)}
 }else if(!r.players[uid])fail('You are not a member of this room.');
 const p=r.players[uid];RT.pilot(p);RT.syncMission(r.state,p);if(p.dead&&['begin','act','expedition'].includes(c.type))fail('Your astronaut has died. You can watch the room.');p.seen=now;r.expires=now+30*86400000;if(typeof c.name==='string')p.name=c.name.replace(/[<>\x00-\x1f]/g,'').trim().slice(0,18)||'Astronaut';
 if(c.type==='leave'){if(r.state.rover?.driver===uid)delete r.state.rover.driver;delete r.players[uid];for(const [k,l]of Object.entries(r.leases))if(l.uid===uid)delete r.leases[k]}
 else if(c.type==='presence'){
  if(!p.dead&&p.scene===previousScene&&(p.evacuations||0)===previousEvacuations&&Number.isFinite(c.x)&&Number.isFinite(c.y)&&c.x>=0&&c.x<=4000&&c.y>=0&&c.y<=3000){p.moving=Math.hypot(c.x-p.x,c.y-p.y)>.1;p.activityUntil=r.state.elapsed+1.5;p.x=c.x;p.y=c.y;p.facing=c.facing===-1?-1:1}
  if(typeof c.name==='string'){p.name=c.name.replace(/[<>\x00-\x1f]/g,'').trim().slice(0,18)||'Astronaut'}
  // Scene transitions are server-validated expedition commands.
  if(Number.isInteger(c.dir)&&c.dir>=0&&c.dir<=3)p.dir=c.dir;
  if(p.rover&&r.state.rover?.driver===uid){r.state.rover.x=p.x;r.state.rover.y=p.y}
  for(const l of Object.values(r.leases))if(l.uid===uid)l.until=now+90000;
 }else if(c.type==='suspend'){p.seen=0;p.moving=false;for(const [k,l]of Object.entries(r.leases))if(l.uid===uid)delete r.leases[k];
 }else if(c.type==='expedition'){
  if(r.status!=='playing'||!RT.action(r.state,p,c.action,c.value,uid))fail('Action unavailable. Move closer and check your resources.');r.revision++;
 }else if(c.type==='launch'){
  if(r.status!=='lobby')fail('The mission has already started.');r.status='playing';r.lastTick=now;
 }else if(c.type==='begin'){
  if(r.status!=='playing'||r.state.over||c.day!==r.state.day)fail('The day changed.');
  if(!E.options(r.state,c.module).some(o=>o.id===c.action&&o.enabled))fail('Action unavailable or insufficient resources.');
  if(r.leases[c.module]&&r.leases[c.module].uid!==uid)fail('Another player is using this module.');
  if(Object.values(r.leases).some(l=>l.uid===uid))fail('You already have an open procedure.');
  r.leases[c.module]={uid,action:c.action,token:c.id,until:now+90000};p.ready=false;
 }else if(c.type==='cancel'){
  for(const [k,l]of Object.entries(r.leases))if(l.uid===uid&&l.token===c.token)delete r.leases[k];
 }else if(c.type==='act'){
  const l=r.leases[c.module];if(r.status!=='playing'||(!r.state.realtime&&c.day!==r.state.day)||!l||l.uid!==uid||l.token!==c.token||l.action!==c.action)fail('The procedure expired or the day changed. Try again.');
  if(!E.decide(r.state,c.module,c.action,c.value))fail('Not enough resources to complete this decision.');
  for(const member of Object.values(r.players))RT.syncMission(r.state,member);delete r.leases[c.module];r.revision++;for(const player of Object.values(r.players))player.ready=false;
 }else if(c.type==='ready'){
  if(r.status!=='playing'||r.state.over||c.day!==r.state.day)fail('The day changed or the mission ended.');
  if(Object.values(r.leases).some(l=>l.uid===uid))fail('Complete or cancel your procedure first.');
  p.ready=!!c.ready;
 }else if(!['join','presence','leave','launch'].includes(c.type))fail('Unknown action.');
 if(c.type==='ready'&&r.status==='playing'&&r.state.over)r.status='finished';
 r.receipts[c.id]=uid;const ids=Object.keys(r.receipts);for(const id of ids.slice(0,Math.max(0,ids.length-100)))delete r.receipts[id];
 r.sequence=(r.sequence||0)+1;r.snapshot=JSON.stringify(r.state);delete r.state;return r;
}
module.exports={apply,makeRoom,online,normalize};
