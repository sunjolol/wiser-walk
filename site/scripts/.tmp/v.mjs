import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = 'C:/Users/Light/Desktop/claude/theology compass/site';
const OUT = resolve(ROOT, 'node_modules/.critic.mjs');
await build({ entryPoints:[resolve(ROOT,'src/lib/engine/registry.ts')], outfile:OUT, bundle:true, format:'esm', platform:'node', target:'node18', logLevel:'silent' });
const e = await import(pathToFileURL(OUT).href);
const { QUIZZES, getQuiz, resultFor, encodeFor, decodeFor, shareTextFor } = e;
const C = getQuiz('theology-compass'), S = getQuiz('seven-deadly-sins');

// reachable values
const reach = r => { const st=r-1; return [...Array(r).keys()].map(k=>Math.round(k*100/st)); };
console.log('reach13', reach(13).join(','));
console.log('reach9 ', reach(9).join(','));
console.log('reach25', reach(25).join(','));
console.log('reach21', reach(21).join(','));

const bip = await import(pathToFileURL(resolve(ROOT,'node_modules/.critic2.mjs')).href).catch(()=>null);
console.log('---- compass codes claimed by spec');
const cases = [
 [[50,50,50,50,50,50],'01FQ70'],[[58,58,58,58,58,58],'01OCK6'],[[42,42,42,42,42,42],'0173TU'],
 [[42,58,42,58,42,58],'018C60'],[[0,0,0,0,0,0],'000000'],[[100,100,100,100,100,100],'02VGE0'],
 [[0,100,0,100,0,100],'007E10'],[[8,8,92,8,92,67],'0093F9'],[[42,8,33,25,67,8],'014LQY'],
 [[75,8,17,8,8,8],'020BZR'],[[50,50,50,50,50,0],'01FQ6U'],[[8,50,50,50,50,50],'00BXQJ'],
 [[50,50,50,50,50,67],'01FQ72']
];
for (const [v,code] of cases){
  const got = encodeFor(C,v);
  const r = resultFor(C,v);
  console.log((got===code?'OK ':'XX ')+got+' (claim '+code+')  vals='+v.join(',')+
   '\n     headline: '+r.headline+'\n     summary : '+r.summary+
   '\n     top3    : '+r.ranked.slice(0,3).map(x=>x.name+' '+x.score+'%').join(' | '));
}
