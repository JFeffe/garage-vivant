import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong,previewCard} from '../dist/bandlive.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
const root=resolve('dist'),server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));assert(path.startsWith(root+sep));res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'text/plain');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));await mkdir('test-results',{recursive:true});
const browser=await chromium.launch(),errors=[],url=`http://127.0.0.1:${server.address().port}/`;
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);
try{
  for(const width of [1440,390]){
    const w=createWorld(401,4),g=createBandLive({people:w.people.map(p=>({...p,instrument:'voice',bandLiveDeck:['note','new1','new2','special','special']})),songs:[{id:'a',title:'Dans le pack',style:'Punk',turns:4}],audienceSize:12,seed:7});chooseSong(g,'a');
    // A reproducible, local scenario: geometric neighbours have unrelated IDs.
    Object.assign(g.fans[0],{x:500,y:400,homeX:500,homeY:400,hp:1,effect:'shock'});Object.assign(g.fans[7],{x:590,y:400,homeX:590,homeY:400,hp:2,effect:'wave'});
    const id=g.cards[0].id;for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(x=>x!==id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(id);
    const expected=previewCard(g,id,'f0');assert(expected.ok);assert(expected.event.movement?.length);
    const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width<600,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.stack));
    await page.addInitScript(({w,g})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(w));if(!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game:g}));},{w,g});
    await page.goto(url);await page.locator('#bandlive-nav').click();await page.locator('.bl-render-ready').waitFor();assert(await page.locator('.bl-pack').count());
    assert.deepEqual(await saved(page),g,'Mounting and dance never modify gameplay');assert.equal(await page.locator('[data-bl-slot]').count(),0);
    await page.locator(`[data-bl-card="${id}"]`).click();await page.locator('[data-bl-fan="f0"]').scrollIntoViewIfNeeded();await page.locator('[data-bl-fan="f0"]').hover();
    assert(await page.locator('.bl-pack-zone').count());assert(await page.locator('.bl-pack-push').count());assert((await page.locator('.outcome-meta').textContent()).includes('déplacements'));
    assert.deepEqual(await saved(page),g);await page.screenshot({path:`test-results/crowd-preview-${width}.png`});
    if(width<600)await page.locator('[data-bl-fan="f0"]').tap();else{await page.emulateMedia({reducedMotion:'no-preference'});const r=await page.locator('[data-bl-fan="f0"]').boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2);}
    await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);assert.deepEqual(await saved(page),expected.game);
    await page.screenshot({path:`test-results/crowd-after-${width}.png`});await page.reload();await page.locator('#bandlive-nav').click();assert.deepEqual(await saved(page),expected.game,'Reload preserves tactical positions');
    const state=await saved(page);await page.locator('.bl-show-menu>summary').click();await page.locator('#bl-layout').click();await page.locator('.bl-hand').first().scrollIntoViewIfNeeded();
    const b=await page.locator('.bl-hand').first().boundingBox();await page.mouse.move(b.x+20,b.y+20);await page.mouse.down();await page.mouse.move(b.x+100,b.y+100,{steps:5});await page.mouse.up();assert.deepEqual(await saved(page),state,'Hands have no crowd collider');await page.close();
  }
  const {world}=preparedConcert({large:true});assert.equal(world.performance.crowdVersion,1);const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.stack));
  await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('[data-view="shows"]').click();await page.locator('#start-show').click();await page.waitForTimeout(2200);await page.locator('#show-pause').click();
  const actual=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));restore(actual);assert.equal(actual.performance.crowdVersion,1);assert(actual.performance.tick>0);await page.screenshot({path:'test-results/crowd-classic.png'});await page.close();
  assert.deepEqual(errors,[]);console.log('Crowd browser passed: desktop/touch, spatial forecast, exact pushes, reload, collider-free hands and classic show.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
