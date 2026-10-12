import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,createGroup,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong,powerAgainst} from '../dist/bandlive.mjs';
import {command} from '../dist/life.mjs';
const root=resolve('dist'),server=createServer(async(req,res)=>{
 try{const p=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));assert(p.startsWith(root+sep));res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css'})[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));await mkdir('test-results',{recursive:true});
const browser=await chromium.launch(),url=`http://127.0.0.1:${server.address().port}/`,errors=[];
try{
 let page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('#profile .profile-head').waitFor();assert.equal(await page.locator('#people [data-person]').count(),3);assert.equal(await page.locator('.person-instrument').count(),3);await page.close();
 const world=createWorld(205,3),group=createGroup(world,world.people.map(p=>p.id),{manual:true,name:'Les Effets Sauvages'});
 const template=restore(JSON.parse(await readFile('tests/v071-world.json','utf8'))).songs[0];
 world.songs=[{...template,id:1,projectId:null,authors:[world.people[0].id],ownerGroupId:group.id,groupId:group.id,adoptedAt:world.time,turns:5}];world.nextSongId=2;group.repertoire=[{songId:1,mastery:0,rehearsals:0,active:true}];
 assert(command(world,{type:'rehearse',groupId:group.id,actorId:group.members[0],songId:1}).ok);
 const people=world.people.map((p,i)=>({...p,instrument:['guitar','bass','voice'][i]}));
 const fixture=()=>{const game=createBandLive({people,groupId:group.id,groupName:group.name,songs:[{id:'s',title:'Le grand soir',style:'Indie',turns:5}],audienceSize:8,seed:12});chooseSong(game,'s');const ids=[game.cards[3].id,game.cards[8].id,game.cards[13].id];game.hand=ids;game.deck=game.cards.map(c=>c.id).filter(id=>!ids.includes(id));game.tempo=4;game.boost=3;return game;};
 for(const touch of [false,true]){
  const game=fixture();page=await browser.newPage({viewport:touch?{width:390,height:844}:{width:1440,height:1000},hasTouch:touch,isMobile:touch});page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({world,game})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));if(!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game}));},{world,game});
  await page.goto(url);await page.locator('#speed').fill('0');
  assert((await page.locator('#rapin-pool').textContent()).includes('Avant le prochain jeton'));
  await page.locator('#bandlive-nav').click();assert((await page.locator('.bl-hud h2').textContent()).includes(group.genre));assert((await page.locator('.bl-resources').textContent()).includes('1/10'));
  const card=game.cards[3],fan=game.fans[0],power=powerAgainst(game,card,fan);
  if(touch){await page.locator(`[data-bl-card="${card.id}"]`).click();await page.locator('[data-bl-fan="f0"]').focus();}
  else{const source=await page.locator(`[data-bl-card="${card.id}"]`).boundingBox(),target=await page.locator('[data-bl-fan="f0"]').boundingBox();await page.mouse.move(source.x+30,source.y+40);await page.mouse.down();await page.mouse.move(source.x+30,source.y+55,{steps:4});await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});}
  assert.equal(await page.locator('[data-bl-preview="f0"]').textContent(),`−${power} → ${Math.max(0,fan.hp-power)}/${fan.max}`);
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);assert.equal(before.played,0);
  await page.screenshot({path:`test-results/update-preview-${touch?'touch':'desktop'}.png`});
  if(touch)await page.locator('[data-bl-fan="f0"]').click();else await page.mouse.up();await page.waitForFunction(()=>!document.querySelector('#bl-end').disabled);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);assert.equal(after.fans[0].hp,Math.max(0,fan.hp-power));assert.equal(after.tempo,0);assert.equal(after.boost,0);
  await page.locator('.bl-piles summary').click();assert((await page.locator('.bl-piles').textContent()).includes('Solo'));assert((await page.locator('.bl-piles').textContent()).includes('sans ordre de tirage'));
  await page.locator('.bl-hud [data-group-select]').click();assert(await page.locator('#groups-view').isVisible());assert((await page.locator('.band-detail h2').textContent()).includes(group.name));await page.locator('.band-detail [data-song-details="song:1"]').click();await page.locator('[data-recompose="1"]').click();assert.equal(await page.locator('#dialog').evaluate(el=>el.open),false);assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).projects.some(p=>p.recompositionOf===1)));await page.close();
 }
 const game=fixture();game.fans.forEach(f=>f.hp=1);
 page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(({world,game})=>{localStorage.setItem('garage-vivant-v1',JSON.stringify(world));localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game}));},{world,game});await page.goto(url);await page.locator('#bandlive-nav').click();await page.locator(`[data-bl-card="${game.cards[13].id}"]`).click();await page.locator('.bl-audience').click({position:{x:8,y:8}});await page.waitForTimeout(1000);
 for(const kind of ['explosion','trance','emotion'])assert(await page.locator('.bl-reaction-'+kind).count()>0);
 assert.equal(await page.locator('.bl-reaction-trance .bl-cube').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.screenshot({path:'test-results/update-cosmetic-reactions.png'});await page.close();assert.deepEqual(errors,[]);
 console.log('Update navigateur : départ à trois, instruments, file, durée, preview exact, consultation des piles, liens de groupe et réactions cosmétiques vérifiés sur ordinateur et tactile.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
