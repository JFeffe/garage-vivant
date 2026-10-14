import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {createWorld} from '../dist/engine.mjs';
import {createBandLive,chooseSong,previewCard} from '../dist/bandlive.mjs';
const root=resolve('dist'),server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));assert(path.startsWith(root+sep));res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'text/plain');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch(),errors=[];
await mkdir('test-results',{recursive:true});
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);
try{
 for(const instruments of [['keys','guitar','bass','drums'],['voice','sax','trumpet','percussion']]){
  const world=createWorld(401,4),people=world.people.map((p,i)=>({...p,instrument:instruments[i]})),g=createBandLive({crowdPhysics:false,people,groupName:'Les Étincelles',songs:[{id:'a',title:'Minuit',style:'Punk',turns:4}],audienceSize:12,seed:7});chooseSong(g,'a');
  const ids=[0,3,8,13,18].map(i=>g.cards[i].id);g.hand=ids;g.deck=g.cards.map(c=>c.id).filter(id=>!ids.includes(id));
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({world,g})=>{localStorage.setItem('garage-vivant-v1',JSON.stringify(world));localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game:g}));window.webglContexts=0;const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2'||type==='webgl')window.webglContexts++;return original.call(this,type,...args);};},{world,g});
  await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#bandlive-nav').click();await page.locator('.bl-render-ready').waitFor();await page.waitForTimeout(250);
  assert.deepEqual(await saved(page),g,'Dance and scene mounting never modify the canonical game');
  await page.evaluate(()=>window.originalStageCanvas=document.querySelector('.bl-scene-canvas'));
  const card=await page.locator(`[data-bl-card="${ids[0]}"]`).boundingBox(),fan=await page.locator('[data-bl-fan="f0"]').boundingBox();
  await page.mouse.move(card.x+30,card.y+45);await page.mouse.down();await page.mouse.move(card.x+30,card.y+65,{steps:4});await page.mouse.move(fan.x+fan.width/2,fan.y+fan.height/2,{steps:8});await page.waitForTimeout(120);
  assert.equal(await page.locator('.drag-card-feedback').count(),1);assert(await page.locator('#bl-card-preview').isVisible());
  const expected=previewCard(g,ids[0],'f0');assert(expected.ok);const gain=g.fans[0].hp-expected.game.fans[0].hp;
  assert.equal(await page.locator('.drag-gain b').textContent(),'+'+gain);assert.deepEqual(await saved(page),g,'The exact preview consumes nothing');
  const popup=await page.locator('.drag-card-feedback').boundingBox(),target=await page.locator('[data-bl-fan="f0"]').boundingBox();
  assert(!(popup.x<target.x+target.width&&popup.x+popup.width>target.x&&popup.y<target.y+target.height&&popup.y+popup.height>target.y),'The popup does not obscure the target');
  await page.screenshot({path:'test-results/minuit-drag-'+instruments[0]+'.png'});await page.mouse.up();await page.waitForFunction(()=>!document.querySelector('#bl-end').disabled);
  assert.deepEqual(await saved(page),expected.game);assert(await page.evaluate(()=>window.originalStageCanvas===document.querySelector('.bl-scene-canvas')),'A card transaction reuses the WebGL context');assert.equal(await page.evaluate(()=>window.webglContexts),1);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.bl-show-menu>summary').click();await page.locator('#bl-layout').click();
  const before=await page.locator('[data-bl-fan]').evaluateAll(els=>els.map(el=>[el.style.left,el.style.top])),state=await saved(page),hand=await page.locator('.bl-hand').first().boundingBox(),destination=await page.locator('[data-bl-fan="f0"]').boundingBox();
  await page.mouse.move(hand.x+hand.width/2,hand.y+30);await page.mouse.down();await page.mouse.move(destination.x+40,destination.y+45,{steps:8});await page.mouse.up();assert.deepEqual(await page.locator('[data-bl-fan]').evaluateAll(els=>els.map(el=>[el.style.left,el.style.top])),before,'A hand never pushes spectators');
  const body=await page.locator('[data-bl-fan="f0"]').boundingBox();await page.mouse.move(body.x+40,body.y+40);await page.mouse.down();await page.mouse.move(body.x+400,body.y+350,{steps:8});await page.mouse.up();
  const boxed=await page.locator('[data-bl-fan="f0"]').boundingBox(),slot=await page.locator('.bl-fan-wrap').first().boundingBox();assert(boxed.x>=slot.x&&boxed.x+boxed.width<=slot.x+slot.width);assert(boxed.y>=slot.y&&boxed.y+boxed.height<=slot.y+slot.height);assert.deepEqual(await saved(page),state,'Disposition never changes card rules or fan order');
  await page.screenshot({path:'test-results/minuit-disposition-'+instruments[0]+'.png'});await page.close();
 }
 assert.deepEqual(errors,[]);console.log('Minuit UI passed: eight instruments, independent dance, exact pinned preview, unobscured target, one WebGL context, collider-free hands and boxed logical neighbors.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
