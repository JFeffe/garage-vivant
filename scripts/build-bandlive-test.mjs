import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {rollup} from 'rollup';
import {createWorld} from '../dist/engine.mjs';
import {RELEASE_VERSION} from '../dist/release.mjs';
import {restore} from '../dist/engine.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong} from '../dist/bandlive.mjs';

const source=resolve('dist'),target=resolve(process.argv[2]||'BandLive-test/LANCER-BandLive.html');
const demo=createWorld(2040);
const prototype=process.argv.includes('--crowd');
let scenarios=null;
if(prototype){
  const {preparedConcert}=await import('../tests/bandlive-concert-helpers.mjs');
  const {world:classic}=preparedConcert({large:true,setlistLength:1});
  const {world:live}=preparedConcert({instruments:['guitar','drums','bass','voice','keys','trumpet'],large:true});
  for(const p of live.people){p.bandLiveDecks={[p.instrument]:['note','new1','new2','special','new1']};}
  const {game}=beginBandLiveConcert(live);chooseSong(game,game.songs[0].id);
  // An explicit demo head start makes the first shock easy to try.
  const source=game.fans.find(f=>f.effect==='shock');source.hp=1;game.initialFanHp=game.fans.map(f=>f.hp);
  restore(classic);restore(live);scenarios={classic,live};
}
const bundle=await rollup({input:resolve(source,'app.mjs'),plugins:[{name:'local-module-queries',resolveId(id,importer){if(id.startsWith('.'))return resolve(importer?dirname(importer):source,id.split('?')[0]);}}],onwarn(warning){if(warning.code!=='CIRCULAR_DEPENDENCY')console.warn(warning.message);}});
const {output}=await bundle.generate({format:'iife',inlineDynamicImports:true});await bundle.close();
let html=await readFile(resolve(source,'index.html'),'utf8');
const sheets=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
for(const match of sheets){const href=match[0].match(/href="([^"]+)"/)[1];const css=await readFile(resolve(source,href.split('?')[0]),'utf8');html=html.replace(match[0],()=>'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');}
html=html.replace(/<link\b[^>]*href="https:\/\/fonts[^>]*>/g,'').replace(/<title>.*?<\/title>/,`<title>BandLive · test ${RELEASE_VERSION}</title>`);
const docIndex=JSON.parse(await readFile(resolve(source,'doc-index.json'),'utf8'));
const prefix=prototype?'public-pack-private-':'bandlive-private-normal-';
const restart=prototype?`try{const reset=localStorage.getItem('${prefix}restart');if(reset){const scenarios=${JSON.stringify(scenarios)};localStorage.setItem('${prefix}v1',JSON.stringify(reset==='live'?scenarios.live:scenarios.classic));localStorage.setItem('${prefix}bandlive-v1',JSON.stringify({enabled:true,game:null}));localStorage.removeItem('${prefix}restart');}}catch{}\n`:'';
const bootstrap=restart+`try{const key=${JSON.stringify(prefix+'v1')};if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(${JSON.stringify(prototype?scenarios.classic:demo)}));const moduleKey=${JSON.stringify(prefix+'bandlive-v1')};if(!localStorage.getItem(moduleKey))localStorage.setItem(moduleKey,JSON.stringify({enabled:${prototype},game:null}));}catch{}\nconst offlineDocs=${JSON.stringify(docIndex)};const onlineFetch=window.fetch.bind(window);window.fetch=(input,...args)=>String(input).split('?')[0].endsWith('doc-index.json')?Promise.resolve(new Response(JSON.stringify(offlineDocs),{headers:{'Content-Type':'application/json'}})):onlineFetch(input,...args);\n`;
const code=output[0].code.replaceAll('garage-vivant-',prefix);
const footer=prototype?`\n;(()=>{
  const prefix=${JSON.stringify(prefix)};
  document.title='Public en pack · essai local · interface compacte';
  const menu=document.createElement('dialog');menu.id='crowd-test-menu';
  menu.innerHTML='<h2>Public en pack · essai local</h2><p>Choisis un mode pour commencer un nouveau scénario de test.</p><p>BandLive : zones de proximité, conquêtes et poussées. Un spectateur Onde de choc commence à 1 résistance pour tester rapidement.</p><p>Show classique : public mélangé, déplacements et collisions pendant la musique.</p><div><button data-crowd-mode="live">Tester BandLive</button><button data-crowd-mode="classic">Tester le show classique</button></div><p><small>Sauvegardes de test séparées. Aucun push Git. Les boutons recommencent uniquement ces scénarios de test.</small></p><button id="crowd-test-close">Reprendre mon essai</button>';
  menu.style.cssText='max-width:560px;border:1px solid #d2c68c;border-radius:18px;padding:28px;background:#233c43;color:#fff7dc;z-index:1000';document.body.append(menu);
  const open=document.createElement('button');open.id='crowd-test-open';open.textContent='Essai';open.title='Essai local · choisir / recommencer';open.style.cssText='font-size:10px;padding:4px 7px;background:#fff1c7;color:#294a3c';open.onclick=()=>menu.showModal();document.querySelector('header').append(open);
  menu.addEventListener('click',e=>{const mode=e.target.dataset.crowdMode;if(mode){localStorage.setItem(prefix+'restart',mode);localStorage.setItem(prefix+'mode',mode);location.reload();}else if(e.target.id==='crowd-test-close')menu.close();});
  const mode=localStorage.getItem(prefix+'mode');setTimeout(()=>{if(mode==='live')document.querySelector('#bandlive-nav')?.click();else if(mode==='classic')document.querySelector('[data-view="shows"]')?.click();else menu.showModal();},0);
})();` : '';
html=html.replace(/<script\b[^>]*type="module"[^>]*>\s*<\/script>/,()=>'<script>'+(bootstrap+code+footer).replace(/<\/script/gi,'<\\/script')+'</script>');
await mkdir(dirname(target),{recursive:true});await writeFile(target,html);
console.log(JSON.stringify({file:target,bytes:Buffer.byteLength(html),start:prototype?'choose BandLive or classic show':'normal neighbourhood',bandLive:prototype?'ready demo':'optional in settings'}));
