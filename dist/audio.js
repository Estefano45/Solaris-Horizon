'use strict';
// Persisted settings + music player + WebAudio sound effects.
const SETTINGS_KEY='aurora-settings';
const settings=Object.assign({name:'',lang:null,track:1,vol:.6,mute:false,zoom:2.2},(()=>{try{return JSON.parse(localStorage.getItem(SETTINGS_KEY))||{}}catch{return{}}})());
if(settings.visualEdition!==3){settings.zoom=2.4;settings.visualEdition=3;localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch{}}
let audioCtx=null,musicEl=null,currentTrack=0;
function unlockAudio(){if(!audioCtx){try{audioCtx=new (window.AudioContext||window.webkitAudioContext)()}catch{}}if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume().catch(()=>{})}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlockAudio,{passive:true}));
function tone(freq,dur,type='square',vol=.07,slide=0,delay=0){if(settings.mute||!audioCtx)return;try{const t=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur+.05)}catch{}}
function sfx(name){unlockAudio();if(settings.mute)return;switch(name){
 case 'click':tone(540,.06,'square',.045);break;
 case 'interact':tone(290,.13,'triangle',.07,150);break;
 case 'warning':tone(240,.28,'sawtooth',.07,-110);tone(180,.3,'sawtooth',.06,-80,.18);break;
 case 'success':[392,523,659,784].forEach((f,i)=>tone(f,.13,'square',.05,0,i*.09));break;
 case 'sample':tone(620,.09,'sine',.09,180);tone(880,.12,'sine',.07,120,.1);break;
 case 'storm':tone(70,.9,'sawtooth',.1,-30);tone(110,.6,'square',.05,40,.15);break;
 case 'step':tone(140,.04,'triangle',.02);break;
 case 'rover':tone(120,.2,'sawtooth',.05,60);break;
}}
const music={
 start(n){n=Number(n??settings.track);if(!n||n<1||n>4){this.stop();return}
  if(musicEl&&currentTrack===n){musicEl.play().catch(()=>{});return}
  this.stop();try{musicEl=new Audio('assets/music/track'+n+'.mpeg');musicEl.loop=true;musicEl.volume=settings.mute?0:settings.vol;currentTrack=n;musicEl.play().catch(()=>{})}catch{currentTrack=0}},
 stop(){if(musicEl){try{musicEl.pause()}catch{}musicEl=null}currentTrack=0},
 setVol(){if(musicEl)musicEl.volume=settings.mute?0:settings.vol}};
