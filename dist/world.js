'use strict';
// World: base map + lunar exterior, movement, collision, camera, rendering.
const TILE=32,ETILE=64;
const world={scene:'base',maps:{},props:{},rocks:{},points:{},remote:new Map(),near:null,stun:0,
 rover:{x:9.5*ETILE,y:7.5*ETILE,dir:0,active:true},cam:{x:0,y:0},target:{}};
function tileAt(map,tx,ty){if(tx<0||ty<0||tx>=map.w||ty>=map.h)return 4;return map.tiles[ty*map.w+tx]}
function solidTile(t){return t===0||t===2||t===4}
function buildBase(){
 const w=40,h=24,map={w,h,tiles:new Uint8Array(w*h),name:'base'};
 const rooms=[['dorm',1,1,9,9],['command',11,1,20,9],['telecom',22,1,28,9],['lab',30,1,38,9],
  ['greenhouse',1,14,8,22],['power',10,14,16,22],['life',18,14,24,22],['shield',26,14,31,22],['hangar',33,14,38,22]];
 map.rooms=rooms.map(([key,x0,y0,x1,y1])=>({key,x0,y0,x1,y1,cx:Math.floor((x0+x1)/2)}));
 for(const r of map.rooms){for(let x=r.x0;x<=r.x1;x++)for(let y=r.y0;y<=r.y1;y++){
  const edge=x===r.x0||x===r.x1||y===r.y0||y===r.y1;map.tiles[y*w+x]=edge?2:1}}
 // corridor rows + connectors
 for(let x=2;x<=37;x++){map.tiles[11*w+x]=1;map.tiles[12*w+x]=1}
 for(const r of map.rooms){const top=r.y1===9;
  const doorY=top?r.y1:r.y0,connY=top?r.y1+1:r.y0-1;
  map.tiles[doorY*w+r.cx]=1;map.tiles[connY*w+r.cx]=1}
 // metal floor in hangar + airlock pad
 for(let x=34;x<=37;x++)for(let y=15;y<=21;y++)map.tiles[y*w+x]=3;
 map.props=[
  {n:'bed',x:4.5,y:5.5},{n:'cryo',x:7.5,y:3.5},{n:'locker',x:2.5,y:2.5},
  {n:'command_console',x:15.5,y:3.5},{n:'dish',x:18.5,y:2.5},
  {n:'console',x:25.5,y:3.5},{n:'dish',x:23.5,y:2.5},
  {n:'lab_bench',x:34.5,y:4.5},{n:'locker',x:32.5,y:2.5},
  {n:'planter2',x:3.5,y:17.5},{n:'planter1',x:5.5,y:17.5},{n:'planter0',x:6.5,y:19.5},{n:'water',x:7.5,y:15.5},
  {n:'battery',x:12.5,y:16.5},{n:'battery',x:14.5,y:16.5},{n:'o2tank',x:11.5,y:20.5},
  {n:'o2tank',x:20.5,y:16.5},{n:'battery',x:28.5,y:16.5},{n:'o2tank',x:30.5,y:20.5},
  {n:'workbench',x:35.5,y:19.5},{n:'roverIn',x:36.5,y:20.5},
 ];
 map.points=[
  {x:5.5*TILE,y:4.5*TILE,type:'module',key:'dorm'},
  {x:15.5*TILE,y:5*TILE,type:'module',key:'command'},
  {x:25.5*TILE,y:5*TILE,type:'module',key:'telecom'},
  {x:34.5*TILE,y:6*TILE,type:'module',key:'science'},
  {x:4.5*TILE,y:19.5*TILE,type:'module',key:'food'},
  {x:13.5*TILE,y:19.5*TILE,type:'module',key:'power'},
  {x:21.5*TILE,y:19.5*TILE,type:'module',key:'life'},
  {x:28.5*TILE,y:19.5*TILE,type:'module',key:'shield'},
  {x:35.5*TILE,y:20.5*TILE,type:'workshop'},
  {x:37*TILE,y:17.5*TILE,type:'airlock'},
  {x:36.5*TILE,y:21.5*TILE,type:'recharge'},
 ];
 return map}
function buildExt(){
 const w=60,h=36,map={w,h,ts:64,tiles:new Uint8Array(w*h),name:'ext'};
 for(let i=0;i<w*h;i++)map.tiles[i]=((i%7)+(i/w|0)%5)%2?1:2;
 const crater=(cx,cy,r)=>{for(let x=Math.floor(cx-r);x<=cx+r;x++)for(let y=Math.floor(cy-r);y<=cy+r;y++)
  if(x>=0&&y>=0&&x<w&&y<h&&Math.hypot(x-cx,y-cy)<=r)map.tiles[y*w+x]=3};
 crater(27,24,4.5);crater(46,12,3);crater(12,6,2);
 // airlock structure (solid)
 for(let x=5;x<=7;x++)for(let y=5;y<=7;y++)map.tiles[y*w+x]=4;
 map.props=[{n:'airlock',x:6,y:6.6},{n:'deposit',x:28,y:24.4},{n:'beacon',x:46.5,y:12.4},
  {n:'rock3',x:10,y:14},{n:'rock1',x:18,y:10},{n:'rock2',x:24,y:16},{n:'rock3',x:33,y:22},
  {n:'rock1',x:41,y:18},{n:'rock2',x:50,y:8},{n:'rock3',x:54,y:28},{n:'rock1',x:14,y:30},
  {n:'rock2',x:36,y:6},{n:'rock1',x:52,y:20},{n:'rock2',x:8,y:22},{n:'rock3',x:30,y:32},
  {n:'rock1',x:44,y:30},{n:'rock2',x:57,y:14},{n:'o2tank',x:7,y:9}];
 map.nodes=[{i:0,kind:'ore',x:15,y:20},{i:1,kind:'ore',x:38,y:26},{i:2,kind:'ore',x:52,y:20},
  {i:3,kind:'ice',x:20,y:30},{i:4,kind:'ice',x:40,y:8}];
 map.points=[
  {x:6.5*ETILE,y:8.6*ETILE,type:'airlock'},
  {x:28.5*ETILE,y:25*ETILE,type:'deposit'},
  {x:46.5*ETILE,y:13*ETILE,type:'beacon'},
  ...map.nodes.map(nd=>({x:nd.x*ETILE+ETILE/2,y:nd.y*ETILE+ETILE/2,type:'node',node:nd}))];
 map.rocks=map.props.filter(p=>p.n.startsWith('rock')).map(p=>({x:p.x*ETILE+ETILE/2,y:p.y*ETILE+ETILE/2,r:p.n==='rock3'?22:p.n==='rock2'?12:17}));
 map.rocks.push({x:28.5*ETILE,y:25*ETILE,r:26},{x:46.5*ETILE,y:13*ETILE,r:18});
 return map}
world.init=function(){world.maps.base=buildBase();world.maps.ext=buildExt()}
function currentMap(){return world.maps[world.scene]}
function solidCircle(map,x,y,r){
 for(let tx=Math.floor((x-r)/map.ts);tx<=Math.floor((x+r)/map.ts);tx++)
  for(let ty=Math.floor((y-r)/map.ts);ty<=Math.floor((y+r)/map.ts);ty++)
   if(map.name==='ext'?(tileAt(map,tx,ty)===4):solidTile(tileAt(map,tx,ty))){
    const cx=Math.max(tx*map.ts,Math.min(x,(tx+1)*map.ts)),cy=Math.max(ty*map.ts,Math.min(y,(ty+1)*map.ts));
    if(Math.hypot(x-cx,y-cy)<r)return true}
 for(const rk of map.rocks||[])if(Math.hypot(x-rk.x,y-rk.y)<r+rk.r)return true;
 return false}
function walkable(scene,x,y,r=10){const map=world.maps[scene];if(!map)return false;
 map.ts=map.ts||TILE;return !solidCircle(map,x,y,r)}
// ---- scene transitions ----
function transition(){return expeditionDo(world.scene==='base'?'exit':'enter')}
function toggleRover(){return expeditionDo('rover')}
// ---- interaction detection ----
function updateInteract(){
 const map=currentMap();let best=null,bd=world.scene==='ext'?88:64;
 const points=map.points.filter(p=>!['deposit','beacon'].includes(p.type));const job=RT.missions.find(m=>m.id===player.assignment?.id);if(world.scene==='ext'&&player.assignment?.status==='active'&&job)points.unshift({type:'personalSurvey',x:job.x,y:job.y});if(world.scene==='ext'&&(!state.rover.driver||player.rover))points.push({type:'rover',x:state.rover.x,y:state.rover.y});
 for(const p of points){
  if(p.type==='recharge'&&world.scene==='ext')continue;
  const d=Math.hypot(player.x-p.x,player.y-(p.y-8));
  if(d<bd){bd=d;best=p}}
 if(best?.type==='deposit'&&state.m1!==1)best={...best,disabled:true};
 if(best?.type==='beacon'&&state.m2!==1)best={...best,disabled:true};
 if(best?.type==='node'&&state.mined?.includes(best.node.i))best=null;
 world.near=best}
// ---- per-frame update ----
function update(dt){
 if(!playing||!state||player.dead){moving=false;world.near=null;return;}const s=state,map=currentMap();map.ts=map.ts||TILE;
 world.stun=Math.max(0,world.stun-dt);
 if(world.stun>0||$('dialog').open){updateInteract();return}
 const inRover=!!player.rover&&world.scene==='ext';
 const speed=inRover?(s.rover.battery>0?300:85):world.scene==='ext'?(s.upgrades.boots?98:85):115;
 let dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),
     dy=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);
 const len=Math.hypot(dx,dy);moving=false;
 if(len){dx/=len;dy/=len;
  const oldX=player.x,oldY=player.y;const step=speed*dt,mx=dx*step,my=dy*step,r=inRover?16:10;
  if(!solidCircle(map,player.x+mx,player.y,r))player.x+=mx;
  if(!solidCircle(map,player.x,player.y+my,r))player.y+=my;
  moving=Math.hypot(player.x-oldX,player.y-oldY)>.001;facing=dx<0?-1:1;
  if(inRover){player.walk=(player.walk||0)+dt*7;const rr=world.rover;rr.x=player.x;rr.y=player.y;
   if(dy<0)rr.dir=1;else if(dy>0)rr.dir=0;else if(dx<0)rr.dir=2;else if(dx>0)rr.dir=3;player.dir=rr.dir}
  else{const p=player;const dir=dy<0?1:dy>0?0:dx<0?2:3;p.dir=dir;p.walk=(p.walk||0)+dt*7}
 }else if(player.rover){/* idle */}
 updateInteract()}
// ---- rendering ----
function draw(g,W,H){g.imageSmoothingEnabled=false;if(!playing){cozyMenu(g,W,H);return}
 const map=currentMap();map.ts=map.ts||TILE;const ts=map.ts,zoom=Math.max(1.2,Math.min(3.2,settings.zoom||2.2));
 const vw=W/zoom,vh=H/zoom;
 const targetX=Math.max(vw/2,Math.min(map.w*ts-vw/2,player.x));
 const targetY=Math.max(vh/2,Math.min(map.h*ts-vh/2,player.y-(world.scene==='base'?vh*.25:0)));
 world.cam.x+=(targetX-world.cam.x)*.12;
 world.cam.y+=(targetY-world.cam.y)*.12;
 const cx=world.cam.x,cy=world.cam.y;
 if(world.scene==='base')cozyLunarGround(g,W,H);else{g.fillStyle='#0a0d12';g.fillRect(0,0,W,H);}
 g.save();g.scale(zoom,zoom);g.translate(vw/2-cx,vh/2-cy);
 // tiles
 const x0=Math.max(0,Math.floor((cx-vw/2)/ts)),x1=Math.min(map.w-1,Math.ceil((cx+vw/2)/ts));
 const y0=Math.max(0,Math.floor((cy-vh/2)/ts)),y1=Math.min(map.h-1,Math.ceil((cy+vh/2)/ts));
 const tileImg=t=>world.scene==='ext'?(t===1?PIX.tiles.moon:t===2?PIX.tiles.moon2:t===3?PIX.tiles.crater:null):t===1?PIX.tiles.floor:t===2?PIX.tiles.wall:t===3?PIX.tiles.metal:null;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tileAt(map,x,y);const room=map.rooms?.find(r=>x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1);const img=world.scene==='base'&&t===1?cozyFloor(map,x,y):world.scene==='base'&&t===2&&room&&y!==room.y0?COZY.textures.wall_side:tileImg(t);
  if(img)g.drawImage(img,x*ts,y*ts,ts,ts);
  else if(world.scene==='ext'){g.fillStyle='#04070c';g.fillRect(x*ts,y*ts,ts,ts)}}
 if(world.scene==='base')cozyRoomDecor(g,map);
 // mission target marker
 drawTargetMarker(g,ts);
 // props sorted by y
 const props=[...map.props].sort((a,b)=>a.y-b.y);
 for(const p of props){let img=PIX.props[p.n];
  if(p.n==='planter0'||p.n==='planter1'||p.n==='planter2'){
   const st=state?.crop?Math.min(2,Math.floor((state.crop.progress/crops[state.crop.type].duration)*3)):0;
   img=PIX.props['planter'+st]}
  if(!img)continue;
  if(p.n==='roverIn'&&state?.rover?.unlocked)continue;
  const iw=img.width,ih=img.height;
  g.drawImage(img,p.x*ts+ts/2-iw/2,p.y*ts+ts-ih,iw,ih)}
 if(world.scene==='ext')for(const node of map.nodes){if(state.mined?.includes(node.i))continue;const img=PIX.props[node.kind];g.drawImage(img,node.x*ts+ts/2-img.width/2,node.y*ts+ts/2-img.height/2);}
 // One shared rover, rendered once. The driver avatar is hidden.
 if(world.scene==='ext'){const driver=Object.values(mp?.room?.players||{}).find(p=>p.uid===state.rover.driver);const dir=player.rover?world.rover.dir:driver?.dir||0;const rolling=player.rover?moving:driver?.moving;g.drawImage(COZY.textures.rover_driver,rolling?(Math.floor(time*7)%2)*48:0,dir*48,48,48,world.rover.x-36,world.rover.y-36,72,72);g.font='bold 8px monospace';g.textAlign='center';g.fillStyle='#0b152b';g.fillRect(world.rover.x-56,world.rover.y-51,112,13);g.fillStyle='#ffe9a0';g.fillText(player.rover?'ROVER · R TO EXIT':driver?.name||'ROVER · E / R TO BOARD',world.rover.x,world.rover.y-41);}
 // remote players
 for(const [uid,rp] of world.remote){if(rp.dead||rp.scene!==world.scene)continue;
  rp.renderX+=(rp.x-rp.renderX)*.16;rp.renderY+=(rp.y-rp.renderY)*.16;
  if(!rp.rover)drawAstronautAt(g,rp.renderX,rp.renderY,rp.color,rp.dir||0,rp.moving?(time*8|0)%4:0,rp.name,.9)}
 // local player
 if(!player.dead&&!player.rover)drawAstronautAt(g,player.x,player.y,crew[role].color,player.dir||0,moving?(player.walk|0)%4:0,settings.name||crew[role].name,1);
 if(world.scene==='base'){cozyLight(g,map);cozyEntrances(g,map);}
 // hazards rings
 for(const hazard of (world.scene==='ext'?RT.hazards(state):[])){if(!hazard.active&&!hazard.warning)continue;const h={x:hazard.x,y:hazard.y};const pr=hazard.active?.9:.4;
  g.strokeStyle=pr<.75?'rgba(240,180,80,'+(0.5+0.4*Math.sin(time*10))+')':'rgba(240,90,60,.95)';
  g.lineWidth=3;g.beginPath();g.arc(h.x,h.y,180,0,7);g.stroke();
  g.fillStyle='rgba(240,90,60,'+(pr*.18)+')';g.beginPath();g.arc(h.x,h.y,180,0,7);g.fill();if(hazard.active)for(let i=0;i<65;i++){const a=i*2.4,rr=Math.sqrt((i+1)/65)*170,px=h.x+Math.cos(a+time*.3)*rr,py=h.y+Math.sin(a+time*.3)*rr;g.fillStyle=i%2?'#ffba63':'#ff654a';g.fillRect(px,py,3+(i%3)*2,2)}g.font='bold 9px monospace';g.textAlign='center';g.fillStyle='#ffe6b5';g.fillText(hazard.active?'RADIATION · DAMAGE ON CONTACT':'ALERT · LEAVE THE AREA',h.x,h.y-188)}
 drawInteractionPulse(g);
 // interaction marker
 if(world.near&&!world.near.disabled){const p=world.near,pu=1+Math.sin(time*5)*.15;
  g.fillStyle='rgba(10,20,28,.85)';g.beginPath();g.arc(p.x,p.y-26,11*pu,0,7);g.fill();
  g.strokeStyle='#8be0b9';g.lineWidth=2;g.stroke();g.fillStyle='#bdf5d8';
  g.font='800 12px Silkscreen,monospace';g.textAlign='center';g.fillText('E',p.x,p.y-22)}
 g.restore();
 // night overlay
 if(world.scene==='ext'&&state&&night(state)){
  const lamp=(state.upgrades?.lamp?460:280)*1;
  const grad=g.createRadialGradient(W/2+(player.x-cx)*zoom,H/2+(player.y-cy)*zoom,lamp*zoom*.22,W/2+(player.x-cx)*zoom,H/2+(player.y-cy)*zoom,lamp*zoom);
  grad.addColorStop(0,'rgba(3,6,12,0)');grad.addColorStop(1,'rgba(3,6,12,.88)');
  g.fillStyle=grad;g.fillRect(0,0,W,H)}
 // Navigation inset uses the same map coordinates as missions and resources.
 if(playing&&world.scene==='ext'&&W>650){const mw=180,mh=108,mx=W-mw-24,my=H-mh-110;g.fillStyle='#07131ee8';g.fillRect(mx-8,my-25,mw+16,mh+34);g.strokeStyle='#7fa5b3';g.strokeRect(mx-8,my-25,mw+16,mh+34);g.fillStyle='#badbe5';g.font='10px Silkscreen,monospace';g.textAlign='left';g.fillText(lang==='en'?'SURFACE RADAR':'RADAR DE SUPERFICIE',mx,my-10);const dot=(x,y,c,r=3)=>{g.fillStyle=c;g.fillRect(mx+x/(map.w*ts)*mw-r,my+y/(map.h*ts)*mh-r,r*2,r*2)};dot(416,550,'#91d7a3',4);for(const n of map.nodes)if(!state.mined.includes(n.i))dot(n.x*ts+32,n.y*ts+32,n.kind==='ice'?'#72d4e7':'#efbd69',2);const assignment=RT.missions.find(m=>m.id===player.assignment?.id);if(player.assignment?.status==='active'&&assignment)dot(assignment.x,assignment.y,'#ffffff',4);if(!mp?.code&&state.m1===1)dot(1824,1600,'#ffffff',4);if(!mp?.code&&state.m2===1)dot(2976,832,'#ffffff',4);dot(world.rover.x,world.rover.y,'#efbd69',3);dot(player.x,player.y,'#ff7b83',3);}
 // radiation / storm tint
 if(state){if(state.rad>40){g.fillStyle='rgba(220,60,40,'+Math.min(.32,(state.rad-40)/220)+')';g.fillRect(0,0,W,H)}
  if(stormActive(state)&&world.scene==='ext'){g.fillStyle='rgba(220,120,40,'+(0.1+0.05*Math.sin(time*3))+')';g.fillRect(0,0,W,H)}
  if(stormWarning(state)&&world.scene==='ext'){g.fillStyle='rgba(220,120,40,'+(0.04+0.03*Math.sin(time*8))+')';g.fillRect(0,0,W,H)}}
}
function roomLabel(key){const L={dorm:'BEDROOM',command:'COMMAND CENTER',telecom:'TELECOM',lab:'LABORATORY',greenhouse:'GREENHOUSE',power:'POWER',life:'LIFE SUPPORT',shield:'SHELTER',hangar:'HANGAR'};return L[key]||key}
function drawTargetMarker(g){if(state&&!player.dead)drawPersonalTarget(g)}
function drawAstronautAt(g,x,y,color,dir,frame,name,alpha){
 const sheet=PIX.sheets.astro[color]||PIX.sheets.astro['#efbd69'];
 g.save();g.globalAlpha=alpha??1;
 g.drawImage(sheet,frame*32,dir*32,32,32,x-16,y-16,32,32);
 if(name){g.font='700 10px Silkscreen,monospace';g.textAlign='center';
  g.fillStyle='rgba(6,12,20,.8)';const w=g.measureText(name).width+8;
  g.fillRect(x-w/2,y-34,w,14);g.fillStyle='#dff3ea';g.fillText(name,x,y-23)}
 g.restore()}
function setRemote(uid,data){const old=world.remote.get(uid);world.remote.set(uid,Object.assign({renderX:old?.renderX??data.x,renderY:old?.renderY??data.y},data))}
function removeRemote(uid){world.remote.delete(uid)}
function clearRemote(){world.remote.clear()}
Object.assign(world,{update,draw,transition,toggleRover,setRemote,removeRemote,clearRemote,walkable});
