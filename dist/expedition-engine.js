'use strict';
const deposits=Array.from({length:12},(_,i)=>({id:i,x:180+(i*317)%1190,y:100+(i*193)%560,type:i%3===0?'ice':i%3===1?'ore':'sample'}));
function startClock(s,now){s.clock={started:now,last:now,elapsed:0,phase:0,actionAt:0};s.collected=[];}
function expeditionTick(s,players,now,engine){if(!s.clock||s.over)return;const c=s.clock,dt=Math.min(10,Math.max(0,(now-c.last)/1000));c.last=now;c.elapsed+=dt;
 if(c.elapsed-c.actionAt>=20){s.tasks=Math.min(5,s.tasks+1);s.computer=Math.min(3,s.computer+1);c.actionAt=c.elapsed}
 const phase=Math.floor(c.elapsed/120);if(phase>c.phase){c.phase=phase;const tasks=s.tasks;engine.advance(s);s.tasks=tasks}
 for(const p of Object.values(players)){p.suit??=100;p.health??=100;if(p.zone==='moon'){p.suit=Math.max(0,p.suit-dt*(p.rover?.13:.32));const h=hazardAt(c.elapsed),inside=Math.hypot(p.x-h.x,p.y-h.y)<h.radius;if(h.active&&inside)p.health=Math.max(0,p.health-dt*(p.rover?1.5:5));if(engine.storm(s))p.health=Math.max(0,p.health-dt*(p.rover?.5:2));if(!p.suit)p.health=Math.max(0,p.health-dt*5);if(p.health===0){p.zone='base';p.x=1360;p.y=550;p.rover=false;p.health=35;p.suit=40;s.morale=Math.max(0,s.morale-10);s.safety=Math.max(1,s.safety-8)}}else p.suit=Math.min(100,p.suit+dt*3)}
}
function hazardAt(seconds){const n=Math.floor(seconds/18),phase=seconds%18;return {x:240+(n*271)%1000,y:130+(n*137)%500,radius:120,active:phase>=5&&phase<=13,warning:phase<5}}
function expeditionAction(s,p,id,now){p.zone??='base';p.health??=100;p.suit??=100;
 if(id==='exit'&&p.zone==='base'){p.zone='moon';p.x=780;p.y=650;return true}
 if(id==='enter'&&p.zone==='moon'&&Math.hypot(p.x-780,p.y-650)<100){p.zone='base';p.x=1360;p.y=550;p.rover=false;return true}
 if(id==='rover'&&p.zone==='moon'&&(p.rover||Math.hypot(p.x-880,p.y-650)<110)){p.rover=!p.rover;return true}
 if(id==='rest'&&p.zone==='base'&&s.food>=3&&now-(p.restAt||0)>=60000){s.food-=3;s.morale=Math.min(100,s.morale+8);p.health=Math.min(100,p.health+30);p.restAt=now;return true}
 if(id==='collect'&&p.zone==='moon'){s.collected??=[];const d=deposits.find(d=>!s.collected.includes(d.id)&&Math.hypot(p.x-d.x,p.y-d.y)<75);if(!d)return false;s.collected.push(d.id);if(d.type==='ice')s.water=Math.min(100,s.water+8);if(d.type==='ore')s.materials=Math.min(100,s.materials+6);if(d.type==='sample'){s.science=Math.min(100,s.science+5);s.data+=5}return true}return false;
}
if(typeof module!=='undefined')module.exports={deposits,startClock,expeditionTick,expeditionAction,hazardAt};
