'use strict';
// Game shell: global contract for minigames/operations/nasa-ui, module panels, main loop.
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d');
const colors=['#efbd69','#72d4e7','#91d7a3','#b8a0e5'];
const crew=[{name:'Sol',job:'Engineering',color:'#efbd69'},{name:'Kai',job:'Life support',color:'#72d4e7'},{name:'Noa',job:'Botany',color:'#91d7a3'},{name:'Luz',job:'Science',color:'#b8a0e5'}];
const rooms=[{key:'power',label:'POWER'},{key:'life',label:'LIFE SUPPORT'},{key:'food',label:'GREENHOUSE'},{key:'shield',label:'SHELTER'},{key:'science',label:'LABORATORY'},{key:'telecom',label:'TELECOMMUNICATIONS'},{key:'dorm',label:'BEDROOM'},{key:'command',label:'COMMAND CENTER'}];
let state=fresh(),player={x:176,y:224,dir:0,walk:0,rover:false},role=0,playing=false,keys=new Set(),moving=false,facing=1,time=0,last=0,toastTimer,hudAcc=0,saveAcc=0,puzzle=null;
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);
function open(html){keys.clear();$('modal').innerHTML=html;if(!$('dialog').open)$('dialog').showModal();$('modal').querySelectorAll('[data-close]').forEach(b=>b.onclick=close)}
function close(){$('dialog').close();puzzle=null;keys.clear()}
function notify(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),6000)}
function beep(){sfx('interact')}
function costs(a){const labels={energy:'energy',water:'water',parts:'parts',materials:'materials',tasks:'actions',computer:'CPU'};return Object.entries(a.cost).map(([k,v])=>v+' '+(labels[k]||k)).join(' · ')||'No immediate cost'}
function moduleStatus(key){
 if(key==='telecom')return `Pending data ${state.data} · Sent ${state.sent}/50 · Budget ${state.budget} · Report ${state.reportSent?'yes':'no'} · Rescue ${state.rescue?'CONFIRMED':'pending'} · Signal ${signal(state)?'OPTIMAL':'WEAK'} · Antenna ${state.antenna.toFixed(2)}° / target ${target(state)}°. Reception windows are phases 2, 4 and 6.`;
 if(key==='life')return `Efficiency ${state.efficiency}% · Mode ${state.lifeMode} · Capacity ${state.lifeCap} · ${state.leak?'ACTIVE LEAK':'No leak'} · Cabin ${state.cabinC.toFixed(1)} °C`;
 if(key==='food')return state.crop?`${crops[state.crop.type].name}: ${state.crop.progress.toFixed(1)}/${crops[state.crop.type].duration} · Moisture ${(state.crop.moisture||0).toFixed(1)}/2 · Light ${state.light}`:`Empty tray · Light ${state.light}`;
 if(key==='science')return `Volatiles ${state.labProgress}/2 · Extraction ${state.waterUpgrade?'upgraded':'basic'} · Science ${state.science}/60`;
 if(key==='shield')return `Shelters ${state.shelters}/3 · Engine ${state.engine}% · Morale ${Math.round(state.morale)} · Construction: ${state.construction?state.construction.type+' ('+state.construction.remaining.toFixed(1)+' days)':'none'} · Built: ${(state.buildings||[]).join(', ')||'none'}`;
 if(key==='dorm')return `Rest restores 30 health. Wait 45 seconds between uses. Energy ${Math.round(state.energy)} · Oxygen ${Math.round(state.life)} · Rover ${Math.round(state.rover.battery)}%`;
 if(key==='command')return `Survival · Day ${state.day} · Difficulty ${state.difficulty||1} · Missions completed ${player.completed||0}`;
 return `Panel ${state.angle}° · ${state.auto?'Automatic':'Manual'} · Batteries ${state.charge.toFixed(0)}/${capacity(state)} (${state.batteries}) · Panels ${Math.round(state.panelHealth)}% · ${night(state)?'☾ Night':'☀ Optimal '+optimum(state)+'°'}`}
// ---- module panels ----
function showModule(key){sfx('interact');
 if(key==='dorm')return dormPanel();

 if(key==='command')return commandPanel();
 const r=rooms.find(r=>r.key===key);
 open(`${moduleArt(key)}<small>MANAGEMENT / ${r.label}</small><h2>${r.label}</h2><div class="cost">${moduleStatus(key)}</div><p>Water ${Math.round(state.water)} · Energy ${Math.round(state.energy)} · Parts ${state.parts} · Materials ${state.materials} · Morale ${Math.round(state.morale)}</p>${key==='food'?mealMarkup():key==='science'?sampleMarkup():''}${typeof scienceModuleMarkup==='function'?scienceModuleMarkup(key):''}<div class="decisions">${options(state,key).map(o=>`<article><h3>${o.name}</h3><p>${o.description}</p><small>Cost on confirmation: ${costs(o)}</small><button data-decision="${o.id}" ${o.enabled?'':'disabled'}>${o.enabled?'Select →':o.reason}</button></article>`).join('')}</div><div class="buttons"><button data-close>Return to base</button></div>`);
 if($('depositSamples'))$('depositSamples').onclick=async()=>{await expeditionDo('deposit');showModule('science')};
 if($('eatMeal'))$('eatMeal').onclick=eatMeal;
 if($('thermalControls'))$('thermalControls').onclick=()=>showModule('life');
 if($('scienceProvenance'))$('scienceProvenance').onclick=()=>environmentScreen(false);
 document.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>choose(key,b.dataset.decision))}
function dormPanel(){const s=state;
 open(`${moduleArt('dorm')}<small>BEDROOM</small><h2>${t('restTitle')}</h2><p>${t('restDesc')}</p><div class="cost">HEALTH ${Math.round(player.health??100)}/100 · +30 per rest · ${t('dayLabel')} ${s.day} · ${Math.max(0,Math.ceil(DAY_SECONDS-s.dayTime))}s ${t('restLeft')}</div><p class="muted">Craft suit upgrades in the Hangar Workshop. Collect dust and rocks outside, then deposit and analyze them in the Laboratory.</p><div class="buttons"><button id="restBtn" class="primary">${t('rest')}</button><button data-close>Back</button></div>`);
 $('restBtn').onclick=()=>{close();sim.rest();refreshHUD()}}
function workshopPanel(){const s=state,m=s.mats;
 const card=(id,name,desc,ice,ore)=>{const owned=s.upgrades[id],ok=!owned&&m.ice>=ice&&m.ore>=ore;
  return `<article><h3>${name}</h3><p>${desc}</p><small>${t('need')}: ${ice} dust · ${ore} rock — in stock ${m.ice} dust · ${m.ore} rock</small><button data-craft="${id}" ${owned||!ok?'disabled':''}>${owned?t('owned'):t('craft')}</button></article>`};
 open(`${moduleArt('hangar')}<small>HANGAR / WORKSHOP</small><h2>${t('workshopTitle')}</h2><div class="cost">Rover ${Math.round(s.rover.battery)}% · Recharge: 10 energy → +35% battery</div><div class="decisions">${card('o2',t('upgradeO2'),t('upgradeO2Desc'),3,2)}${card('boots',t('upgradeBoots'),t('upgradeBootsDesc'),0,4)}${card('lamp',t('upgradeLamp'),t('upgradeLampDesc'),2,3)}</div><div class="buttons"><button id="rechBtn">⚡ ${t('roverRecharge')}</button><button data-close>Back</button></div>`);
 document.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>{sim.craft(b.dataset.craft).then(()=>{workshopPanel();refreshHUD()})});
 $('rechBtn').onclick=()=>{sim.rechargeRover().then(()=>workshopPanel())}}
function commandPanel(){const s=state;
 const step=(done,txt)=>`<li class="${done?'done':'todo'}">${done?'✓':'▢'} ${txt}</li>`;
 let list='';
 if(s.m1===0&&s.m2===0)list=`<p>${t('missionNone')}</p>`;
 else{list='<ul class="objList">';
  if(s.m1>0&&s.m1<4){list+=step(s.m1>0,t('m1step1'))+step(s.m1>1,t('m1step2'))+step(s.m1>1,t('m1step3'))+(s.m1<3?step(false,t('m1step4')):'')+step(s.m1>=3,t('m1step5'))}
  if(s.m1>=3&&s.m2>0&&s.m2<4){list+=step(s.m2>1,t('m2step1'))+(s.m2<3?step(false,t('m2step2')):'')+step(s.m2>=3,t('m2step3'))}
  if(s.m1>=3&&s.m2>=3)list+=`<li class="done">✓ ${t('winTitle')}</li>`;
  list+='</ul>'}
 list=personalMissionMarkup();
 const slider=(id,labelKey)=>`<label class="pwRow">${t(labelKey)} <output id="pw_${id}">${s.power[id]}</output><input id="pwIn_${id}" type="range" min="0" max="10" step="1" value="${s.power[id]}"></label>`;
 open(`${moduleArt('command')}<small>COMMAND CONSOLE</small><h2>${t('missionTitle')}</h2><div class="cost">${moduleStatus('command')}</div>${list}<button id="receiveMission" class="primary" ${player.assignment&&player.assignment.status!=='done'?'disabled':''}>${player.assignment?.status==='done'?'Get next mission':player.assignment?'Mission in progress':'Get my mission'}</button><h3>${t('powerTitle')} · 10</h3><p class="muted">Allocate 10 units. Life support conserves oxygen, shielding reduces radiation, and greenhouse power speeds up crop growth.</p>${slider('life','powerLife')}${slider('shield','powerShield')}${slider('green','powerGreen')}<div class="buttons"><button data-close>Back</button></div>`);
 $('receiveMission').onclick=async()=>{await sim.receiveMission();commandPanel();refreshHUD()};
 const ids=['life','shield','green'];const allocation={...state.power};
 const rewire=()=>{ids.forEach(id=>{const el=$('pwIn_'+id);el.value=allocation[id];$('pw_'+id).textContent=allocation[id]})};
 ids.forEach(id=>{$('pwIn_'+id).oninput=e=>{const v=Number(e.target.value),others=ids.filter(o=>o!==id),cur=others.reduce((a,o)=>a+allocation[o],0)||1,rest=10-v;
  allocation[id]=v;others.forEach((o,i)=>allocation[o]=Math.round(rest*allocation[o]/cur));
  let diff=10-ids.reduce((a,o)=>a+allocation[o],0);allocation[others[0]]=Math.max(0,allocation[others[0]]+diff);
  rewire()}});const apply=document.createElement('button');apply.textContent='Apply allocation';$('modal').append(apply);apply.onclick=()=>expeditionDo('power',allocation)}
// ---- decisions ----
function executeDecision(key,id,value){if(player.dead)return;if(decide(state,key,id,value)){RT.syncMission(state,player);refreshHUD();sfx('success');notify(state.log[0]);showModule(key)}}
function choose(key,id){const o=options(state,key).find(o=>o.id===id);if(!o?.enabled)return;
 if(id==='aim'){open(`<h2>Align the antenna with Earth</h2><p>Today's target: ${target(state)}°. Aim within 12° to use an optimal window.</p><input id="aimDial" type="range" min="0" max="180" value="${state.antenna}" aria-label="Antenna angle"><p id="aimValue">${state.antenna}°</p><div class="buttons"><button data-close>Cancel</button><button id="aimConfirm">Confirm alignment</button></div>`);$('aimDial').oninput=()=>$('aimValue').textContent=$('aimDial').value+'°';$('aimConfirm').onclick=()=>executeDecision(key,id,Number($('aimDial').value));return}
 if(id==='manual'){open(`<small>POWER / MANUAL ALIGNMENT</small><h2>Set the panel alignment</h2><p>Optimal elevation today: ${optimum(state)}°. The panel holds this angle until you change it. Azimuth adjusts automatically.</p><div class="puzzle"><input id="dial" aria-label="Panel angle" type="range" min="0" max="180" value="${state.angle}"><p id="angle">${state.angle}°</p></div><div class="buttons"><button data-close>Cancel</button><button id="confirmAngle">Save alignment</button></div>`);$('dial').oninput=()=>$('angle').textContent=$('dial').value+'°';$('confirmAngle').onclick=()=>executeDecision(key,id,Number($('dial').value));return}
 if(id==='soil'||id==='volatiles'){let progress=0;open(`<small>LABORATORY / ${o.name}</small><h2>Classify samples</h2><p>${o.description}</p><div class="cost">${costs(o)}</div><div class="puzzle"><p>Order: △ → ○ → ◇</p>${['◇','△','○'].map((n,i)=>`<button data-sequence="${[2,0,1][i]}">${n}</button>`).join('')}<p id="feedback">Costs apply on completion.</p></div><button data-close>Cancel</button>`);document.querySelectorAll('[data-sequence]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.sequence)===progress){b.disabled=true;progress++;$('feedback').textContent=progress+'/3';if(progress===3)executeDecision(key,id)}else{progress=0;document.querySelectorAll('[data-sequence]').forEach(x=>x.disabled=false);$('feedback').textContent='Check the sequence and try again. Resources retained.'}});return}
 open(`<small>DECISION / ${rooms.find(r=>r.key===key).label}</small><h2>${o.name}</h2><p>${o.description}</p><div class="cost">Cost on confirmation: ${costs(o)}</div><p>Confirm to use shared resources and apply the result.</p><div class="buttons"><button data-close>Cancel</button><button id="confirmChoice" class="primary">Confirm decision</button></div>`);$('confirmChoice').onclick=()=>executeDecision(key,id)}
// ---- interaction ----
function interact(){if(!playing||state.over||player.dead||$('dialog').open)return;const p=world.near;if(!p||p.disabled)return;sfx('interact');
 if(p.type==='module')showModule(p.key);
 else if(p.type==='personalSurvey')expeditionDo('survey');
 else if(p.type==='rover')world.toggleRover();
 else if(p.type==='workshop')workshopPanel();
 else if(p.type==='airlock')world.transition();
 else if(p.type==='recharge')sim.rechargeRover();
 else if(p.type==='deposit')sim.collectSample();
 else if(p.type==='beacon')sim.scanBeacon();
 else if(p.type==='node')sim.mine(p.node)}
function selectRole(i){if(typeof mp!=='undefined'&&mp.code){notify('Your character is reserved in the online room. You can use all modules.');return}
 role=i;refreshHUD();notify(`${crew[i].name} · ${crew[i].job}. All four roles share resources.`)}
// ---- start / save / load ----
function start(saved=false){
 if(typeof mp!=='undefined'&&mp.code){multiplayerScreen();return}
 if(!saved&&typeof missionEnvironment==='function'&&!missionEnvironment()){environmentScreen(true);return}
 if(saved){const d=load();if(!d){notify(t('nasaNeeded'));return}
  state=simDefaults(d.state);role=d.role||0;
  if(d.player){player=d.player}if(d.roverPos){world.rover.x=d.roverPos.x;world.rover.y=d.roverPos.y}
  world.scene=state.scene||'base';world.remote.clear()}
 else{state=simDefaults(fresh(missionEnvironment()));
  player={x:176,y:224,dir:0,walk:0,rover:false};role=0;
  world.scene='base';world.rover.x=9.5*ETILE;world.rover.y=7.5*ETILE;world.remote.clear()}
 playing=true;$('title').hidden=true;$('hud').hidden=false;keys.clear();
 music.start();refreshHUD();
 notify('Move with WASD and press E at consoles. Get missions at Command, rest in the Bedroom, and press F at the Greenhouse to eat. Watch your suit oxygen and radiation outside.');
 if(state.over)report()}
function save(){if(typeof mp!=='undefined'&&mp.code)return;
 try{localStorage.setItem('aurora-v5',JSON.stringify({state,role,player:{x:player.x,y:player.y,dir:player.dir||0,rover:!!player.rover,health:player.health,suit:player.suit,rad:player.rad,nutrition:player.nutrition,airBuffer:player.airBuffer,evacuations:player.evacuations,restAt:player.restAt,assignment:player.assignment,samples:player.samples,completed:player.completed,dead:player.dead,diedOn:player.diedOn},roverPos:{x:world.rover.x,y:world.rover.y}}))}catch{}}
function load(){try{const d=JSON.parse(localStorage.getItem('aurora-v5'));if(!d||!d.state||!Number.isFinite(d.state.day)||d.state.day<1)return null;return d}catch{return null}}
function report(){save();sim.endScreen(!!state.won,'day')}
function journal(){open('<small>LOGBOOK</small><h2>Mission log</h2><div id="entries"></div><div class="buttons"><button data-close>Back</button></div>');state.log.forEach(tx=>{const p=document.createElement('p');p.textContent=tx;$('entries').append(p)})}
function scientific(){open(`<small>SCIENCE AND GAME RULES</small><h2>The science behind Aurora</h2><p>NASA's ECLSS uses energy to recover water and maintain breathable air. The game combines these processes in the life support system.</p><p><a href="https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/" target="_blank" rel="noopener">NASA ECLSS ↗</a></p><div class="cost">DONKI · ${historical.flrID}<br>Start: ${historical.beginTime} · Peak: ${historical.peakTime}<br>Class${historical.classType} · ${historical.instruments[0].displayName}</div><p>This historical record is an example from the guide. Detected events appear in the lunar environment panel. Suit radiation is a gameplay index.</p><p><a href="${historical.link}" target="_blank" rel="noopener">Original NASA record</a> · <a href="donki.json">Local JSON</a> · <a href="guia-extraida.txt">Text extracted from the guide</a></p><details><summary>All 11 links from the guide</summary><ul>${sources.map(u=>`<li><a href="${u}" target="_blank" rel="noopener">${u}</a></li>`).join('')}</ul></details><div class="buttons"><button data-close>Return to base</button></div>`)}
function menu(){if(!playing)return;pauseMenu()}
// ---- input ----
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;
 if(!$('dialog').open&&playing&&['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k))e.preventDefault();
 if(e.repeat)return;
 if($('dialog').open)return;
 keys.add(k);
 if(k==='e')interact();
 if(k==='r'&&playing)world.toggleRover();
 if(k==='j'&&playing)journal();
 if(k==='Escape')menu();
 if(playing&&!mp?.code&&['1','2','3','4'].includes(k))selectRole(Number(k)-1)});
addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{keys.clear();if(playing)save()});
$('dialog').addEventListener('close',()=>{puzzle=null;keys.clear()});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);const k=b.dataset.key;if(k==='e')interact();else if(k==='r')world.toggleRover();else keys.add(k)};
 b.onpointerup=b.onpointercancel=()=>{const k=b.dataset.key;if(k!=='e'&&k!=='r')keys.delete(k)}});
// ---- main loop ----
function loop(now){const dt=Math.min((now-last)/1000||0,.05);last=now;time+=dt;
 if(playing&&!state.over&&!document.hidden){if(!$('dialog').open&&(!mp?.code||mp.online))world.update(dt);else moving=false;sim.tick(dt);
  hudAcc+=dt;if(hudAcc>.25){hudAcc=0;refreshHUD()}
  saveAcc+=dt;if(saveAcc>10){saveAcc=0;save()}}
 world.draw(ctx,innerWidth,innerHeight);
 requestAnimationFrame(loop)}
// Fallback driver: keep the real-time sim alive when rAF is throttled (occluded tab).
// A single animation loop; multiplayer time is advanced by the server.
// ---- boot ----
resize();PIX.init();world.init();initUI();applyLang();
requestAnimationFrame(loop);
