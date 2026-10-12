import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {rollup} from 'rollup';
import {createWorld,step,restore} from '../dist/engine.mjs';
import {eligibleSongs,command,advanceToBooking,skipShow,nextSlot} from '../dist/life.mjs';
import {pendingBooking} from '../dist/calendar.mjs';
import {beginBandLiveConcert,resolveBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {RELEASE_VERSION} from '../dist/release.mjs';

// Only the generated example world is prepared. Existing saves of the test HTML
// and any imported neighbourhood are never replaced by this bootstrap.
function exampleConcert(){
  const world=createWorld(2040),limit=world.time+1440*90;
  for(let guard=0;world.time<limit&&guard<3000;guard++){
    if(world.showEventId||world.performance?.status==='playing')skipShow(world,true);
    const groups=world.groups.filter(g=>g.archivedAt===null&&g.members.length>=2&&eligibleSongs(world,g).length>=2);
    for(const group of groups){
      const pending=pendingBooking(world,group.id);
      if(pending)command(world,{type:'cancelBooking',actorId:pending.members[0],bookingId:pending.id});
      const songs=eligibleSongs(world,group).slice(0,2).map(s=>s.id),members=group.members.slice(0,6);
      const dates=world.season.opportunities.filter(o=>!o.final&&o.time>world.time+60).sort((a,b)=>Number(a.venue!=='g1')-Number(b.venue!=='g1')||a.time-b.time);
      for(const date of dates){
        const slot=date.slots.find(s=>!s.bookingId&&songs.length*4<=s.duration);if(!slot)continue;
        const reserved=command(world,{type:'book',actorId:members[0],groupId:group.id,opportunityId:date.id,slotId:slot.id,setlist:songs,members,intention:'tight'});if(!reserved.ok)continue;
        advanceToBooking(world,reserved.bookingId);
        for(let turn=0;turn<8;turn++){
          if(world.performance?.groupId===group.id&&resolveBandLiveConcert(world).ready){beginBandLiveConcert(world);restore(world);return world;}
          if(world.performance?.status==='playing'){skipShow(world);if(nextSlot(world))continue;}
          const b=world.bookings.find(b=>b.id===reserved.bookingId);if(!b||!['booked','assembling'].includes(b.status))break;
          advanceToBooking(world,b.id);
        }
        if(world.showEventId||world.performance?.status==='playing')skipShow(world,true);
      }
    }
    step(world,60);
  }
  throw Error('No naturally formed band with a real reserved show was found.');
}

const source=resolve('dist'),target=resolve(process.argv[2]||'BandLive-test/LANCER-BandLive.html');
const demo=exampleConcert();
const bundle=await rollup({input:resolve(source,'app.mjs'),plugins:[{name:'local-module-queries',resolveId(id,importer){if(id.startsWith('.'))return resolve(importer?dirname(importer):source,id.split('?')[0]);}}],onwarn(warning){if(warning.code!=='CIRCULAR_DEPENDENCY')console.warn(warning.message);}});
const {output}=await bundle.generate({format:'iife',inlineDynamicImports:true});await bundle.close();
let html=await readFile(resolve(source,'index.html'),'utf8');
const sheets=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
for(const match of sheets){const href=match[0].match(/href="([^"]+)"/)[1];const css=await readFile(resolve(source,href.split('?')[0]),'utf8');html=html.replace(match[0],()=>'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');}
html=html.replace(/<link\b[^>]*href="https:\/\/fonts[^>]*>/g,'').replace(/<title>.*?<\/title>/,`<title>BandLive · test ${RELEASE_VERSION}</title>`);
const help=`<aside id="bandlive-test-help"><strong>BandLive · decks par instrument · build local de test</strong><p>Au premier lancement, un groupe et ses chansons créés dans le jeu ont une vraie réservation prête à jouer. Choisis une chanson parmi le répertoire actif du groupe, puis glisse tes cartes sur le public. Les barres se remplissent jusqu’à la conquête. Termine le spectacle, gagné ou perdu, pour choisir un musicien et échanger une carte de son deck contre l’une des trois spéciales de son instrument.</p><p>Après le show, <b>Retour au quartier · continuer</b> reprend la partie. Pour une nouvelle prestation : <b>Shows → réserver une ou deux compositions avec deux à six musiciens → Avancer jusqu’au show → Jouer avec BandLive</b>. Les répétitions restent disponibles dans l’onglet BandLive.</p><p>Pour tes propres groupes, exporte ton monde du jeu puis importe sa copie ici dans <b>Réglages → Importer JSON</b>. Ce build garde une sauvegarde de test séparée. Les decks modifiés suivent chaque musicien et chaque instrument. Consulte-les dans sa fiche, sous DECKS BANDLIVE ; change son instrument dans IDENTITÉ & TRAITS. Revenir à un instrument restitue son deck. Les répétitions utilisent les cartes acquises, sans accorder d’échange.</p><button type="button">Masquer cette aide</button></aside>`;
html=html.replace('<section id="map-view"',help+'<section id="map-view"');
html=html.replace('</head>','<style>#bandlive-test-help{margin:12px 0 18px;padding:16px 18px;border:1px solid #b4c6a1;border-radius:8px;background:#f4edda;color:#213d33;font-size:12px;line-height:1.6}#bandlive-test-help p{margin:8px 0}#bandlive-test-help button{font-size:11px}</style></head>');
const docIndex=JSON.parse(await readFile(resolve(source,'doc-index.json'),'utf8'));
const prefix='bandlive-decks-test-';
const bootstrap=`try{const key=${JSON.stringify(prefix+'v1')};if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(${JSON.stringify(demo)}));const moduleKey=${JSON.stringify(prefix+'bandlive-v1')};if(!localStorage.getItem(moduleKey))localStorage.setItem(moduleKey,JSON.stringify({enabled:true,game:null}));}catch{}\nconst offlineDocs=${JSON.stringify(docIndex)};const onlineFetch=window.fetch.bind(window);window.fetch=(input,...args)=>String(input).split('?')[0].endsWith('doc-index.json')?Promise.resolve(new Response(JSON.stringify(offlineDocs),{headers:{'Content-Type':'application/json'}})):onlineFetch(input,...args);\n`;
const code=output[0].code.replaceAll('garage-vivant-',prefix);
const footer=`\nif(!document.querySelector('#bandlive-nav').hidden&&document.querySelector('#bandlive-view').hidden&&document.querySelector('#performance-wrap').hidden)document.querySelector('#bandlive-nav').click();\ndocument.querySelector('#bandlive-test-help button').onclick=()=>document.querySelector('#bandlive-test-help').remove();document.addEventListener('click',event=>{if(event.target.closest('[data-bl-song],#bl-start,[data-bandlive-concert]'))document.querySelector('#bandlive-test-help')?.remove();});`;
html=html.replace(/<script\b[^>]*type="module"[^>]*>\s*<\/script>/,()=>'<script>'+(bootstrap+code+footer).replace(/<\/script/gi,'<\\/script')+'</script>');
await mkdir(dirname(target),{recursive:true});await writeFile(target,html);
console.log(JSON.stringify({file:target,bytes:Buffer.byteLength(html),group:demo.performance.groupName,songs:demo.performance.bandLive.game.songs.map(s=>s.title),scene:demo.performance.opportunityName,public:demo.performance.bandLive.game.fans.length}));
