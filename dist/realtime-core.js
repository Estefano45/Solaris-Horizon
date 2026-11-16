'use strict';
// One authoritative simulation, shared by the browser (solo) and room server.
const RT=(()=>{
 const E=typeof module!=='undefined'?require('./engine.js'):{night,optimum,capacity,thermal,thermalData,studyData,protocolEnergy,crops,clamp,storm,solarProfile,currentCrisis};
 const DAY=180,nodes=[{i:0,kind:'ore',x:15,y:20},{i:1,kind:'ore',x:38,y:26},{i:2,kind:'ore',x:52,y:20},{i:3,kind:'ice',x:20,y:30},{i:4,kind:'ice',x:40,y:8}];
 function init(s){s.realtime=true;s.survival=true;s.sampleQueue??=[];s.analyzed??=[];s.totalScience??=s.science||0;s.difficulty??=1;delete s.tasks;s.radiation??=0;s.elapsed??=0;s.dayTime??=0;s.power??={life:4,shield:2,green:4};s.rover??={battery:100,unlocked:false};s.rover.unlocked=true;s.rover.x??=608;s.rover.y??=480;s.upgrades??={o2:false,boots:false,lamp:false};s.mats??={ice:0,ore:0};s.mined??=[];s.m1??=0;s.m2??=0;s.mission??=0;return s}
 function pilot(p){p.samples??=[];p.dead??=false;p.scene??='base';p.health??=100;p.suit??=100;p.rad??=0;p.rover??=false;p.nutrition??=100;p.airBuffer??=p.scene==='ext'?0:20;return p}
 const missions=[{id:'ice',title:'South Crater Dust',x:1824,y:1600,goal:'Collect lunar dust from the south crater.',kind:'dust'},{id:'beacon',title:'North Crater Rocks',x:2976,y:832,goal:'Collect a rock near the north beacon.',kind:'rock'},{id:'ore',title:'Basalt Outcrop',x:2464,y:1696,goal:'Collect a basalt sample.',kind:'rock'},{id:'water',title:'Northeast Regolith',x:2592,y:544,goal:'Collect lunar dust from the northeast.',kind:'dust'}];
 function syncMission(s,p){if(p.assignment?.status==='deposited'&&s.analyzed.includes(p.assignment.token)){p.assignment.status='done';p.completed=(p.completed||0)+1}}
 function hazard(s,index=0){const elapsed=s.elapsed+index*4,n=Math.floor(elapsed/12),phase=elapsed%12;return {x:500+((n+index*3)*377)%2600,y:500+((n+index*2)*257)%1400,radius:180,warning:phase<3,active:phase>=3&&phase<10}}
 function hazards(s){return Array.from({length:Math.min(6,3+Math.floor(((s.difficulty||1)-1)/2))},(_,i)=>hazard(s,i))}
 function tick(s,people,dt,crewState=people){if(s.over||!(dt>0))return;init(s);const depletedBefore=['life','water','food','safety'].find(k=>s[k]<=0)||((s.energy<=0&&s.charge<=0)?'energy':null);dt=Math.min(10,dt);s.elapsed+=dt;s.dayTime+=dt;s.difficulty=1+Math.floor((s.day-1)/3);const difficulty=1+Math.min(1.5,(s.difficulty-1)*.12);const spend=amount=>{const n=amount*difficulty;if(s.energy<n&&E.night(s)){const d=Math.min(s.charge,n-s.energy);s.charge-=d;s.energy+=d}if(s.energy<n)return false;s.energy-=n;return true};
  if(E.storm(s)&&s.dayTime>=25&&s.solarApplied!==s.day){s.panelHealth=Math.min(s.panelHealth,E.solarProfile(s).health);s.solarApplied=s.day;s.log.unshift('DONKI solar activity reduced panel output and communications quality and increased outdoor exposure. Effects are simulated.')}
  if(!E.night(s)){let a=Math.max(0,Math.cos((s.angle-E.optimum(s))*Math.PI/180));if(s.auto&&spend(4/DAY*dt))a=1;s.energy=Math.min(100,s.energy+45/DAY*a*s.panelHealth/100*dt)}
  if(s.leak&&!spend(6/DAY*dt))s.life-=6/DAY*dt;
  const heat=E.thermal(s);if(heat){const powered=heat.mode!=='off'&&spend(heat.cost/DAY*dt);s.cabinC=powered?heat.setpoint:(s.cabinC??22)+Math.sign(heat.exteriorC-(s.cabinC??22))*.12*dt}else if(E.night(s)&&!spend(14/DAY*dt))s.safety-=12/DAY*dt;
  const comfy=s.cabinC>=12&&s.cabinC<=30;if(!comfy){s.safety-=12/DAY*dt;s.morale-=6/DAY*dt}
  const active=spend((s.lifeMode==='normal'?8:3)/DAY*dt),allocation=.8+s.power.life*.05;
  s.life+=((active?(s.lifeMode==='normal'?18:10)*s.efficiency/100*allocation:0)-14-(s.leak?14:0))/DAY*dt;
  if(!active)s.safety-=10/DAY*dt;s.water-=4*difficulty/DAY*dt;s.safety-=2*difficulty/DAY*dt;
  if(E.storm(s)&&s.dayTime>=25)s.safety-=((s.shelters<3?E.solarProfile(s).exposure:0)+4)/DAY*dt;
  if(s.crop&&s.crop.progress<E.crops[s.crop.type].duration&&s.light!=='off'&&comfy&&s.crop.moisture>0){const cost=s.light==='protocol'?E.protocolEnergy(s):s.light==='high'?9:4;if(spend(cost/DAY*dt)){s.crop.progress=Math.min(E.crops[s.crop.type].duration,s.crop.progress+(s.light==='high'?2:1)*(.6+s.power.green*.1)/DAY*dt);s.crop.moisture=Math.max(0,s.crop.moisture-dt/DAY);if(s.light==='protocol'&&E.studyData(s)&&Math.abs(s.cabinC-E.studyData(s).temperatureC)<=3)s.crop.protocolTurns=(s.crop.protocolTurns||0)+dt/DAY}}
  s.computer=Math.min(3,s.computer+dt/20);s.morale+=((s.buildings||[]).includes('dorm')?8:-3)/DAY*dt;
  if(s.construction){s.construction.remaining-=dt/DAY;if(s.construction.remaining<=0){if(s.construction.type==='shelter')s.shelters=3;else s.buildings.push(s.construction.type);s.construction=null}}
  const fields=hazards(s);s.radiation=Math.min(100,(E.storm(s)?(s.dayTime>=25?60:30):5)+fields.filter(h=>h.active).length*8);
  for(const [uid,p] of Object.entries(people)){pilot(p);syncMission(s,p);if(p.dead)continue;const exercising=p.moving&&(p.activityUntil===undefined||s.elapsed<=p.activityUntil);const foodBurn=exercising?(p.rover?.035:p.scene==='ext'?.24:.18):0;p.nutrition=Math.max(0,p.nutrition-foodBurn*dt);if(p.nutrition===0)p.health=Math.max(0,p.health-dt);
   if(p.scene==='ext'){const savedSeconds=Math.min(dt,p.airBuffer);p.airBuffer-=savedSeconds;p.suit=Math.max(0,p.suit-(dt-savedSeconds)*.4*(s.upgrades.o2?.65:1)*(p.rover?.6:1));if(p.rover)s.rover.battery=Math.max(0,s.rover.battery-.3*dt);let radiation=E.storm(s)&&s.dayTime>=25?1.2:.08;const hit=fields.some(h=>h.active&&Math.hypot(p.x-h.x,p.y-h.y)<h.radius);const protection=(s.upgrades.radiation?.5:1)*(p.rover?.6:1);if(hit){radiation+=2.5;p.health=Math.max(0,p.health-3*protection*difficulty*dt);}p.rad=Math.min(100,p.rad+radiation*(1-s.power.shield*.06)*protection*dt);if((p.suit===0&&p.airBuffer===0)||p.rad>=100)p.health=Math.max(0,p.health-8*dt);
   }else{const refill=Math.min(100-p.suit,dt*2,Math.max(0,s.life-20)*50);p.suit+=refill;s.life-=refill*.02;if(s.life>20&&p.airBuffer<20){const recovered=Math.min(20-p.airBuffer,dt);p.airBuffer+=recovered;s.life-=recovered*.005}p.rad=Math.max(0,p.rad-dt*3)}
   if(p.health===0){p.dead=true;p.rover=false;p.moving=false;p.diedOn=s.day;if(s.rover.driver===uid)delete s.rover.driver;s.log.unshift((p.name||'Astronaut')+'  has died. Their expedition is over.')}
  }
  if(s.dayTime>=DAY){s.dayTime-=DAY;s.day++;s.difficulty=1+Math.floor((s.day-1)/3);s.efficiency=Math.max(15,s.efficiency-7);if(s.day%3===0)s.leak=true;s.mined=[];s.log.unshift('Day '+s.day+' · difficulty '+s.difficulty+'. New samples are available. Resource demand and risk increase every three days.');}
  E.clamp(s);const failed=depletedBefore||['life','water','food','safety'].find(k=>s[k]<=0);const crew=Object.values(crewState);
  if(failed||(s.energy<=0&&s.charge<=0)||(crew.length&&crew.every(p=>p.dead))){s.over=true;s.won=false;s.failure=failed||((s.energy<=0&&s.charge<=0)?'energy':'crew');}s.log=s.log.slice(0,100);

 }
 function action(s,p,id,value,uid='solo'){init(s);pilot(p);syncMission(s,p);if(s.over||p.dead)return false;const close=(x,y,r=100)=>Math.hypot(p.x-x,p.y-y)<=r;
  if(id==='exit'&&p.scene==='base'&&close(1184,560)){p.scene='ext';p.x=416;p.y=614;p.rover=false;return true}
  if(id==='enter'&&p.scene==='ext'&&close(416,550,120)){if(p.rover){s.rover.x=p.x;s.rover.y=p.y;delete s.rover.driver}p.rover=false;p.scene='base';p.x=1168;p.y=592;return true}
  if(id==='rover'&&p.scene==='ext'){if(p.rover){p.rover=false;delete s.rover.driver;s.rover.x=p.x;s.rover.y=p.y;return true}if(s.rover.unlocked&&s.rover.battery>0&&!s.rover.driver&&close(s.rover.x,s.rover.y,90)){p.rover=true;s.rover.driver=uid;return true}return false}
  if(id==='mission'&&p.scene==='base'&&close(496,160)){if(p.assignment&&p.assignment.status!=='done')return false;const cycle=(p.completed||0);p.assignment={id:missions[((p.slot||0)+cycle)%4].id,status:'active',token:uid+':'+cycle+':'+s.elapsed};return true}
  if(['survey','sample','beacon'].includes(id)&&p.scene==='ext'&&p.assignment?.status==='active'){const job=missions.find(m=>m.id===p.assignment.id);if(job&&close(job.x,job.y)){p.samples.push({type:job.kind,token:p.assignment.token});p.assignment.status='collected';return true}return false}
  if(id==='mine'&&p.scene==='ext'){const n=nodes.find(n=>n.i===value);if(!n||s.mined.includes(n.i)||!close(n.x*64+32,n.y*64+32))return false;s.mined.push(n.i);p.samples.push({type:n.kind==='ore'?'rock':'dust',token:uid+':node:'+s.day+':'+n.i});return true}
  if(id==='deposit'&&p.scene==='base'&&close(1104,192)&&p.samples.length){for(const sample of p.samples)s.sampleQueue.push({...sample,owner:uid});p.samples=[];if(p.assignment?.status==='collected')p.assignment.status='deposited';return true}
  if(id==='eat'&&p.scene==='base'&&close(144,624)&&s.food>=5&&p.nutrition<100){s.food-=5;p.nutrition=Math.min(100,p.nutrition+35);return true}
  if(id==='rest'&&p.scene==='base'&&close(176,144)&&p.health<100&&s.elapsed-(p.restAt??-100)>=45){p.health=Math.min(100,p.health+30);p.restAt=s.elapsed;return true}
  if(id==='recharge'&&p.scene==='base'&&close(1168,688,125)&&s.energy>=10&&s.rover.battery<100){s.energy-=10;s.rover.battery=Math.min(100,s.rover.battery+35);return true}
  if(id==='craft'&&p.scene==='base'&&close(1136,656)){const costs={o2:{ice:3,ore:2},boots:{ice:0,ore:4},lamp:{ice:2,ore:3}},c=costs[value];if(!c||s.upgrades[value]||s.mats.ice<c.ice||s.mats.ore<c.ore)return false;s.mats.ice-=c.ice;s.mats.ore-=c.ore;s.upgrades[value]=true;return true}
  if(id==='power'&&p.scene==='base'&&close(496,160)&&value&&['life','shield','green'].every(k=>Number.isInteger(value[k])&&value[k]>=0&&value[k]<=10)&&value.life+value.shield+value.green===10){s.power={life:value.life,shield:value.shield,green:value.green};return true}return false;
 }
 return {DAY,nodes,init,pilot,tick,action,hazard,hazards,missions,syncMission};
})();
if(typeof module!=='undefined')module.exports=RT;
