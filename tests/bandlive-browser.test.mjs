import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,createGroup,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong} from '../dist/bandlive.mjs';

const root=resolve('dist'),server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch(),errors=[];
await mkdir('test-results',{recursive:true});
const world=createWorld(205,8),group=createGroup(world,world.people.slice(0,4).map(p=>p.id),{manual:true,name:'Les Cubes du Canal'});
const largeGroup=createGroup(world,world.people.map(p=>p.id),{manual:true,name:'Les Huit Voisins'}),emptyGroup=createGroup(world,world.people.slice(4,6).map(p=>p.id),{manual:true,name:'Les Nouveaux'});
const template=restore(JSON.parse(await readFile('tests/v071-world.json','utf8'))).songs[0];
world.songs=Array.from({length:4},(_,i)=>({...structuredClone(template),id:i+1,projectId:null,title:['La mémoire du canal','Les rues de verre','Un écho dans la ville','La chanson des huit'][i],genre:['Punk','Pop','Jazz','Folk'][i],groupId:i<3?group.id:largeGroup.id,ownerGroupId:i<3?group.id:largeGroup.id,adoptedAt:world.time}));world.nextSongId=5;
for(const g of [group,largeGroup])g.repertoire=world.songs.filter(s=>s.ownerGroupId===g.id).map(s=>({songId:s.id,mastery:60,rehearsals:0,active:true}));
assert.deepEqual(restore(world),world);
const actors=world.people.slice(0,4).map((p,i)=>({...p,instrument:['guitar','drums','bass','sax'][i]}));
function fixture(audienceSize=3){
  const game=createBandLive({people:actors,groupName:group.name,songs:[{id:'punk',title:'Rébellion nocturne',style:'Punk'},{id:'pop',title:'Sous les néons',style:'Pop'}],seed:12,audienceSize});chooseSong(game,'punk');game.tempo=4;
  const hand=[game.cards[0].id,game.cards[3].id,game.cards[8].id,game.cards[13].id,game.cards[18].id];game.deck=game.cards.map(c=>c.id).filter(id=>!hand.includes(id));game.hand=hand;return game;
}
async function load(page,state=null,sourceWorld=world){
  page.on('pageerror',error=>errors.push(error.stack));await page.addInitScript(({world,state})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));if(state&&!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify(state));},{world:sourceWorld,state});await page.goto(url);await page.locator('#profile .profile-head').waitFor({state:'attached'});await page.locator('#speed').fill('0');
}
async function data(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);}
async function idle(page){await page.waitForFunction(()=>!document.querySelector('#bl-end')||!document.querySelector('#bl-end').disabled);}
async function drag(page,id,target,targetPosition){await page.locator(`[data-bl-card="${id}"]`).dragTo(page.locator(target),{sourcePosition:{x:8,y:42},targetPosition});await idle(page);}
let page;
try{
  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page);assert(await page.locator('#bandlive-nav').isHidden());
  await page.locator('[data-view="settings"]').click();await page.locator('#bandlive-enabled').check();assert(await page.locator('#bandlive-nav').isVisible());
  await page.locator('[data-view="groups"]').click();await page.locator(`#group-list [data-group-select="${group.id}"]`).click();await page.locator('#group-list [data-bandlive-open]').click();assert.equal(await page.locator('#bl-group').inputValue(),group.id);assert.equal(await page.locator('.bl-repertoire li').count(),3);
  assert((await page.locator('.bl-repertoire').textContent()).includes(template.authorNames.p1));assert.equal(await page.locator('[data-bl-member]').count(),4);await page.locator('#bl-start').click();assert.equal(await page.locator('.bl-song-choice button').count(),3);
  const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));await page.locator('[data-bl-song="song-3"]').click();assert.equal(await page.locator('.bl-card').count(),5);assert.equal((await data(page)).groupName,group.name);assert.equal((await data(page)).groupId,group.id);assert.equal((await data(page)).songs[2].title,world.songs[2].title);
  for(const card of await page.locator('[data-bl-card]').all())assert(await card.evaluate(el=>el.dataset.blCard.startsWith(el.closest('.bl-musician').querySelector('[data-bl-actor]').dataset.blActor+':')));
  const clock=await page.locator('#clock').textContent();await page.waitForTimeout(1100);assert.equal(await page.locator('#clock').textContent(),clock);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1'))),snapshot);
  await page.screenshot({path:'test-results/bandlive-connected.png'});
  const savedRehearsal=await data(page);await page.locator('[data-view="groups"]').click();await page.locator('#group-list [data-bandlive-open]').click();assert(await page.locator('#bl-start').isVisible());assert.equal(await page.locator('.bl-repertoire li').count(),3);assert.deepEqual(await data(page),savedRehearsal);await page.locator('#bl-resume').click();
  await page.locator('#bl-setup').click();await page.locator('#bl-group').selectOption(emptyGroup.id);assert(await page.locator('#bl-start').isDisabled());assert((await page.locator('.bl-setup-reason').textContent()).includes('composition'));assert.deepEqual(await data(page),savedRehearsal);await page.locator('#bl-resume').click();assert.deepEqual(await data(page),savedRehearsal);
  await page.locator('[data-view="settings"]').click();await page.locator('#bandlive-enabled').uncheck();assert(await page.locator('#bandlive-nav').isHidden());await page.locator('[data-view="shows"]').click();assert.equal(await page.locator('[data-bandlive-open]').count(),0);await page.locator('#preview-show').click();assert(await page.locator('#start-show').isVisible());await page.locator('#skip-show').click();assert(await page.locator('.show-result').isVisible());await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,{enabled:true,game:fixture()});await page.locator('#bandlive-nav').click();
  const before=await data(page),note=before.cards[0].id,bass=before.cards[13].id,sax=before.cards[18].id;
  await drag(page,note,'.bl-audience',{x:10,y:10});assert.deepEqual(await data(page),before,'A single-target card dropped on empty crowd space is not spent');
  await drag(page,bass,'.bl-audience',{x:10,y:10});let after=await data(page);assert.equal(after.energy,3);assert.equal(after.tempo,5);assert.equal(after.boost,3);assert.equal(after.hand.length,4);
  await drag(page,note,'[data-bl-fan="f0"]');after=await data(page);assert.equal(after.energy,2);assert.equal(after.boost,0);assert.equal(after.fans[0].hp,13);assert.equal(after.tempo,5);
  await drag(page,sax,'.bl-audience',{x:10,y:10});after=await data(page);assert.deepEqual(after.fans.map(f=>f.hp),[6,15,20]);assert.equal(after.energy,1);assert.equal(after.tempo,0);assert.equal(after.hand.length,2);
  await page.locator('[data-bl-actor]').first().hover();assert((await page.locator('#bandlive-tooltip').textContent()).includes('Maîtrise'));await page.locator('[data-bl-actor]').first().click();assert.equal(await page.locator('#dialog').evaluate(el=>el.open),false);
  await page.locator('[data-bl-fan="f0"]').hover();assert((await page.locator('#bandlive-tooltip').textContent()).includes('Résistance'));await page.locator('[data-bl-fan="f0"]').click();assert.equal(await page.locator('#dialog').evaluate(el=>el.open),false);
  await page.locator('[data-bl-fan="f0"] [data-bl-style]').hover();assert.equal((await page.locator('#bandlive-tooltip').textContent()).trim(),'Punk');
  await page.reload();await page.locator('#bandlive-nav').click();assert.deepEqual(await data(page),after,'Reload resumes the same turn and hand');
  await page.screenshot({path:'test-results/bandlive-desktop.png'});
  await page.locator(`[data-bl-card="${before.cards[8].id}"]`).focus();await page.keyboard.press('Enter');await page.locator('.bl-audience').focus();await page.keyboard.press('Enter');await idle(page);assert.equal((await data(page)).energy,0,'Keyboard selection plays a preparation');assert.equal((await data(page)).tempo,4);
  await page.locator('#bl-end').click();const next=await data(page);assert.equal(next.turn,2);assert.equal(next.energy,3);assert.equal(next.hand.length,5);assert.equal(next.boost,0);
  await page.close();

  page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await load(page,{enabled:true,game:fixture(6)});await page.locator('#bandlive-nav').click();
  assert.equal(await page.locator('[data-bl-fan]').count(),6);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const viewport=page.locator('.bl-viewport');await viewport.evaluate(el=>el.scrollTop=110);await page.locator('#main').evaluate(el=>el.scrollTop=80);
  const card=page.locator(`[data-bl-card="${fixture().cards[0].id}"]`),fan=page.locator('[data-bl-fan="f0"]');
  const source=await card.boundingBox(),target=await fan.boundingBox(),start={x:source.x+8,y:source.y+42},finish={x:target.x+target.width/2,y:target.y+target.height/2};
  assert(start.x>=0&&finish.x<390&&start.y>0&&finish.y<844,'Touch drag has visible start and end targets');
  const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
  for(let step=1;step<=8;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(finish.x-start.x)*step/8,y:start.y+(finish.y-start.y)*step/8}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await idle(page);assert.equal((await data(page)).played,1,'Actual touch events play the card');assert.equal((await data(page)).energy,2);assert.equal(await page.locator('.bl-ghost').count(),0);assert(await viewport.evaluate(el=>el.scrollTop>0),'Playing preserves the scrolled touch arena');
  await page.locator('[data-bl-fan="f5"]').scrollIntoViewIfNeeded();assert(await page.locator('[data-bl-fan="f5"]').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'test-results/bandlive-touch.png'});await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,{enabled:true});await page.locator('#bandlive-nav').click();await page.locator('#bl-group').selectOption(largeGroup.id);
  assert.equal(await page.locator('#bl-audience-size').inputValue(),'3');await page.locator('#bl-audience-size').fill('13');await page.locator('#bl-audience-size').press('Tab');assert.equal(await page.locator('#bl-audience-size').inputValue(),'3');
  await page.locator('#bl-audience-size').fill('12');await page.locator('#bl-audience-size').press('Tab');
  await page.reload();await page.locator('#bandlive-nav').click();assert.equal(await page.locator('#bl-audience-size').inputValue(),'12','The chosen crowd size survives a reload before starting');
  assert.equal(await page.locator('[data-bl-member]:checked').count(),6);assert.equal(await page.locator('[data-bl-member]:disabled').count(),2);assert.equal(await page.locator('.bl-repertoire li').count(),1);
  await page.locator(`[data-bl-member="${largeGroup.members[0]}"]`).uncheck();await page.locator(`[data-bl-member="${largeGroup.members[6]}"]`).check();assert.equal(await page.locator('[data-bl-member]:checked').count(),6);
  await page.locator(`[data-bl-member="${largeGroup.members[7]}"]`).evaluate(el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal(await page.locator('[data-bl-member]:checked').count(),6,'The change handler also refuses a seventh member');
  const largeSnapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));await page.locator('#bl-start').click();assert.equal(await page.locator('.bl-song-choice button').count(),1);await page.locator('[data-bl-song]').click();
  assert.equal((await data(page)).actors.length,6);assert.equal((await data(page)).cards.length,30);assert.equal((await data(page)).groupId,largeGroup.id);assert.equal(await page.locator('[data-bl-fan]').count(),12);assert((await page.locator('.bl-resources').textContent()).includes('0/12'));
  await page.screenshot({path:'test-results/bandlive-six-members.png'});await page.locator('[data-bl-fan="f11"]').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/bandlive-twelve-spectators.png'});
  for(let i=0;i<3;i++)await page.locator('#bl-end').click();await page.locator('[data-bl-song="song-4"]').click();assert.equal((await data(page)).turn,4);assert.deepEqual((await data(page)).usedSongs,['song-4','song-4']);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1'))),largeSnapshot);
  await page.reload();await page.locator('#bandlive-nav').click();assert.equal((await data(page)).turn,4);assert.equal(await page.locator('[data-bl-fan]').count(),12);
  for(let i=0;i<3;i++)await page.locator('#bl-end').click();assert.equal((await data(page)).phase,'lost');assert(await page.locator('#bl-return').isVisible());assert.equal(await page.locator('#bl-end').count(),0);
  const finishedShow=await data(page),returnClock=await page.locator('#clock').textContent(),returnWorld=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));
  await page.locator('#bl-return').click();assert(await page.locator('#map-view').isVisible());assert(await page.locator('#bandlive-view').isHidden());assert.equal(await page.locator('#speed').inputValue(),'1');assert.deepEqual(await data(page),finishedShow);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1'))),returnWorld);await page.waitForFunction(previous=>document.querySelector('#clock').textContent!==previous,returnClock,{timeout:5000});
  await page.locator('#bandlive-nav').click();assert.deepEqual(await data(page),finishedShow);await page.locator('#bl-replay').click();assert.equal((await data(page)).phase,'choose');assert.equal((await data(page)).fans.length,12);assert.equal((await data(page)).groupId,largeGroup.id);await page.close();

  const nearVictory=fixture(9);for(const fan of nearVictory.fans)fan.hp=1;
  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,{enabled:true,game:nearVictory});await page.locator('#speed').fill('0.7');await page.locator('#bandlive-nav').click();
  const victoryWorld=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1'))),victoryClock=await page.locator('#clock').textContent();assert.equal(await page.locator('#bl-return').count(),0);
  await page.locator(`[data-bl-card="${nearVictory.cards[18].id}"]`).click({position:{x:8,y:42}});await page.locator('.bl-audience').click({position:{x:10,y:10}});assert.equal((await data(page)).phase,'won');assert.equal(await page.locator('.bl-conquered').count(),9);assert((await page.locator('.bl-resources').textContent()).includes('9/9'));
  await page.locator('#bl-return').click();assert(await page.locator('#map-view').isVisible());assert.equal(await page.locator('#speed').inputValue(),'0.7','Returning after victory resumes the previous nonzero speed');assert.equal((await data(page)).phase,'won');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1'))),victoryWorld);
  await page.waitForFunction(previous=>document.querySelector('#clock').textContent!==previous,victoryClock,{timeout:5000});assert.equal(await page.locator('#dialog').evaluate(el=>el.open),false);await page.screenshot({path:'test-results/bandlive-return-to-neighbourhood.png'});await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,{enabled:true},createWorld(205,8));await page.locator('#bandlive-nav').click();assert(await page.locator('#bl-start').isDisabled());assert.equal(await page.locator('[data-bl-member]').count(),0);await page.locator('#bandlive-view [data-open-groups]').click();assert(await page.locator('#groups-view').isVisible());await page.close();
  const legacy=JSON.parse(await readFile('tests/bandlive-v1.json','utf8'));page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,{enabled:true,game:legacy});await page.locator('#bandlive-nav').click();assert.equal(await page.locator('[data-bl-actor]').count(),8);assert.deepEqual(await data(page),legacy);await page.locator('#bl-end').click();assert.equal((await data(page)).turn,2);await page.close();
  assert.deepEqual(errors,[]);console.log('BandLive navigateur : groupes et compositions réels, six musiciens maximum, public de 3 à 12, sauvegarde et replay du public, retour au quartier après victoire et dernier tour, reprise de la simulation, anciens shows, drag/drop souris et tactile, infobulles et désactivation vérifiés.');
}finally{await page?.close().catch(()=>{});await browser.close();await new Promise(resolve=>server.close(resolve));}
