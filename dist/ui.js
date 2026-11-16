'use strict';
// HUD refresh, prompts, pause/settings/controls modals. game.js supplies open/close/notify.
const statKeys=['energy','life','safety','food','water','science'];
function initUI(){
 if(settings.lang&&settings.lang!==lang)setLang(settings.lang);
 applyLang();
 const nameInput=$('playerName');
 if(nameInput){nameInput.value=settings.name||'';nameInput.oninput=()=>{settings.name=nameInput.value.trim();saveSettings()}}
 $('start').onclick=()=>{sfx('click');start()};
 $('resume').onclick=()=>{sfx('click');start(true)};
 $('multiplayer').onclick=()=>{sfx('click');if(typeof multiplayerScreen==='function')multiplayerScreen();else notify(t('mpNeedEnv'))};
 $('settingsBtn').onclick=()=>{sfx('click');settingsModal()};
 $('controlsBtn').onclick=()=>{sfx('click');controlsModal()};
 $('pause').onclick=()=>{sfx('click');menu()};
 $('resume').hidden=!load();
}
function refreshHUD(){
 if(!playing||!state)return;const s=state;
 $('day').textContent=`${t('dayLabel')} ${s.day} · ${night(s)?'☾':'☀'} · ${Math.max(0,Math.ceil(DAY_SECONDS-s.dayTime))}s`;
 $('stats').innerHTML=statKeys.map(k=>`<div class="stat" style="--color:${statColor(k)}"><label>${t('stat'+cap(k))}</label><b>${Math.round(s[k])}</b><div class="meter"><span style="width:${Math.min(100,s[k])}%"></span></div></div>`).join('')+
  `<div class="stat rad${s.radiation>50?' hot':''}" style="--color:#ef6a55"><label>${t('statRadiation')}</label><b>${Math.round(s.radiation||0)}</b><div class="meter"><span style="width:${Math.min(100,s.radiation||0)}%"></span></div></div>`;
 // objective / mission panel
 let missionLine;
 if(s.m1===0&&s.m2===0)missionLine=t('missionNone');
 else{const steps=[];const mark=(done,txt)=>steps.push(`<li class="${done?'done':''}">${done?'✓ ':''}${txt}</li>`);
  if(s.m1>0&&s.m1<4){mark(s.m1>0,t('m1step1'));mark(s.m1>1,t('m1step2'));mark(s.m1>1,t('m1step3'));if(s.m1<3)mark(false,t('m1step4'));mark(s.m1>=3,t('m1step5'))}
  if(s.m1>=3&&s.m2>0&&s.m2<4){mark(s.m2>1,t('m2step1'));if(s.m2<3)mark(false,t('m2step2'));mark(s.m2>=3,t('m2step3'))}
  if(s.m1>=3&&s.m2>=3)steps.push('<li class="done">✓ '+t('winTitle')+'</li>');
  missionLine=`<b>${s.m1<3?t('mission1'):t('mission2')}</b><ul class="objList">${steps.join('')}</ul>`}
 $('objective').innerHTML=`<div class="goals">Day ${s.day} · Difficulty ${s.difficulty||1}<br>Science ${Math.floor(s.science)} · Analyses${(s.analyzed||[]).length}<br>Personal missions ${player.completed||0} · Backpack ${(player.samples||[]).length}<br>Rescue milestone ${s.rescue?'✓':'pending'} (optional)<br>Rover ${Math.round(s.rover?.battery??100)}%</div>`;
 // event line
 let ev;
 if(stormActive(s))ev='⚠ '+t('toastStorm');
 else if(stormWarning(s))ev='⚠ '+t('toastStorm');
 else if(s.leak)ev='⚠ Active leak. Oxygen falling.';
 else if(night(s))ev='☾ Lunar night. Solar generation offline.';
 else ev='☀ Solar generation active.';
 $('event').textContent=ev;
 if(typeof updateNASA==='function')updateNASA();
 // crew selector
 if($('roles')&&(typeof mp==='undefined'||!mp.code))$('roles').innerHTML=crew.map((c,i)=>`<button style="--c:${c.color}" class="${i===role?'selected':''}" title="${c.name} · ${c.job}" data-role="${i}"><span>${i+1}</span><small>${c.name}</small></button>`).join('');
 else if($('roles'))$('roles').innerHTML=crew.map((c,i)=>`<button style="--c:${c.color}" class="${i===role?'selected':''} ${i===role?'':'locked'}" data-role="${i}"><span>${i+1}</span><small>${c.name}</small></button>`).join('');
 document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>selectRole(Number(b.dataset.role)));
 // prompt
 const p=world.near;
 if(p&&!p.disabled){const label=promptLabel(p);
  $('prompt').innerHTML=`${label} <button id="interact">E · ${t('manage')}</button>`;
  if($('interact'))$('interact').onclick=interact}
 else $('prompt').innerHTML=t('promptWalk');
}
function statColor(k){return {energy:'#efbd69',life:'#72d4e7',safety:'#b8a0e5',food:'#91d7a3',water:'#7fc9e8',science:'#f4ce8d'}[k]||'#9db7c9'}
function cap(s){return s[0].toUpperCase()+s.slice(1)}
function promptLabel(p){
 switch(p.type){
  case 'module':{const r=rooms.find(r=>r.key===p.key);return r?r.label:p.key}
  case 'personalSurvey':return 'My mission · '+(RT.missions.find(m=>m.id===player.assignment?.id)?.title||'Scan');
  case 'rover':return player.rover?'Exit rover · R':'Board rover · R · battery '+Math.round(state.rover.battery)+'%';
  case 'workshop':return t('workshopTitle');
  case 'airlock':return world.scene==='base'?t('airlockOut'):t('airlockIn');
  case 'recharge':return t('roverRecharge');
  case 'deposit':return t('m1step4');
  case 'beacon':return t('m2step2');
  case 'node':return p.node.kind==='ore'?'Collect rock sample [E]':'Collect lunar dust [E]';
 }return ''}
// ---- panels ----
function settingsModal(){
 open(`<small>AURORA</small><h2>${t('settingsTitle')}</h2>
 <label>${t('crewName')} <input id="setName" maxlength="18" value="${String(settings.name||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}"></label>
 <label>${t('language')} <select id="setLang"><option value="es" ${lang==='es'?'selected':''}>Español</option><option value="en" ${lang==='en'?'selected':''}>English</option></select></label>
 <label>${t('music')} · ${t('track')} <select id="setTrack"><option value="0" ${!settings.track?'selected':''}>${t('musicOff')}</option>${[1,2,3,4].map(i=>`<option value="${i}" ${settings.track===i?'selected':''}>${i} · ${['Cosmic Lo-Fi','Echoes Among the Stars','Lo-Fi Space Cover','Silent Nebula Piano'][i-1]}</option>`).join('')}</select></label>
 <label>${t('volume')} <input id="setVol" type="range" min="0" max="1" step="0.05" value="${settings.vol}"></label>
 <label class="check"><input id="setMute" type="checkbox" ${settings.mute?'checked':''}> ${t('mute')}</label>
 <label>${t('cameraZoom')} <input id="setZoom" type="range" min="1.4" max="3.2" step="0.1" value="${settings.zoom}"></label>
 <p class="muted">${t('settingsInGame')}</p>
 <div class="buttons"><button data-close>Back</button></div>`);
 $('setName').oninput=e=>{settings.name=e.target.value.trim();saveSettings();const n=$('playerName');if(n)n.value=settings.name};
 $('setLang').onchange=e=>{settings.lang=e.target.value;saveSettings();setLang(settings.lang);settingsModal()};
 $('setTrack').onchange=e=>{settings.track=Number(e.target.value);saveSettings();music.start(settings.track)};
 $('setVol').oninput=e=>{settings.vol=Number(e.target.value);saveSettings();music.setVol()};
 $('setMute').onchange=e=>{settings.mute=e.target.checked;saveSettings();music.setVol();if(!settings.mute)sfx('click')};
 $('setZoom').oninput=e=>{settings.zoom=Number(e.target.value);saveSettings()};
}
function controlsModal(){
 const row=(k,d)=>`<div class="ctlRow"><kbd>${k}</kbd><span>${d}</span></div>`;
 open(`<small>AURORA</small><h2>${t('controlsTitle')}</h2>
 <div class="ctlList">
 ${row('W A S D · ↑ ← ↓ →',t('ctlMove'))}
 ${row('E',t('ctlInteract'))}
 ${row('R',t('ctlRover'))}
 ${row('F',t('ctlEat'))}
 ${row('1 · 2 · 3 · 4',t('ctlCrew'))}
 ${row('Esc',t('ctlMenu'))}
 ${row('J',t('ctlLog'))}
 ${row('← → (antenna)',t('ctlAntenna'))}
 </div><p class="muted">${t('ctlMouse')}</p>
 <div class="buttons"><button data-close>Back</button></div>`);
}
function pauseMenu(){
 open(`<small>MENU · MISSION CLOCK RUNNING</small><h2>${t('hudMenu').replace('Ⅱ ','')}</h2>
 <p>${t('promptWalk')} · ${t('ctlRover')} · ${t('ctlCrew')}</p>
 <div class="buttons">
 <button id="resumeBtn" class="primary">Continue</button>
 <button id="logBtn">${t('ctlLog')}</button>
 <button id="setBtn">${t('settings')}</button>
 <button id="ctlBtn">${t('controls')}</button>
 ${typeof mp!=='undefined'&&mp.code?`<button id="mpBtn">${t('mpTitle')}</button>`:''}
 <button id="saveBtn">${t('saveDone')}</button>
 <button id="titleBtn">${t('mainMenu')}</button>
 </div>`);
 $('resumeBtn').onclick=close;
 $('logBtn').onclick=journal;$('setBtn').onclick=settingsModal;$('ctlBtn').onclick=controlsModal;
 const mpb=$('mpBtn');if(mpb)mpb.onclick=()=>{close();multiplayerScreen()};
 $('saveBtn').onclick=()=>{if(mp?.code){mpUI(async()=>{mpApply(await mpCommand('presence',{x:player.x,y:player.y}));notify('Saved to Firebase · room '+mp.code)});return}save();notify(t('saveDone'))};
 $('titleBtn').onclick=()=>{if(mp?.code){mpSuspend();return}save();close();playing=false;$('hud').hidden=true;$('title').hidden=false;music.stop();$('resume').hidden=!load()};
}
