'use strict';
// Procedural pixel-art textures: astronaut/rover sheets, tiles, props and effects.
const PIX={sheets:{},tiles:{},props:{}};
function pcv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return [c,g]}
function R(g,x,y,w,h,col){g.fillStyle=col;g.fillRect(x,y,w,h)}
function shade(hex,f){const n=parseInt(hex.slice(1),16);const r=Math.max(0,Math.min(255,(n>>16)*f))|0,gg=Math.max(0,Math.min(255,((n>>8)&255)*f))|0,b=Math.max(0,Math.min(255,(n&255)*f))|0;return '#'+((1<<24)+(r<<16)+(gg<<8)+b).toString(16).slice(1)}
// ---- astronaut sheet: 32x32 cells, rows 0=S 1=N 2=W 3=E, 4 walk frames ----
function buildAstronaut(color){const [c,g]=pcv(128,128);for(let d=0;d<4;d++)for(let f=0;f<4;f++)drawAstronautFrame(g,f*32,d*32,['down','up','left','right'][d],[0,1,0,2][f],color);return c}
// ---- rover sheet: 48x32 top-down, rows 0=S 1=N 2=W 3=E, 2 frames ----
function drawRover(g,ox,oy,dir,frame){
 const body='#c9d4dc',dark='#5c6f7d',acc='#e2b13c';
 g.globalAlpha=.3;R(g,ox+6,oy+27,36,4,'#000000');g.globalAlpha=1;
 if(dir===0||dir===1){ // vertical
  R(g,ox+8,oy+6,14,20,body);R(g,ox+8,oy+6,14,2,'#f2f8fb');R(g,ox+10,oy+9,10,7,'#28455e'); // cabin
  R(g,ox+9,oy+18,12,6,dark); // cargo
  for(const wy of [7,15,22]){R(g,ox+5,oy+wy,3,5,frame?'#31424d':'#3e5460');R(g,ox+22,oy+wy,3,5,frame?'#31424d':'#3e5460')}
  R(g,ox+13,oy+(dir===0?25:4),4,3,acc); // headlight
 }else{ // horizontal
  R(g,ox+6,oy+9,26,14,body);R(g,ox+6,oy+9,26,2,'#f2f8fb');R(g,ox+10,oy+11,9,9,'#28455e');
  R(g,ox+22,oy+12,8,8,dark);
  for(const wx of [8,16,24]){R(g,ox+wx,oy+6,5,3,frame?'#31424d':'#3e5460');R(g,ox+wx,oy+23,5,3,frame?'#31424d':'#3e5460')}
  R(g,ox+(dir===2?4:29),oy+14,3,4,acc);
 }
}
function buildRover(){const [c,g]=pcv(96,128);for(let d=0;d<4;d++)for(let f=0;f<2;f++)drawRover(g,f*48,d*32,d,f);return c}
// ---- tiles ----
function noise(g,x,y,w,h,cols,n){for(let i=0;i<n;i++)R(g,x+Math.floor(Math.random()*w),y+Math.floor(Math.random()*h),1,1,cols[i%cols.length])}
function buildTile(name){const T=32,[c,g]=pcv(T,T);
 switch(name){
  case 'moon':{R(g,0,0,T,T,'#8e8880');noise(g,0,0,T,T,['#7c776f','#9c968e','#847e76'],46);R(g,4,6,3,2,'#6f6a63');R(g,20,18,4,3,'#6f6a63');R(g,12,25,2,2,'#6f6a63');break}
  case 'moon2':{R(g,0,0,T,T,'#877f76');noise(g,0,0,T,T,['#767068','#948d84','#8a8279'],46);R(g,22,5,3,2,'#6b655e');R(g,7,20,4,2,'#6b655e');break}
  case 'crater':{R(g,0,0,T,T,'#6e6962');noise(g,0,0,T,T,['#625d57','#7a746c'],36);g.strokeStyle='#56514b';g.lineWidth=2;g.beginPath();g.arc(16,16,9,0,7);g.stroke();R(g,12,12,8,4,'#5b5650');break}
  case 'floor':{R(g,0,0,T,T,'#20323f');g.strokeStyle='#2c4354';g.lineWidth=1;g.strokeRect(.5,.5,T-1,T-1);g.beginPath();g.moveTo(16,0);g.lineTo(16,32);g.moveTo(0,16);g.lineTo(32,16);g.stroke();noise(g,0,0,T,T,['#263a49','#1c2c38'],14);break}
  case 'wall':{R(g,0,0,T,T,'#3c586c');R(g,0,0,T,3,'#5d7d92');R(g,0,T-3,T,3,'#26394a');g.strokeStyle='#2b4152';g.strokeRect(.5,.5,T-1,T-1);R(g,4,8,10,3,'#4b6b80');R(g,18,18,10,3,'#4b6b80');break}
  case 'metal':{R(g,0,0,T,T,'#4a5b66');for(let i=0;i<T;i+=8)R(g,i,0,1,T,'#3c4b55');R(g,0,0,T,2,'#5d7180');R(g,0,T-2,T,2,'#333f48');break}
 }return c}
// ---- props (anchor: bottom-center) ----
function buildProp(name){let w=32,h=32;const sizes={bed:[32,48],command_console:[38,34],console:[34,30],lab_bench:[40,30],cryo:[30,44],planter0:[36,26],planter1:[36,26],planter2:[36,26],water:[24,34],workbench:[40,28],locker:[22,36],airlock:[52,52],rock1:[26,20],rock2:[18,14],rock3:[34,24],ore:[22,20],ice:[22,22],deposit:[42,36],beacon:[26,42],o2tank:[20,34],battery:[30,26],dish:[36,36],roverIn:[48,32]};
 [w,h]=sizes[name]||[32,32];const [c,g]=pcv(w,h);
 const B=w/2; // bottom anchor helper: draw with y measured from bottom
 const yb=(y,hh)=>h-1-y-hh;
 switch(name){
  case 'bed':{R(g,B-13,yb(0,42),26,42,'#31465a');R(g,B-11,yb(2,38),22,36,'#9db7c9');R(g,B-11,yb(2,10),22,8,'#7fa2b8');R(g,B-13,yb(0,42),26,3,'#4a6478');R(g,B-9,yb(30,8),18,7,'#e8f2f7');break}
  case 'cryo':{R(g,B-11,yb(0,40),22,40,'#4b6d84');R(g,B-9,yb(3,32),18,28,'#9fd8e8');R(g,B-9,yb(3,32),6,28,'#c9ecf5');R(g,B-11,yb(0,40),22,3,'#658ba3');R(g,B-6,yb(20,3),12,2,'#4b6d84');break}
  case 'command_console':{R(g,B-16,yb(0,14),32,14,'#3a4d5c');R(g,B-15,yb(16,14),30,14,'#243542');R(g,B-13,yb(19,9),11,7,'#35d0c0');R(g,B+1,yb(19,9),11,7,'#35d0c0');R(g,B-13,yb(20,3),4,2,'#bffff6');R(g,B+2,yb(22,3),6,2,'#bffff6');break}
  case 'console':{R(g,B-14,yb(0,10),28,10,'#3a4d5c');R(g,B-13,yb(12,12),26,12,'#243542');R(g,B-11,yb(14,8),22,8,'#35d0c0');R(g,B-9,yb(16,3),8,2,'#bffff6');R(g,B+2,yb(17,2),6,2,'#8fe8dc');break}
  case 'lab_bench':{R(g,B-18,yb(0,10),36,10,'#41586a');R(g,B-18,yb(10,4),36,3,'#2c3f4d');R(g,B-14,yb(14,8),10,8,'#79cfe0');R(g,B+2,yb(15,7),9,7,'#a9e2b1');R(g,B+4,yb(17,3),4,3,'#e2b13c');break}
  case 'planter0':{R(g,B-15,yb(0,14),30,14,'#4a4038');R(g,B-13,yb(2,10),26,8,'#5d4f42');noise(g,B-13,yb(3,7),26,6,['#6b5c4c','#544739'],16);break}
  case 'planter1':{R(g,B-15,yb(0,14),30,14,'#4a4038');noise(g,B-13,yb(3,7),26,6,['#6b5c4c','#544739'],14);for(const px of [-10,0,10]){R(g,B+px-1,yb(8,6),3,6,'#4f7a3f');R(g,B+px-2,yb(10,3),5,2,'#69a351')}break}
  case 'planter2':{R(g,B-15,yb(0,14),30,14,'#4a4038');noise(g,B-13,yb(3,7),26,6,['#6b5c4c','#544739'],12);for(const px of [-10,0,10]){R(g,B+px-1,yb(5,10),3,10,'#549144');R(g,B+px-3,yb(8,5),7,4,'#7cc463');R(g,B+px-3,yb(6,3),7,3,'#9ad97e')}break}
  case 'water':{R(g,B-8,yb(0,26),16,26,'#41586a');R(g,B-6,yb(3,18),12,14,'#79cfe0');R(g,B-4,yb(6,4),8,4,'#d9f4fa');R(g,B-2,yb(24,4),4,4,'#e2b13c');break}
  case 'workbench':{R(g,B-18,yb(0,12),36,12,'#5a4634');R(g,B-18,yb(12,4),36,3,'#43331f');R(g,B-13,yb(14,7),8,4,'#c9d4dc');R(g,B-2,yb(15,6),10,3,'#e2b13c');R(g,B+8,yb(14,6),5,5,'#79cfe0');break}
  case 'locker':{R(g,B-9,yb(0,32),18,32,'#54718a');R(g,B-7,yb(2,28),14,26,'#3f5a72');R(g,B-1,yb(14,2),2,10,'#8fb0c4');R(g,B-9,yb(0,32),18,2,'#6d8ba3');break}
  case 'airlock':{R(g,4,4,w-8,h-12,'#46586a');R(g,7,7,w-14,h-18,'#2c3d4c');R(g,B-10,yb(6,20),20,20,'#8fb0c4');R(g,B-7,yb(9,14),14,14,'#1d2b36');R(g,B-10,yb(6,3),20,3,'#a9c9dc');R(g,B-2,yb(28,4),4,4,'#e2b13c');g.strokeStyle='#7495a5';g.lineWidth=2;g.strokeRect(4,4,w-8,h-12);break}
  case 'rock1':{R(g,B-11,yb(2,16),22,14,'#7a746c');R(g,B-8,yb(5,10),14,7,'#8e8880');R(g,B-4,yb(4,4),8,3,'#655f58');break}
  case 'rock2':{R(g,B-7,yb(2,11),14,9,'#847e76');R(g,B-4,yb(5,5),8,4,'#98928a');break}
  case 'rock3':{R(g,B-15,yb(3,19),30,16,'#756f67');R(g,B-11,yb(7,11),20,8,'#8a847c');R(g,B-5,yb(5,5),10,3,'#625c55');break}
  case 'ore':{R(g,B-8,yb(4,13),16,13,'#6e5b46');R(g,B-5,yb(7,7),10,7,'#c98f3c');R(g,B-3,yb(9,3),5,3,'#f2c76a');R(g,B+2,yb(6,2),3,2,'#f2c76a');break}
  case 'ice':{R(g,B-8,yb(4,15),16,15,'#7fa9c9');R(g,B-4,yb(7,9),8,9,'#c9ecf5');R(g,B-2,yb(9,4),4,4,'#ffffff');R(g,B+2,yb(12,2),3,2,'#e7f7ff');break}
  case 'deposit':{R(g,B-18,yb(4,26),36,22,'#6f95b5');R(g,B-13,yb(9,17),26,14,'#a9d8ef');R(g,B-9,yb(12,10),18,8,'#e9f8ff');R(g,B-5,yb(14,5),9,4,'#ffffff');R(g,B+6,yb(10,4),5,3,'#d9f2fc');break}
  case 'beacon':{R(g,B-2,yb(0,26),5,26,'#8b9aa6');R(g,B-8,yb(0,8),16,5,'#5c6f7d');R(g,B-6,yb(26,12),12,10,'#c9d4dc');R(g,B-3,yb(30,6),7,5,'#e2b13c');R(g,B-1,yb(34,3),4,3,'#fff3c9');break}
  case 'o2tank':{R(g,B-7,yb(0,28),14,28,'#3f5a72');R(g,B-5,yb(3,20),10,18,'#79cfe0');R(g,B-3,yb(6,3),6,3,'#d9f4fa');R(g,B-4,yb(26,4),8,4,'#c2d6e2');break}
  case 'battery':{R(g,B-13,yb(0,20),26,20,'#33465480');R(g,B-11,yb(2,16),22,16,'#3f5a72');R(g,B-8,yb(5,10),7,10,'#8be08b');R(g,B+1,yb(5,10),7,10,'#e2b13c');R(g,B-11,yb(2,16),22,2,'#5d7d92');break}
  case 'dish':{R(g,B-3,yb(0,18),6,18,'#5c6f7d');g.fillStyle='#c9d4dc';g.beginPath();g.ellipse(B-1,yb(22,6),12,7,0,Math.PI,0);g.fill();R(g,B-10,yb(24,20),2,20,'#8b9aa6');R(g,B+8,yb(24,20),2,20,'#8b9aa6');break}
  case 'roverIn':{g.drawImage(PIX.sheets.rover,0,0,48,32,0,h-32,48,32);break}
 }return c}
PIX.init=function(){
 PIX.sheets={astro:{},rover:buildRover()};
 for(const c of ['#efbd69','#72d4e7','#91d7a3','#b8a0e5'])PIX.sheets.astro[c]=buildAstronaut(c);
 for(const tName of ['moon','moon2','crater','floor','wall','metal'])PIX.tiles[tName]=buildTile(tName);
 for(const p of ['bed','cryo','command_console','console','lab_bench','planter0','planter1','planter2','water','workbench','locker','airlock','rock1','rock2','rock3','ore','ice','deposit','beacon','o2tank','battery','dish','roverIn'])PIX.props[p]=buildProp(p);
}
