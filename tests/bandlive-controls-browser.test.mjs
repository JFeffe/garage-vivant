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
 for(const [width,height] of [[1280,720],[1024,600],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<600});const w=preparedConcert().world;w.songs[0].turns=5;w.songs[1].turns=3;
  await load(page,w);await page.locator('[data-view="shows"]').click();await page.locator('[data-bandlive-concert]').click();
  assert.equal(await page.locator('.bl-song-slot').count(),2);assert((await page.locator('.bl-song-progress').innerText()).includes('À choisir'));
  await page.locator('[data-bl-song="song-1"]').click();assert((await page.locator('.bl-song-slot').first().innerText()).includes('1/5 tours'));
  async function visible(){for(const selector of ['#bl-end','#bl-sound','.bl-piles summary','#bl-simulate']){const b=await page.locator(selector).boundingBox();assert(b&&b.y>=0&&b.y+b.height<=height,JSON.stringify({width,height,selector,b}));}}
  await visible();await page.locator('.bl-piles summary').click();assert(await page.locator('.bl-piles>div').isVisible());await page.locator('.bl-piles summary').click();
  await page.evaluate(()=>document.querySelector('#main').scrollTop=350);await visible();await page.screenshot({path:`test-results/controls-${width}.png`});
  await page.locator('#bl-end').click();assert((await page.locator('.bl-song-slot').first().innerText()).includes('2/5 tours'));await page.reload();await page.locator('#bandlive-nav').click();assert((await page.locator('.bl-song-slot').first().innerText()).includes('2/5 tours'));
  await page.locator('#bl-simulate').click();await page.locator('.bl-reward').waitFor();const saved=await state(page);assert(['won','lost'].includes(saved.performance.bandLive.game.phase));assert(saved.performance.bandLive.game.played>0);assert.equal(saved.performance.bandLive.reward.status,'pending');restore(saved);await page.reload();await page.locator('#bandlive-nav').click();assert.equal((await state(page)).showHistory.length,saved.showHistory.length);assert.equal(await page.locator('#bl-simulate').count(),0);await page.close();
 }
 assert.deepEqual(errors,[]);console.log('Controls passed: sticky commands visible without scrolling at 1280×720, 1024×600 and 390×844, card viewer, two song slots, auto result/reward and reload.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
