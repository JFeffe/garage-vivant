import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {restore,createWorld} from '../dist/engine.mjs';
import {createBandLive,chooseSong,endTurn} from '../dist/bandlive.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';

const root=resolve('dist'),server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch(),errors=[];
await mkdir('test-results',{recursive:true});
const worldData=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));
const rehearsalData=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);
const liveData=async page=>(await worldData(page)).performance.bandLive.game;
async function load(page,world,{enabled=true,rehearsal=null}={}){
  page.on('pageerror',e=>errors.push(e.stack));
  await page.addInitScript(({world,state})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));if(!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify(state));},{world,state:{enabled,game:rehearsal}});
  await page.goto(url);await page.locator('#profile .profile-head').waitFor({state:'attached'});if(await page.locator('#speed').isVisible())await page.locator('#speed').fill('0');
}
async function start(page){await page.locator('[data-view="shows"]').click();await page.locator('[data-bandlive-concert]').click();await page.locator('[data-bl-song]').click();}
async function finish(page){
  for(let i=0;i<10;i++){const game=await liveData(page);if(['won','lost'].includes(game.phase))return;if(game.phase==='choose')await page.locator('[data-bl-song]').click();else await page.locator('#bl-end').click();}
  throw Error('Interactive concert did not finish within six turns.');
}
async function idle(page){await page.waitForFunction(()=>!document.querySelector('#bl-end')||!document.querySelector('#bl-end').disabled);}
let page;
try{
  const source=preparedConcert().world,rehearsal=createBandLive({people:source.people.slice(0,3),songs:[{id:'demo',title:'Répétition conservée',style:'Punk'}],seed:32});
  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,source,{rehearsal});await start(page);
  assert(await page.locator('#bandlive-view').isVisible());assert.equal(await page.locator('[data-bl-fan]').count(),8);assert.deepEqual(await rehearsalData(page),rehearsal);
  assert.equal(await page.locator('#bl-setup').count(),0,'An active booking cannot change formation');assert.equal(await page.locator('#bl-replay').count(),0);
  const before=await liveData(page),note=before.hand.find(id=>before.cards.find(c=>c.id===id).kind==='note');assert(note);
  await page.locator(`[data-bl-card="${note}"]`).dragTo(page.locator('[data-bl-fan="f0"]'),{sourcePosition:{x:8,y:42}});await idle(page);const played=await liveData(page);assert.equal(played.played,1);assert(played.fans[0].hp<before.fans[0].hp);assert.equal((await worldData(page)).showHistory.length,0);
  await page.locator('[data-bl-fan="f0"]').hover();assert((await page.locator('#bandlive-tooltip').textContent()).includes('Résistance'));await page.locator('[data-bl-fan="f0"]').click();assert.equal(await page.locator('#dialog').evaluate(el=>el.open),false);
  const clock=await page.locator('#clock').textContent();await page.waitForTimeout(1000);assert.equal(await page.locator('#clock').textContent(),clock);
  await page.reload();assert(await page.locator('#bandlive-view').isVisible());assert.deepEqual(await liveData(page),played);assert.deepEqual(await rehearsalData(page),rehearsal);
  await page.screenshot({path:'test-results/bandlive-calendar-live.png'});await finish(page);assert(await page.locator('.bl-concert-result').isVisible());assert((await page.locator('.bl-concert-result').textContent()).includes('Réputation'));assert((await page.locator('.bl-concert-result').textContent()).includes('énergie'));
  const done=await worldData(page);assert.equal(done.showHistory.length,1);assert.equal(done.showHistory[0].mode,'bandlive');assert.equal(done.performance.applied,true);restore(done);
  await page.reload();assert(await page.locator('.bl-concert-result').isVisible());assert.equal((await worldData(page)).showHistory.length,1);await page.screenshot({path:'test-results/bandlive-calendar-result.png'});
  const returnClock=await page.locator('#clock').textContent();await page.locator('#bl-return').click();assert(await page.locator('#map-view').isVisible());assert.equal(await page.locator('#speed').inputValue(),'1');await page.waitForFunction(previous=>document.querySelector('#clock').textContent!==previous,returnClock,{timeout:5000});
  await page.locator('#speed').fill('0');await page.locator('[data-view="groups"]').click();const record=(await worldData(page)).showHistory[0];await page.locator(`#group-list [data-group-select="${record.groupId}"]`).click();await page.locator(`details[data-key="shows-${record.groupId}"] > summary`).click();await page.locator(`details[data-key="history-${record.id}"] > summary`).click();
  const beforeReplay=await worldData(page);await page.locator(`[data-history-replay="${record.id}"]`).click();assert(await page.locator('#bandlive-view').isVisible());assert((await page.locator('.bl-hud .eyebrow').textContent()).includes('REPLAY'));assert.equal((await rehearsalData(page)).phase,'choose');await page.locator('[data-bl-song]').click();await page.locator('#bl-end').click();assert.deepEqual(await worldData(page),beforeReplay,'A historical replay gives no second result or consequences');await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,preparedConcert().world);await start(page);await page.locator('#bl-end').click();const mid=await liveData(page);
  await page.locator('[data-view="settings"]').click();await page.locator('#bandlive-enabled').uncheck();assert(await page.locator('#bandlive-nav').isVisible());await page.locator('#bandlive-nav').click();assert.deepEqual(await liveData(page),mid);await page.reload();assert(await page.locator('#bandlive-view').isVisible());assert.deepEqual(await liveData(page),mid);
  await finish(page);await page.locator('#bl-return').click();assert(await page.locator('#map-view').isVisible());assert(await page.locator('#bandlive-nav').isHidden());assert.equal((await worldData(page)).showHistory.length,1);await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,preparedConcert({following:true}).world);await start(page);await finish(page);assert((await page.locator('#bl-return').textContent()).includes('soirée'));await page.locator('#bl-return').click();assert(await page.locator('#shows-view').isVisible());const next=await worldData(page);assert.equal(next.performance.fans.length,12);assert(!next.performance.bandLive);assert.equal(next.showHistory.length,1);await page.locator('#skip-show').click();await page.locator('#next-slot').click();assert(await page.locator('#map-view').isVisible());assert.equal((await worldData(page)).showHistory.length,2);await page.close();

  const wonSource=preparedConcert({intention:'wild'}).world,{game}=beginBandLiveConcert(wonSource);chooseSong(game,'song-1');for(const fan of game.fans)fan.hp=1;const sax=game.cards.find(c=>c.instrument==='sax'&&c.kind==='special');for(const pile of ['hand','deck','discard'])game[pile]=game[pile].filter(id=>id!==sax.id);while(game.hand.length>=5)game.deck.push(game.hand.pop());game.hand.push(sax.id);game.tempo=4;restore(wonSource);
  page=await browser.newPage({viewport:{width:430,height:932},isMobile:true,hasTouch:true});await load(page,wonSource);await page.locator(`[data-bl-card="${sax.id}"]`).tap();await page.locator('.bl-audience').tap({position:{x:10,y:10}});await idle(page);assert.equal((await liveData(page)).phase,'won');assert.equal((await worldData(page)).showHistory[0].score,100);assert(await page.locator('.bl-concert-result').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'test-results/bandlive-calendar-touch-result.png'});await page.locator('#bl-return').click();assert(await page.locator('#map-view').isVisible());await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,preparedConcert().world);await start(page);await page.locator('#bl-cancel').click();assert(await page.locator('#map-view').isVisible());assert.equal((await worldData(page)).showHistory.length,0);assert.equal((await worldData(page)).performance,null);await page.close();

  const imported=preparedConcert().world;const importedGame=beginBandLiveConcert(imported).game;chooseSong(importedGame,'song-1');endTurn(importedGame);
  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,createWorld(12,8),{enabled:false,rehearsal});await page.locator('[data-view="settings"]').click();await page.locator('#import-file').setInputFiles({name:'concert-en-cours.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Monde importé'));await page.locator('#bandlive-nav').click();assert.deepEqual(await liveData(page),importedGame);assert.deepEqual(await rehearsalData(page),rehearsal);await finish(page);await page.locator('#bl-return').click();assert(await page.locator('#bandlive-nav').isHidden());assert.equal((await worldData(page)).showHistory.length,1);await page.close();

  page=await browser.newPage({viewport:{width:1440,height:1000}});await load(page,preparedConcert().world,{enabled:false});await page.locator('[data-view="shows"]').click();assert.equal(await page.locator('[data-bandlive-concert]').count(),0);await page.locator('#skip-show').click();assert.equal((await worldData(page)).showHistory.length,1);assert(!(await worldData(page)).showHistory[0].mode);await page.close();
  assert.deepEqual(errors,[]);console.log('Calendar BandLive browser passed: booked band and setlist, drag/drop, hover, exact reload, separate rehearsal, real result once, return and clock, history replay, disable while playing, following classic band, touch victory and result layout, interruption and default-off classic show.');
}finally{await browser.close();server.close();}
