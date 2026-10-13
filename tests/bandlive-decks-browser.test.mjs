import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong} from '../dist/bandlive.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
const root=resolve('dist'),server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch(),errors=[];
await mkdir('test-results',{recursive:true});
const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));
const rehearsal=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);
async function load(page,world,game=null){page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(({world,game})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));if(!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game}));},{world,game});await page.goto(url);if(await page.locator('#speed').isVisible())await page.locator('#speed').fill('0');}
async function idle(p){await p.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);}
async function touchDrop(page,id,target){
 await page.locator(`[data-bl-card="${id}"]`).scrollIntoViewIfNeeded();
 const a=await page.locator(`[data-bl-card="${id}"]`).boundingBox(),b=await page.locator(target).boundingBox(),start={x:a.x+30,y:a.y+45},end={x:b.x+b.width/2,y:b.y+Math.min(b.height/2,40)},cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
}
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({reducedMotion:'reduce',viewport:{width,height:1000},hasTouch:width<600});const w=preparedConcert().world;await load(page,w);await page.locator('[data-view="shows"]').click();await page.locator('[data-bandlive-concert]').click();
  const bar=page.locator('[data-bl-fan="f0"] [role="progressbar"]');assert.equal(await bar.getAttribute('aria-valuenow'),'0');
  for(let n=0;n<12;n++){if(['won','lost'].includes((await state(page)).performance.bandLive.game.phase))break;if(await page.locator('[data-bl-song]').count())await page.locator('[data-bl-song]').first().click();else await page.locator('#bl-end').click();}
  assert.equal(await page.locator('.bl-reward').count(),1);await page.reload();await page.locator('#bandlive-nav').click();
  const actor=(await state(page)).performance.bandLive.game.actors.find(a=>a.instrument==='guitar');
  await page.locator(`[data-bl-reward-actor="${actor.id}"]`).click();assert.equal(await page.locator('[data-bl-reward-slot]').count(),5);assert.equal(await page.locator('[data-bl-reward-kind]').count(),3);
  await page.locator('[data-bl-reward-slot="0"]').click();await page.locator('[data-bl-reward-kind="new1"]').click();await page.locator('#bl-confirm-exchange').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/decks-reward-${width}.png`});
  await page.locator('#bl-confirm-exchange').click();let saved=await state(page);assert.equal(saved.people.find(p=>p.id===actor.id).bandLiveDecks.guitar[0],'new1');assert.equal(saved.performance.bandLive.reward.status,'claimed');restore(saved);
  await page.reload();await page.locator('#bandlive-nav').click();assert.equal(await page.locator('#bl-confirm-exchange').count(),0);await page.locator('#bl-return').click();if(await page.locator('#speed').isVisible())await page.locator('#speed').fill('0');
  await page.locator('[data-view="map"]').click();await page.locator(`[data-person="${actor.id}"]`).first().click();await page.locator('#identity-edit > summary').click();await page.locator('[data-identity="instrument"]').selectOption('keys');
  saved=await state(page);assert.equal(saved.people.find(p=>p.id===actor.id).instrument,'keys');assert.deepEqual(saved.people.find(p=>p.id===actor.id).bandLiveDecks.keys,['note','note','note','special','special']);
  await page.locator('[data-identity="instrument"]').selectOption('guitar');saved=await state(page);assert.equal(saved.people.find(p=>p.id===actor.id).bandLiveDecks.guitar[0],'new1');assert.equal(await page.locator('#bandlive-person-decks').count(),1);
  await page.locator('#bandlive-nav').click();await page.locator('#bl-start').click();saved=await rehearsal(page);assert.equal(saved.cards.find(c=>c.actorId===actor.id).kind,'new1');assert.equal(saved.cards.length,saved.actors.length*5);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.close();
 }
 // Actual choice flows, with no energy spent until both targets / discard are chosen.
 for(const width of [1280,390])for(const instrument of ['sax','keys']){
  const w=createWorld(2,2);w.people[0].instrument=instrument;w.people[0].bandLiveDecks={[instrument]:['new2','note','note','special','special']};const g=createBandLive({people:w.people,songs:[{id:'a',title:'Test',style:'Punk'}],seed:7,audienceSize:8});chooseSong(g,'a');g.tempo=6;const id=g.cards[0].id;for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(x=>x!==id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(id);
  const page=await browser.newPage({reducedMotion:'reduce',viewport:{width,height:1000},hasTouch:width<600});await load(page,w,g);await page.locator('#bandlive-nav').click();if(width>=600)await page.locator(`[data-bl-card="${id}"]`).click({position:{x:30,y:45}});
  if(instrument==='sax'){if(width<600)await touchDrop(page,id,'[data-bl-fan="f0"]');else await page.locator('[data-bl-fan="f0"]').click();assert.equal((await rehearsal(page)).energy,3);await page.locator('[data-bl-fan="f0"]').click();assert.equal((await rehearsal(page)).played,0);if(width<600)await page.locator('[data-bl-fan="f1"]').tap({position:{x:12,y:20}});else await page.locator('[data-bl-fan="f1"]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game.played===1);await idle(page);assert.equal((await rehearsal(page)).tempo,2,JSON.stringify({width,help:await page.locator('#bl-help').innerText(),choice:await page.locator('.bl-card-choice').count()}));assert.equal((await rehearsal(page)).energy,1);assert(Number(await page.locator('[data-bl-fan="f0"] [role="progressbar"]').getAttribute('aria-valuenow'))>0);}
  else{if(width<600)await touchDrop(page,id,'[data-bl-fan="f0"]');else await page.locator('[data-bl-fan="f0"]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game.played===1);await idle(page);assert.equal((await rehearsal(page)).energy,2);assert.equal((await rehearsal(page)).tempo,4);}

  await page.reload();await page.locator('#bandlive-nav').click();assert.equal((await rehearsal(page)).played,1);await page.close();
 }
 assert.deepEqual(errors,[]);console.log('Deck UI passed: completed show, reward selection, reload, single exchange, instrument switch and restored deck, rehearsal with acquired cards, duo/row choices, growing conquest bars, desktop/mobile.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
