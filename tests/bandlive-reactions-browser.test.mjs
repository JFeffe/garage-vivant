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
 const a=await page.locator(`[data-bl-card="${id}"]`).boundingBox(),b=await page.locator(target).boundingBox(),start={x:a.x+8,y:a.y+42},end={x:b.x+b.width/2,y:b.y+Math.min(b.height/2,40)},cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
}
try{
 for(const width of [1280,390]){
  const w=createWorld(2,2),g=createBandLive({people:w.people,songs:[{id:'a',title:'Test',style:'Punk'}],seed:7,audienceSize:8});chooseSong(g,'a');
  const keys=['bored','attentive','distracted','rhythm','variety','following'];g.fans.forEach((f,i)=>{f.intent=keys[i%6];f.max=100;f.hp=100;f.favorite='Punk';});
  const card=g.cards.find(c=>c.kind==='note');for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(x=>x!==card.id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(card.id);
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',hasTouch:width<600});await load(page,w,g);await page.locator('#bandlive-nav').click();
  const labels=await page.locator('.bl-intent').allTextContents();for(const term of ['S’ennuie','Attentif','Distrait','Attend du rythme','Veut de la variété','Se laisse entraîner'])assert(labels.some(x=>x.includes(term)),term);
  await page.locator('#bl-end').click();await idle(page);assert.deepEqual((await rehearsal(page)).fans.map(f=>f.intent),g.fans.map(f=>f.intent));
  await page.reload();await page.locator('#bandlive-nav').click();assert.deepEqual((await rehearsal(page)).fans.map(f=>f.intent),g.fans.map(f=>f.intent));
  const now=await rehearsal(page),note=now.hand.map(id=>now.cards.find(c=>c.id===id)).find(c=>c.kind==='note');assert(note);
  await page.locator(`[data-bl-card="${note.id}"]`).click({position:{x:30,y:45}});await page.locator('[data-bl-fan="f1"]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game.played===1);await idle(page);
  const after=await rehearsal(page);assert.notEqual(after.fans[1].intent,'attentive');assert.equal(after.fans[1].hp,89);await page.reload();await page.locator('#bandlive-nav').click();assert.equal((await rehearsal(page)).fans[1].intent,after.fans[1].intent);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.bl-audience-viewport').screenshot({path:`test-results/reactions-${width}.png`});await page.close();
 }
 assert.deepEqual(errors,[]);console.log('Persistent reactions UI passed: six labels, untriggered status survives turn/reload, attentive trigger and new status persist, desktop/mobile.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
