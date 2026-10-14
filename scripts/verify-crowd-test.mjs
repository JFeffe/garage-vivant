import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {restore} from '../dist/engine.mjs';
import {previewCard,cardById,cardDefinition} from '../dist/bandlive.mjs';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('public-pack-private-v1')));
await page.addInitScript(()=>{localStorage.setItem('garage-vivant-v1','partie-originale');localStorage.setItem('bandlive-private-normal-v1','ancien-essai');});
await mkdir('test-results',{recursive:true});
try{
  await page.goto(pathToFileURL(resolve('BandLive-test/LANCER-Public-pack.html')).href);assert(await page.locator('#crowd-test-menu').isVisible());await page.screenshot({path:'test-results/crowd-launcher.png'});
  await page.locator('[data-crowd-mode="live"]').click();await page.locator('.bl-render-ready').waitFor();assert(await page.locator('#bandlive-view').isVisible());
  const state=await saved();restore(state);const g=state.performance.bandLive.game;assert.equal(g.crowdVersion,1);assert.equal(g.fans.length,12);
  const target=g.fans.find(f=>f.hp===1&&f.effect==='shock'),id=g.hand.find(id=>{const d=cardDefinition(cardById(g,id),g);return d.target==='single'&&!d.twoTargets&&d.power>=5;});assert(id,'The demo should offer a direct card for the shock');
  const expected=previewCard(g,id,target.id);assert(expected.ok);assert(expected.event.movement?.length);await page.locator(`[data-bl-card="${id}"]`).click();await page.locator(`[data-bl-fan="${target.id}"]`).scrollIntoViewIfNeeded();await page.locator(`[data-bl-fan="${target.id}"]`).hover();await page.screenshot({path:'test-results/crowd-demo-bandlive.png'});await page.locator(`[data-bl-fan="${target.id}"]`).click();await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);assert.deepEqual((await saved()).performance.bandLive.game,expected.game);restore(await saved());
  await page.reload();await page.locator('.bl-render-ready').waitFor();assert.deepEqual((await saved()).performance.bandLive.game,expected.game);
  await page.locator('#crowd-test-open').click();await page.locator('[data-crowd-mode="classic"]').click();await page.locator('#start-show').waitFor();assert(!(await saved()).performance.bandLive);assert.equal((await saved()).performance.crowdVersion,1);await page.locator('#start-show').click();await page.waitForTimeout(1400);await page.locator('#show-pause').click();restore(await saved());await page.screenshot({path:'test-results/crowd-demo-classic.png'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('garage-vivant-v1')),'partie-originale');assert.equal(await page.evaluate(()=>localStorage.getItem('bandlive-private-normal-v1')),'ancien-essai');assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log('Standalone crowd launcher passed: both demos, exact card/push, reload, separate saves, no external requests.');
}finally{await browser.close();}
