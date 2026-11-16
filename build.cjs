const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=__dirname,dist=path.join(root,'dist');
for(const file of ['game.js','engine.js','minigames.js','operations.js','multiplayer.js','nasa-ui.js','sources.js','nasa-snapshot.js','i18n.js','audio.js','pixel.js','cozy.js','cozy-ui.js','crew-experience.js','cozy-textures.js','pixel-astronaut.js','realtime-core.js','sim.js','world.js','ui.js'])execFileSync(process.execPath,['--check',path.join(dist,file)],{stdio:'inherit'});
for(const file of ['netlify/functions/nasa.mjs','science-service.cjs','multiplayer-core.cjs','multiplayer-service.cjs','netlify/functions/multiplayer.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'inherit'});
function scan(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.name.startsWith('.env')||item.name==='node_modules')throw Error('Archivo privado en la carpeta pública: '+item.name);if(item.isDirectory())scan(file)}}
require('esbuild').buildSync({entryPoints:[path.join(root,'firebase-client-src.js')],outfile:path.join(dist,'firebase-client.js'),bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022'});
fs.writeFileSync(path.join(dist,'cozy-textures.js'),require('esbuild').transformSync(fs.readFileSync(path.join(root,'art-source/PixelArtGenerator.ts'),'utf8'),{loader:'ts',format:'iife',globalName:'CozyTextures'}).code);
fs.writeFileSync(path.join(dist,'cozy-characters.js'),require('esbuild').transformSync(fs.readFileSync(path.join(root,'art-source/CharacterArt.ts'),'utf8'),{loader:'ts',format:'iife',globalName:'CozyCharacters'}).code);
scan(dist);
if(!fs.existsSync(path.join(dist,'index.html')))throw Error('Falta index.html');
console.log('Juego verificado. Publicar dist + Netlify Functions. Ningún .env se publica.');
