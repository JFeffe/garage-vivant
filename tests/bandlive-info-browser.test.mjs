import {sep} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {restore,createWorld} from '../dist/engine.mjs';
import {createBandLive,chooseSong,endTurn} from '../dist/bandlive.mjs';
import {beginBandLiveConcert,skipBandLiveExchange} from '../dist/bandlive-concert.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';

const root=resolve('dist'),server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}
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
async function openMenu(page,selector){if(!await page.locator(selector).evaluate(el=>el.open))await page.locator(selector+'>summary').click();}
async function start(page){await page.locator('[data-view="shows"]').click();assert(await page.locator('[data-bandlive-concert]').isVisible());await page.locator('[data-bandlive-concert]').click();const song=page.locator('[data-bl-song]').first();await song.hover();const g=await liveData(page),id=await song.getAttribute('data-bl-song'),style=g.songs.find(s=>s.id===id).style;assert.equal(await page.locator('.bl-song-match').count(),g.fans.filter(f=>(f.turnStyle||f.chorusStyle||f.favorite)===style).length);await song.click();}
async function finish(page){
  for(let i=0;i<10;i++){const game=await liveData(page);if(['won','lost'].includes(game.phase))return;if(game.phase==='choose')await page.locator('[data-bl-song]').first().click();else await page.locator('#bl-end').click();}
  throw Error('Interactive concert did not finish within six turns.');
}
async function idle(page){await page.waitForFunction(()=>!document.querySelector('#bl-end')||!document.querySelector('#bl-end').disabled);}

try{
for(const size of [{width:1280,height:720},{width:360,height:640},{width:844,height:390}]){
const page=await browser.newPage({viewport:size,reducedMotion:'reduce'});await load(page,preparedConcert({instruments:['guitar','drums','bass','voice','keys','trumpet']}).world);await start(page);assert.equal(await page.locator('.bl-resistance .bl-hp').count(),await page.locator('[data-bl-fan]').count());
const g=await liveData(page);for(const f of g.fans){await page.locator('[data-bl-fan="'+f.id+'"]').hover();assert(await page.locator('.bl-aim.visible .bl-pack-zone').count()>0);assert(await page.locator('[data-bl-fan="'+f.id+'"] .bl-intent').isVisible());}const fan=page.locator('[data-bl-fan="f0"]');await fan.hover();assert.equal(await page.locator('#bandlive-tooltip .bl-fan-info').count(),3);await fan.click();await page.mouse.move(0,0);assert(await page.locator('#bandlive-tooltip.is-pinned').isVisible());
for(const row of await page.locator('#bandlive-tooltip .bl-fan-info').all()){await row.hover();assert.equal(await page.locator('.bl-fan-detail').textContent(),await row.getAttribute('data-fan-detail'));}
await page.screenshot({path:'test-results/fan-tip-'+size.width+'.png'});await page.locator('[data-fan-tip-close]').click();assert(await page.locator('#bandlive-tooltip').isHidden());
await finish(page);
async function fits(){const result=await page.locator('.bl-result-panel').evaluate(el=>{const r=el.getBoundingClientRect();return {h:el.scrollHeight-el.clientHeight,w:el.scrollWidth-el.clientWidth,inside:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,children:[...el.querySelectorAll('button')].filter(e=>e.getClientRects().length).every(e=>{const b=e.getBoundingClientRect();return b.top>=r.top&&b.bottom<=r.bottom&&b.right<=r.right;})};});assert(result.h<=1&&result.w<=1&&result.inside&&result.children,JSON.stringify({size,result}));}
await fits();await page.locator('#bl-reward-begin').click();await fits();await page.locator('[data-bl-reward-actor]').first().click();await fits();assert.equal(await page.locator('[data-bl-reward-slot]').count(),5);assert(await page.locator('[data-bl-reward-kind]').first().isVisible());await page.locator('#bl-reward-back').click();assert(await page.locator('[data-bl-reward-actor]').first().isVisible());await page.locator('[data-bl-reward-actor]').first().click();await page.locator('[data-bl-reward-slot]').first().click();await fits();await page.locator('[data-bl-reward-kind]:not(:disabled)').first().click();await fits();await page.screenshot({path:'test-results/full-result-'+size.width+'.png'});await page.locator('#bl-confirm-exchange').click();await fits();await page.close();
}
assert.deepEqual(errors,[]);console.log('Pinned spectator details and fullscreen reward steps fit desktop, portrait and landscape without scrolling.');
}finally{await browser.close();server.close();}
