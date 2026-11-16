'use strict';
const fs=require('node:fs'),path=require('node:path');
try{
 const root=__dirname,web=JSON.parse(fs.readFileSync(path.join(root,'firebase-web-config.json'),'utf8')),account=JSON.parse(fs.readFileSync(path.join(root,'.firebase-service-account.json'),'utf8'));
 const url=new URL(web.databaseURL);
 if(url.protocol!=='https:'||!/(\.firebaseio\.com|\.firebasedatabase\.app)$/.test(url.hostname)||!web.apiKey||!web.appId||web.projectId!==account.project_id||account.type!=='service_account'||!account.private_key?.includes('PRIVATE KEY'))throw Error('Los archivos no pertenecen al mismo proyecto o falta databaseURL / appId / cuenta de servicio.');
 const entries={FIREBASE_WEB_CONFIG:JSON.stringify(web),FIREBASE_SERVICE_ACCOUNT_BASE64:Buffer.from(JSON.stringify(account)).toString('base64')};
 const file=path.join(root,'.env');let existing=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';existing=existing.split(/\r?\n/).filter(line=>!/^FIREBASE_(WEB_CONFIG|SERVICE_ACCOUNT_BASE64)=/.test(line)).join('\n');
 const lines=Object.entries(entries).map(([k,v])=>k+"='"+v.replace(/'/g,'\\u0027')+"'").join('\n')+'\n';fs.writeFileSync(file,existing+'\n'+lines);fs.writeFileSync(path.join(root,'.firebase-netlify.env'),lines);
 console.log('Firebase configurado en .env. Reinicia npm start. Para Netlify: npx netlify env:import .firebase-netlify.env y npm run deploy. Los archivos de credenciales no deben compartirse.');
}catch(e){console.error(e.code==='ENOENT'?'Faltan firebase-web-config.json y/o .firebase-service-account.json. Sigue MULTIPLAYER.md.':e instanceof SyntaxError?'Uno de los archivos no contiene JSON válido.':e.message);process.exitCode=1}
