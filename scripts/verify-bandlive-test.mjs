import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {restore} from '../dist/engine.mjs';
import {cardById,cardDefinition} from '../dist/bandlive.mjs';

const browser=await chromium.launch(),page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}}),errors=[],network=[];
const worldKey='bandlive-decks-test-v1',original='garage-vivant-v1',sentinel='sauvegarde-originale-conservée';
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
await page.addInitScript(({original,sentinel})=>{localStorage.setItem(original,sentinel);},{original,sentinel});
const data=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),worldKey);
try{
  await page.goto(pathToFileURL(resolve(process.argv[2]||'BandLive-test/LANCER-BandLive.html')).href);await page.locator('#bandlive-view').waitFor({state:'visible'});
  const before=await data(),game=before.performance.bandLive.game;restore(before);assert.equal(game.version,4);assert(before.groups.some(g=>g.id===game.groupId));assert(game.songs.every(s=>before.songs.some(song=>song.id===s.sourceSongId&&song.title===s.title)));
  await page.locator('[data-bl-song]').first().click();const playing=(await data()).performance.bandLive.game,id=playing.hand.find(id=>cardDefinition(cardById(playing,id)).cost<=playing.energy);assert(id);const card=cardById(playing,id);
  await page.locator(`[data-bl-card="${id}"]`).click({position:{x:30,y:45}});await page.locator(cardDefinition(card).target==='single'?'[data-bl-fan="f0"]':'.bl-audience').click({position:{x:10,y:10}});await page.waitForFunction(()=>!document.querySelector('#bl-end')||!document.querySelector('#bl-end').disabled);
  const mid=await data();assert.equal(mid.performance.bandLive.game.played,1);await page.reload();assert.deepEqual((await data()).performance.bandLive.game,mid.performance.bandLive.game);
  for(let i=0;i<10;i++){const g=(await data()).performance.bandLive.game;if(['won','lost'].includes(g.phase))break;if(g.phase==='choose')await page.locator('[data-bl-song]').first().click();else await page.locator('#bl-end').click();}
  const done=await data();assert.equal(done.showHistory.length,before.showHistory.length+1);assert.equal(done.performance.applied,true);assert(await page.locator('.bl-concert-result').isVisible());restore(done);
  await page.reload();assert.equal((await data()).showHistory.length,done.showHistory.length);await page.locator('#bl-return').click();
  for(let guard=0;guard<40&&!await page.locator('#map-view').isVisible();guard++){if(await page.locator('#shows-view').isVisible()){await page.locator('#skip-evening').click();break;}if(await page.locator('#bl-return').count())await page.locator('#bl-return').click();else if(await page.locator('[data-bl-song]').count())await page.locator('[data-bl-song]').first().click();else if(await page.locator('#bl-end').count())await page.locator('#bl-end').click();else break;}
  assert(await page.locator('#map-view').isVisible());const clock=await page.locator('#clock').textContent();await page.waitForFunction(previous=>document.querySelector('#clock').textContent!==previous,clock,{timeout:5000});
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),original),sentinel);assert.deepEqual(network,[]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,offline:true,group:game.groupName,songs:game.songs.map(s=>s.title),spectators:game.fans.length,resultOnce:true,originalSavePreserved:true,returnToNeighbourhood:true}));
}finally{await browser.close();}
