'use strict';
// Online crew: rooms via /api/multiplayer/*, real-time presence + host-less state sync.
const mp={code:null,uid:null,token:null,room:null,config:null,sdk:null,unsubscribe:null,timer:null,busy:false,lease:null,online:false,screen:false,revision:-1,sequence:-1,refreshing:false,releasing:false,pulse:0,launched:false,lastSeen:0};
const mpEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const multiHUD=document.createElement('button');multiHUD.id='multiplayerHUD';multiHUD.hidden=true;multiHUD.onclick=()=>multiplayerScreen();$('prompt').before(multiHUD);
async function mpFetch(path,body){const headers={};if(mp.sdk)headers.Authorization='Bearer '+await mp.sdk.token();else if(mp.token)headers.Authorization='Bearer '+mp.token;if(body)headers['Content-Type']='application/json';const r=await fetch('/api/multiplayer/'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(path==='create'?60000:30000)});const d=await r.json();if(r.status===401&&mp.config?.mode==='local'){sessionStorage.removeItem('aurora-mp-session');mp.token=null}if(!r.ok)throw Error(d.error||'Could not connect.');return d}
async function mpAuthenticate(){
 mp.config=await mpFetch('config');if(!mp.config.enabled)throw Error('Online play requires a Firebase connection. Solo play is available.');
 if(mp.config.mode==='firebase'){if(!mp.sdk)mp.sdk=await (await import('./firebase-client.js')).connect(mp.config.firebase);mp.uid=mp.sdk.uid}
 else{const saved=JSON.parse(sessionStorage.getItem('aurora-mp-session')||'null');if(saved){mp.token=saved.token;mp.uid=saved.uid}else{const s=await mpFetch('session',{});mp.token=s.token;mp.uid=s.uid;sessionStorage.setItem('aurora-mp-session',JSON.stringify(s))}}}
async function mpCommand(type,fields={}){return mpFetch('command',{...fields,type,code:mp.code,id:crypto.randomUUID()})}
function mpIsHost(){if(!mp.room)return false;const active=Object.values(mp.room.players||{}).filter(p=>Date.now()-p.seen<25000).sort((a,b)=>a.slot-b.slot);return active.length>0&&active[0].uid===mp.uid}
function mpApply(room){
 if(!mp.code||!room?.players?.[mp.uid]||(room.sequence||0)<(mp.sequence||0))return;
 mp.sequence=room.sequence||0;mp.room=room;mp.online=true;mp.lastSeen=Date.now();
 const next=JSON.parse(room.snapshot);for(const k of ['used','log','buildings'])next[k]??=[];
 simDefaults(next);
 const orphan=Object.values(room.leases||{}).find(l=>l.uid===mp.uid);
 if(orphan&&!mp.lease&&!mp.busy&&!mp.releasing){mp.releasing=true;mpCommand('cancel',{token:orphan.token}).then(mpApply).catch(()=>{}).finally(()=>{mp.releasing=false})}
 const wasOver=!!state.over,changed=room.revision!==mp.revision,dayChanged=next.day!==(state?.day??next.day);mp.revision=room.revision;
 Object.assign(state,next);role=room.players[mp.uid].slot;const me=room.players[mp.uid];if(world.scene!==(me.scene||'base')){world.scene=me.scene||'base';player.x=me.x;player.y=me.y}player.scene=world.scene;player.rover=!!me.rover;player.rad=me.rad||0;player.health=me.health??100;player.dead=!!me.dead;player.samples=me.samples||[];player.completed=me.completed||0;player.suit=me.suit??100;player.nutrition=me.nutrition??100;player.airBuffer=me.airBuffer??(world.scene==='ext'?0:20);if((me.evacuations||0)!==(player.evacuations||0)){player.x=me.x;player.y=me.y;player.evacuations=me.evacuations||0;}player.assignment=me.assignment||null;state.rad=player.rad;state.scene=world.scene;world.rover.x=state.rover.x;world.rover.y=state.rover.y;
 for(const [uid,p] of Object.entries(room.players)){if(uid===mp.uid)continue;
  world.setRemote(uid,{x:p.x,y:p.y,scene:p.scene||'base',name:p.name||crew[p.slot].name,color:crew[p.slot].color,dir:p.dir??0,moving:!!p.moving,rover:!!p.rover,dead:!!p.dead,lastSeen:p.seen})}
 for(const uid of [...world.remote.keys()])if(!room.players[uid]||Date.now()-(room.players[uid].seen||0)>=25000)world.removeRemote(uid);
 if(room.status!=='lobby'){
  if(!mp.launched){mp.launched=true;player.x=me.x;player.y=me.y;world.scene=me.scene||'base';state.scene=world.scene;music.start()}
  playing=true;$('title').hidden=true;$('hud').hidden=false;multiHUD.hidden=false;
  if(changed&&dayChanged)notify(state.log[0]);
  if(state.over&&(!wasOver||!changed&&room.sequence===0))report();
  refreshHUD()}
 mpStatus();if(mp.screen&&$('dialog').open)mpRoster()}
function mpStatus(){if(!mp.code)return;
 const count=Object.values(mp.room?.players||{}).filter(p=>Date.now()-p.seen<25000).length;
 multiHUD.textContent=`ROOM${mp.code} · ${count}/4 · ${mp.online?'connected':'reconnecting'}`;
 if(!mp.code||mp.room?.status==='playing')refreshHUD()}
// ---- attach / detach ----
async function mpAttach(code,room){mp.code=code;mp.room=room;mp.revision=-1;mp.sequence=-1;mp.lease=null;mp.screen=false;mp.launched=false;mp.pulse=0;sessionStorage.setItem('aurora-mp-room',code);localStorage.setItem('aurora-mp-room',code);
 player={x:20.5*TILE,y:12.5*TILE,dir:0,walk:0,rover:false};world.scene='base';world.clearRemote();mpApply(room);
 mp.unsubscribe?.();clearInterval(mp.timer);
 if(mp.sdk)mp.unsubscribe=mp.sdk.listen(code,mpApply,()=>{mp.online=false;mpStatus()});
 mp.timer=setInterval(async()=>{if(mp.refreshing||!mp.code)return;mp.refreshing=true;try{mpApply(await mpCommand('presence',{x:Math.round(player.x),y:Math.round(player.y),moving,facing,dir:player.dir||0}));}catch{mp.online=false;keys.clear()}finally{mp.refreshing=false;mpStatus()}},1000);
 if(room.status==='lobby')multiplayerScreen();else close()}
async function mpCreate(){await mpAuthenticate();mp.name=($('mpName')?.value||settings.name||'').trim().slice(0,18);if(mp.name.length<2)throw Error('Enter a name with at least two characters.');settings.name=mp.name;saveSettings();
 const selected=typeof missionEnvironment==='function'?missionEnvironment():null;
 if(!selected)throw Error(t('mpNeedEnv'));
 const d=await mpFetch('create',{site:selected.site.id,offline:selected.mode==='offline',name:mp.name});await mpAttach(d.code,d.room)}
async function mpJoin(code){await mpAuthenticate();mp.name=($('mpName')?.value||settings.name||'').trim().slice(0,18);if(mp.name.length<2)throw Error('Enter a name with at least two characters.');settings.name=mp.name;saveSettings();
 code=String(code).trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))throw Error('Enter the six-character room code.');
 const r=await mpFetch('command',{type:'join',code,id:crypto.randomUUID(),name:mp.name});await mpAttach(code,r)}
// ---- UI ----
function mpRoster(){if(!$('mpRoster'))return;const players=Object.values(mp.room?.players||{}).sort((a,b)=>a.slot-b.slot);
 $('mpRoster').innerHTML=players.map(p=>{const connected=Date.now()-p.seen<25000;
  return `<article style="--c:${crew[p.slot].color}"><b>${mpEscape(p.name||crew[p.slot].name)}${p.uid===mp.uid?t('mpYou'):''}</b><small>Access to all modules</small><span class="dot ${connected?'on':'off'}"></span><small>${connected?(mp.room.status==='lobby'?'in lobby':'exploring'):'Disconnected'}</small></article>`}).join('');
 if($('mpLaunch'))$('mpLaunch').disabled=mp.busy||mp.room.status!=='lobby';
 if($('mpLocal'))$('mpLocal').textContent=mp.config?.mode==='local'?'Local test room. Use other tabs to join. Restarting the server clears the room.':'Firebase saves this room for 30 days after its last activity. Rejoin with this browser and room code to resume your astronaut. The clock stops when everyone disconnects.'}
async function mpUI(action){if(mp.busy)return;mp.busy=true;if($('mpError'))$('mpError').textContent='Connecting…';
 try{await action()}catch(e){if($('mpError'))$('mpError').textContent=e.message;else notify(e.message)}finally{mp.busy=false;if(mp.code)mpStatus()}}
function multiplayerScreen(){mp.screen=true;const inRoom=!!mp.code;
 open(`<small>COOPERATIVE EXPEDITION / 1–4 PLAYERS</small><h2>${inRoom?'Room '+mpEscape(mp.code):t('mpTitle')}</h2>
 <p>${t('mpReady')}</p>
 <label>${t('mpName')} <input id="mpName" maxlength="18" value="${mpEscape(mp.name||settings.name||'')}" placeholder="${t('namePlaceholder')}"></label>
 ${inRoom?`<div id="mpRoster" class="mpRoster"></div><p id="mpLocal" class="muted"></p><div class="buttons"><button id="mpLaunch" class="primary">${t('mpLaunch')}</button><button id="mpSuspend">Save and return to menu</button><button id="mpLeave">${t('mpLeave')}</button></div>`
 :`<label>${t('mpCode')} <input id="mpCode" maxlength="6" autocomplete="off" placeholder="ABC234" style="text-transform:uppercase"></label><div class="buttons"><button id="mpJoin">${t('mpJoin')}</button><button id="mpCreate">${t('mpCreate')}</button></div>`}
 <p id="mpError" role="status"></p><button data-close>Back</button>`);
 if(inRoom){mpRoster();$('mpSuspend').onclick=()=>mpUI(mpSuspend);$('mpLaunch').onclick=()=>mpUI(async()=>{const r=await mpCommand('launch');mp.screen=false;close();mpApply(r)});$('mpLeave').onclick=()=>mpUI(mpLeave)}
 else{$('mpCreate').onclick=()=>mpUI(mpCreate);$('mpJoin').onclick=()=>mpUI(()=>mpJoin($('mpCode').value));
  const code=localStorage.getItem('aurora-mp-room')||sessionStorage.getItem('aurora-mp-room');if(code){$('mpCode').value=code;$('mpError').textContent='Your last room code is filled in. Select Join to reconnect.'}}}
async function mpLeave(){try{await mpCommand('leave')}catch{notify('Disconnected locally. The room may still hold your slot.')}
 mp.unsubscribe?.();clearInterval(mp.timer);mp.code=null;mp.room=null;mp.lease=null;mp.screen=false;mp.launched=false;mp.revision=-1;mp.sequence=-1;sessionStorage.removeItem('aurora-mp-room');
 stopMini();world.clearRemote();close();playing=false;$('title').hidden=false;$('hud').hidden=true;multiHUD.hidden=true;music.stop()}
// ---- decision flow over the server ----
const soloChoose=choose;
choose=function(key,id){if(!mp.code)return soloChoose(key,id);
 if(player.dead){notify('Your astronaut has died.');return}if(mp.busy||!mp.online){notify('Wait for the connection to recover.');return}
 mpUI(async()=>{const request={type:'begin',code:mp.code,id:crypto.randomUUID(),module:key,action:id,day:state.day};
  const r=await mpFetch('command',request);mp.lease={module:key,action:id,token:request.id,day:state.day};mpApply(r);mp.screen=false;soloChoose(key,id)})};
const soloExecute=executeDecision;
executeDecision=function(key,id,value){if(!mp.code)return soloExecute(key,id,value);if(mp.busy)return;
 const lease=mp.lease;if(!lease||lease.module!==key||lease.action!==id){notify('Reopen the procedure to reserve this module.');return}
 mpUI(async()=>{try{const r=await mpCommand('act',{module:key,action:id,value,day:lease.day,token:lease.token});mp.lease=null;mpApply(r);sfx('success');notify(state.log[0]);showModule(key)}
 catch(e){await mpCommand('cancel',{token:lease.token}).catch(()=>{});mp.lease=null;stopMini();close();throw e}})};
$('dialog').addEventListener('close',()=>{if($('dialog').open)return;mp.screen=false;const lease=mp.lease;
 if(lease&&!mp.busy){mp.lease=null;mpCommand('cancel',{token:lease.token}).then(mpApply).catch(()=>{})}});

async function mpSuspend(){if(!mp.code)return;const room=await mpCommand('suspend');mpApply(room);const code=mp.code;mp.unsubscribe?.();clearInterval(mp.timer);mp.code=null;mp.room=null;mp.lease=null;mp.screen=false;mp.launched=false;mp.revision=-1;mp.sequence=-1;stopMini();world.clearRemote();close();playing=false;$('title').hidden=false;$('hud').hidden=true;multiHUD.hidden=true;music.stop();notify('Saved to Firebase. Room '+code+'. Select Online Crew → Join to resume.');}
