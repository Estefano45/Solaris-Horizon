 'use strict';
const DAY_SECONDS=RT.DAY;
const sim={hazards:[]};
function simDefaults(s){RT.init(s);s.scene??='base';s.rad??=0;return s}
function stormActive(s){return storm(s)&&s.dayTime>=25}
function stormWarning(s){return storm(s)&&s.dayTime>=16&&s.dayTime<25}
function missionStepKey(){return state.m1===1?'m1step2':state.m1===2?'m1step4':state.m2===1?'m2step1':state.m2===2?'m2step3':'missionNone'}
function tick(dt){if(!playing||state.over||mp?.code)return;player.scene=world.scene;RT.pilot(player);player.moving=moving;const day=state.day;RT.tick(state,{solo:player},dt);state.rad=player.rad;state.scene=player.scene;if(player.scene!==world.scene){world.scene=player.scene;notify('Medical evacuation. Rest in the Bedroom and eat in the Greenhouse.')}if(state.rover.driver==='solo'){state.rover.x=player.x;state.rover.y=player.y}if(day!==state.day){notify('New lunar day '+state.day);if(storm(state)){if($('dialog').open)notify('Solar activity detected. Shelter the crew and check Telecommunications.');else crisisNotice()}}if(state.over)report()}
async function expeditionDo(action,value){if(mp?.code){if(mp.busy||!mp.online)return;return mpUI(async()=>{const room=await mpCommand('expedition',{action,value});mpApply(room);sfx('success');refreshHUD()})}player.scene=world.scene;if(RT.action(state,player,action,value)){world.scene=player.scene;world.rover.x=state.rover.x;world.rover.y=state.rover.y;state.scene=player.scene;state.rad=player.rad;sfx('success');save();refreshHUD();return true}notify('Move closer and check your resources and cooldown.');return false}
function rest(){return expeditionDo('rest')}
function receiveMission(){return expeditionDo('mission')}
function collectSample(){return expeditionDo('sample')}
function scanBeacon(){return expeditionDo('beacon')}
function mine(node){return expeditionDo('mine',node.i)}
function craft(id){return expeditionDo('craft',id)}
function rechargeRover(){return expeditionDo('recharge')}
function deliverOnReturn(){}
function finishRun(){report()}
function failRun(reason){if(!mp?.code){state.over=true;state.won=false;endScreen(false,reason)}}
function endScreen(){playing=true;const labels={life:'base oxygen',food:'food',water:'water',energy:'energy',safety:'safety',crew:'crew'};open(`<small>LUNAR SURVIVAL</small><h2>Expedition over</h2><p>${state.failure==='crew'?'The crew has died.':'Essential resource depleted:'+(labels[state.failure]||'life support')+'.'}</p><div class="cost">Day ${state.day} · ${Math.floor((state.elapsed||0)/60)} minutes · Difficulty ${state.difficulty||1}<br>Science ${Math.floor(state.science)} · Samples analyzed ${(state.analyzed||[]).length}</div><div class="buttons"><button id="newRun">New expedition</button><button id="logBtn">Logbook</button></div>`);$('newRun').onclick=()=>{close();if(mp?.code)mpLeave();else start()};$('logBtn').onclick=journal}

Object.assign(sim,{tick,rest,receiveMission,missionStepKey,collectSample,scanBeacon,deliverOnReturn,mine,craft,rechargeRover,finishRun,failRun,endScreen,stormActive,stormWarning,simDefaults});
