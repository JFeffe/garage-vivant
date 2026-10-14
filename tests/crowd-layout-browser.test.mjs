import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {createWorld} from '../dist/engine.mjs';
import {createBandLive,chooseSong,cardDefinition,previewCard} from '../dist/bandlive.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {stageGeometry} from '../dist/show-playback.mjs';
const root=resolve('dist'),server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));assert(path.startsWith(root+sep));res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'text/plain');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));await mkdir('test-results',{recursive:true});const url=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch(),errors=[];
const sizes=[{width:1440,height:900},{width:1280,height:720},{width:1024,height:600},{width:900,height:520},{width:800,height:600},{width:640,height:480},{width:390,height:844},{width:360,height:640},{width:844,height:390}];
async function check(page,mode){
  const layout=await page.evaluate(mode=>{
    const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,id:el.dataset.blActor||el.dataset.blFan||el.dataset.stageActor};};
    const nodes=mode==='bandlive'?[...document.querySelectorAll('[data-bl-actor],[data-bl-fan]')]:[...document.querySelectorAll('[data-stage-actor]')];
    const scroll=sel=>{const e=document.querySelector(sel);return e?{id:sel,x:e.scrollLeft,y:e.scrollTop,h:e.scrollHeight-e.clientHeight,w:e.scrollWidth-e.clientWidth,overflow:getComputedStyle(e).overflow}:null;};
    return {header:box(document.querySelector('header')),hud:box(document.querySelector(mode==='bandlive'?'.bl-hud':'.show-hud')),people:nodes.map(box),scroll:['#main','.bl-viewport','.bl-audience-viewport'].map(scroll).filter(Boolean),stage:box(document.querySelector(mode==='bandlive'?'.bl-world':'.stage-field')),width:innerWidth,height:innerHeight,bottom:!!document.querySelector('.show-bottom')};
  },mode);
  assert.equal(layout.people.length,mode==='bandlive'?18:6);assert(layout.header.height<=41);assert(layout.hud.height<=145,'Controls must stay compact: '+JSON.stringify(layout));
  for(const r of layout.people){assert(r.width>0&&r.height>0);assert(r.x>=-1&&r.y>=layout.header.height&&r.x+r.width<=layout.width+1&&r.y+r.height<=layout.height+1,'Everyone is fully in the window: '+JSON.stringify({mode,layout,r}));}
  assert.equal(layout.bottom,false);assert(layout.scroll.every(s=>s.x===0&&s.y===0));assert(layout.scroll.every(s=>s.h<=1&&s.w<=1),'No scroll surface: '+JSON.stringify(layout.scroll));assert(layout.scroll.find(s=>s.id==='#main').h<=1,'No outside scroll');
  return layout;
}
try{
  for(const size of sizes){
    const world=createWorld(401,6),people=world.people.map((p,i)=>({...p,instrument:['guitar','drums','bass','voice','keys','trumpet'][i]})),g=createBandLive({people,songs:[{id:'a',title:'Toute la foule',style:'Punk',turns:4}],audienceSize:12,seed:57});chooseSong(g,'a');
    g.fans[0].hp=1;const card=g.cards.find(c=>c.kind==='note');for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(id=>id!==card.id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(card.id);
    const page=await browser.newPage({viewport:size,reducedMotion:'reduce',hasTouch:size.width<650});page.on('pageerror',e=>errors.push(e.stack));await page.addInitScript(({world,g})=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));if(!localStorage.getItem('garage-vivant-bandlive-v1'))localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game:g}));},{world,g});await page.goto(url);await page.locator('#bandlive-nav').click();await page.locator('.bl-render-ready').waitFor();await check(page,'bandlive');
    const target=g.fans[0],expected=previewCard(g,card.id,target.id);await page.locator(`[data-bl-card="${card.id}"]`).click();await page.locator(`[data-bl-fan="${target.id}"]`).hover();assert(await page.locator('#bl-card-preview').isVisible());await check(page,'bandlive');
    // The forecast ring must stay aligned with the target after fitting the scene.
    const ring=await page.locator('.bl-aim-ring').last().boundingBox(),fan=await page.locator(`[data-bl-fan="${target.id}"] .bl-cube`).boundingBox();assert(Math.abs(ring.x+ring.width/2-fan.x-fan.width/2)<2);assert(Math.abs(ring.y+ring.height/2-fan.y-fan.height/2)<2);
    await page.screenshot({path:`test-results/crowd-fit-${size.width}-${size.height}.png`});await page.locator(`[data-bl-fan="${target.id}"]`).click();await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game);assert.deepEqual(saved,expected.game);await check(page,'bandlive');
    assert.equal(await page.locator('[data-bl-fan="f0"].bl-conquered .bl-hp').textContent(),'✓ CONQUIS');
    await page.mouse.move(0,0);
    const meters=await page.locator('.bl-fan-meter').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x,y:r.y,w:r.width,h:r.height,visible:el.contains(top)};}));
    assert(meters.every(m=>m.visible),'Meters stay above all neighboring spectators');
    for(let i=0;i<meters.length;i++)for(let j=i+1;j<meters.length;j++){const a=meters[i],b=meters[j];assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'Conquest meters do not overlap');}
    await page.screenshot({path:`test-results/crowd-meters-${size.width}-${size.height}.png`});
    // Resize the ongoing show without changing its gameplay state.
    await page.setViewportSize({width:size.height,height:size.width});await check(page,'bandlive');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-bandlive-v1')).game),saved);await page.close();
    const {world:classic}=preparedConcert({large:true,instruments:['guitar','drums','bass','voice','keys','trumpet']});const showPage=await browser.newPage({viewport:size,reducedMotion:'reduce'});showPage.on('pageerror',e=>errors.push(e.stack));await showPage.addInitScript(w=>{localStorage.setItem('garage-vivant-v1',JSON.stringify(w));localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game:null}));},classic);await showPage.goto(url);await showPage.locator('[data-view="shows"]').click();await showPage.locator('#start-show').waitFor();const layout=await check(showPage,'classic'),geometry=stageGeometry({clientWidth:layout.stage.width,clientHeight:layout.stage.height,dataset:{showLayout:'integrated'}});
    for(const fan of classic.performance.fans){const x=layout.stage.x+geometry.ox+fan.x*geometry.scale,y=layout.stage.y+geometry.oy+fan.y*geometry.scale;assert(x-25*geometry.scale>=0&&x+25*geometry.scale<=size.width&&y-45*geometry.scale>=layout.stage.y&&y+35*geometry.scale<=size.height,'All classic spectators stay visible');}
    await showPage.screenshot({path:`test-results/classic-fit-${size.width}-${size.height}.png`});await showPage.close();
  }
  assert.deepEqual(errors,[]);console.log('Full-window shows passed: six musicians and twelve fans, compact top controls, aligned targeting, resize, desktop, small windows and portrait/landscape.');
}catch(e){console.error(e);throw e;}finally{await browser.close();await new Promise(r=>server.close(r));}
