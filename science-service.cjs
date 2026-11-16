'use strict';
// Fixed, public NASA endpoints. No key, arbitrary URL proxy or downloaded bulk archive.
const DIVINER='https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/global_cumul_avg_cyl_00n10n_002.tab';
const OSDR='https://visualization.osdr.nasa.gov/biodata/api/v2/';
const ASSAYS=OSDR+'query/assays/?id.accession=OSD-267&study.parameter%20value&study.factor%20value&study.characteristics.organism';
const sites=[{id:'aurora',lon:23.47,lat:.674},{id:'este',lon:30,lat:5}];
function parseDiviner(text,site){
  const lon=Math.floor((site.lon+180)*2)/2-179.75,lat=Math.floor(site.lat*2)/2+.25;
  const rows=text.trim().split(/\r?\n/).map(line=>line.split(',').map(Number));
  if(rows.length!==96||rows.some((r,i)=>r.length!==11||r.some(v=>!Number.isFinite(v))||r[0]!==lon||r[1]!==lat||Math.abs(r[2]-(i+.5)/4)>.011))throw Error('Invalid Diviner cell');
  const curve=rows.filter(r=>r[10]>0&&r[10]<500).map(r=>({hour:r[2],kelvin:r[10]}));
  if(curve.length<24)throw Error('Insufficient thermal observations');
  return {siteId:site.id,lon,lat,curve,minK:Math.min(...curve.map(r=>r.kelvin)),maxK:Math.max(...curve.map(r=>r.kelvin))};
}
async function divinerCell(site){
  // PDS label: 113-byte fixed records, header + longitude/latitude/local-time ordering.
  const row=Math.floor((site.lon+180)*2)*20*96+Math.floor(site.lat*2)*96,start=(row+1)*113,end=start+96*113-1;
  const response=await fetch(DIVINER,{headers:{Range:`bytes=${start}-${end}`},signal:AbortSignal.timeout(12000)});
  if(response.status!==206||!response.headers.get('content-range')?.startsWith(`bytes ${start}-${end}/`)){await response.body?.cancel();throw Error('PDS range unavailable');}
  const text=await response.text();if(Buffer.byteLength(text)!==96*113)throw Error('Truncated PDS cell');
  return {...parseDiviner(text,site),byteRange:`${start}-${end}`,httpStatus:206};
}
function csvRows(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw Error('Invalid CSV');if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows;
}
function parseStudy(dataset,csv){
  const m=dataset?.['OSD-267']?.metadata;if(m?.accession!=='OSD-267'||!m['study title'])throw Error('Invalid OSDR study');
  const [headers,...rows]=csvRows(csv),objects=rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
  const sample=objects.find(r=>r['id.accession']==='OSD-267'&&r['study.factor value.spaceflight']==='Space Flight');if(!sample)throw Error('No flight sample');
  const field=k=>sample['study.parameter value.'+k],number=k=>Number.parseFloat(field(k));
  const cycle=/^(\d+):(\d+) light:dark \{hour\}$/.exec(field('light cycle')||'');
  const temperatureC=number('mean growth temperature'),lightIntensity=number('light intensity'),harvestDays=number('age at sample harvest');
  if(!cycle||+cycle[1]+ +cycle[2]!==24||!Number.isFinite(temperatureC)||temperatureC<5||temperatureC>40||!(lightIntensity>0&&lightIntensity<2000)||!(harvestDays>0&&harvestDays<365)||!field('mean growth temperature').includes('degree Celsius')||!field('light intensity').includes('micromole per square meter per second'))throw Error('Unrecognized cultivation units');
  return {id:'OSD-267',title:m['study title'],project:m['project identifier'],platform:m['flight program'],temperatureC,lightHours:+cycle[1],darkHours:+cycle[2],lightIntensity,harvestDays,hardware:field('hardware'),sample,sourceURL:OSDR+'dataset/OSD-267/',assaysURL:ASSAYS,studyURL:'https://osdr.nasa.gov/bio/repo/data/studies/OSD-267',httpStatus:200};
}
async function osdr(){
  const responses=await Promise.all([OSDR+'dataset/OSD-267/',ASSAYS].map(url=>fetch(url,{signal:AbortSignal.timeout(12000)})));
  if(responses.some(r=>!r.ok))throw Error('OSDR unavailable');
  return parseStudy(await responses[0].json(),await responses[1].text());
}
let pending;
async function getScience(){
  if(pending)return pending;
  pending=(async()=>{const results=await Promise.allSettled([Promise.all(sites.map(divinerCell)),osdr()]);const status=(r,service)=>r.status==='fulfilled'?{status:'online',...r.value}:{status:'unavailable',error:service+' no respondió con datos válidos. Sin sustitución local.'};
    return {version:1,queriedAt:new Date().toISOString(),diviner:results[0].status==='fulfilled'?{status:'online',cells:results[0].value,sourceURL:DIVINER,labelURL:DIVINER.replace('.tab','.lbl'),dataset:'LRO-L-DLRE-5-GCP-V1.0',observations:'2009-07-05 / 2015-04-01',resolution:'0.5°; averages in 0.25-hour local solar time bins'}:status(results[0],'Diviner'),osdr:status(results[1],'OSDR')};
  })().finally(()=>{pending=null});return pending;
}
module.exports={getScience,parseDiviner,parseStudy,csvRows,DIVINER,ASSAYS};
