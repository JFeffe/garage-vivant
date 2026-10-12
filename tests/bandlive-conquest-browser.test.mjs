import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld} from '../dist/engine.mjs';
import {createBandLive,chooseSong,previewCard} from '../dist/bandlive.mjs';
const root=resolve('dist'),server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch(),errors=[];
const world=createWorld(401,4),g=createBandLive({people:world.people.map(p=>({...p,instrument:'guitar'})),songs:[{id:'x',title:'Le chœur du quartier',style:'Punk',turns:3}],seed:7,audienceSize:12});chooseSong(g,'x');
g.fans.forEach(f=>{f.hp=f.max=100;f.effect='spotlight';});g.fans[0].effect='shock';g.fans[0].hp=1;g.fans[1].effect='wave';g.fans[1].hp=2;
const id=g.cards[0].id;for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(x=>x!==id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(id);
const expected=previewCard(g,id,'f0').game;
await mkdir('test-results',{recursive:true});
try{
 for(const size of [{width:1440,height:1000},{width:1280,height:720},{width:390,height:844}]){
  const page=await browser.newPage({viewport:size,hasTouch:size.width<600});page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({world,g})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));if(!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game:g}));},{world,g});
  await page.goto(url);await page.locator('#bandlive-nav').click();
  assert.equal(await page.locator('.bl-conquest-bonus').count(),12);
  const positions=await page.locator('.bl-fan-wrap').evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
  assert.equal(positions[0].y,positions[3].y);assert(positions[4].y>positions[0].y);assert(Math.abs(positions[4].x-positions[0].x)<1);
  await page.locator('[data-bl-fan="f0"]').scrollIntoViewIfNeeded();await page.locator('[data-bl-fan="f0"]').focus();assert((await page.locator('#bandlive-tooltip').innerText()).includes('Onde de choc'));assert.equal(await page.locator('.bl-conquest-area').count(),2,JSON.stringify({size,tooltip:await page.locator('#bandlive-tooltip').isVisible(),active:await page.evaluate(()=>document.activeElement.outerHTML.slice(0,150))}));
  await page.locator(`[data-bl-card="${id}"]`).click({position:{x:8,y:42}});await page.locator('[data-bl-fan="f0"]').focus();
  const p=page.locator('.bl-preview-layer [data-bl-preview="f1"]');assert(await p.isVisible());assert((await p.textContent()).includes('100 / 100'));
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game),g,'Preview must not modify saved state');
  await page.screenshot({path:`test-results/conquest-preview-${size.width}.png`});
  await page.locator('[data-bl-fan="f0"]').press('Enter');await page.waitForFunction(()=>!document.querySelector('#bl-end').disabled);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game),expected);
  await page.reload();await page.locator('#bandlive-nav').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game),expected);
  assert.equal(await page.locator('.bl-conquest-bonus').count(),12);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`test-results/conquest-result-${size.width}.png`});await page.close();
 }assert.deepEqual(errors,[]);console.log('Conquest UI passed: labels, stable rows at three widths, area highlight, exact chain preview, keyboard play and persisted result.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
