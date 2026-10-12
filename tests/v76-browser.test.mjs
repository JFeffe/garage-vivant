import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,createGroup} from '../dist/engine.mjs';
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();const errors=[];await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>errors.push(e.message));
 const s=createWorld(76,8);const g=createGroup(s,s.people.slice(0,2).map(p=>p.id),{manual:true});
 s.songs=[{id:1,title:'Le crédit visible',authors:s.people.slice(0,2).map(p=>p.id),authorNames:Object.fromEntries(s.people.slice(0,2).map(p=>[p.id,p.name])),time:s.time,quality:65,genre:'Indie',emotion:'joy',tone:'lumineuse',intensity:40,resonance:60,sources:[],hit:false,ownerGroupId:g.id,adoptedAt:s.time}];s.nextSongId=2;g.repertoire=[{songId:1,mastery:0,rehearsals:0,active:true}];
 await page.addInitScript(s=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(s));},s);
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#profile .profile-head').waitFor({state:'attached'});
 // Merely visiting Shows must retain the transport speed.
 await page.locator('#speed').fill('1');await page.locator('#speed').dispatchEvent('input');await page.locator('[data-view="shows"]').click();assert.equal(await page.locator('#speed').inputValue(),'1');
 await page.locator('[data-view="map"]').click();await page.locator('#speed').fill('0');await page.locator('#speed').dispatchEvent('input');
 await page.locator('#people [data-person]').first().click();await page.locator('[data-edit-character]').click();
 await page.locator('[data-identity="name"]').fill('Zoé');await page.locator('[data-identity="name"]').press('Tab');
 await page.locator('[data-identity="nickname"]').fill('La Louve');await page.locator('[data-identity="nickname"]').press('Tab');
 await page.locator('[data-appearance="accessory"]').selectOption('glasses');await page.locator('[data-appearance="accent"]').selectOption('scarf');
 const a=page.locator('#profile .profile-head img'),b=page.locator('#people [data-person]').first().locator('img');assert.equal(await a.getAttribute('src'),await b.getAttribute('src'));assert.equal(await a.getAttribute('data-accessory'),'glasses');assert((await page.locator('#profile h2').textContent()).includes('La Louve'));
 await page.locator('#inspector').evaluate(el=>el.scrollTop=0);await page.screenshot({path:'test-results/v076-character.png'});
 await page.locator('[data-view="groups"]').click();const credit=page.locator('.repertoire-row .composition-credit').first();assert((await credit.textContent()).includes('Composition :'));assert((await credit.textContent()).includes('La Louve'));assert.equal(await credit.locator('[data-person]').count(),2);await credit.scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/v076-composer.png'});
 await credit.locator('[data-person]').first().click();await page.locator('[data-view="map"]').click();
 await page.locator('.map-options summary').click();await page.locator('[data-map-option="actions"]').uncheck();assert.equal(await page.locator('[data-map-option="collective"]').isChecked(),true);assert.equal(await page.locator('#activity-labels').isVisible(),false);
 await page.reload();await page.locator('#profile .profile-head').waitFor({state:'attached'});assert.equal(await page.locator('[data-map-option="actions"]').isChecked(),false);assert.equal(await page.locator('#people img').first().getAttribute('data-accessory'),'glasses');
 await page.locator('#people [data-person]').first().click();await page.locator('[data-delete-character]').click();assert.equal(await page.locator('#population').textContent(),'8');await page.locator('#confirm-remove').click();assert.equal(await page.locator('#population').textContent(),'7');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));assert(!saved.people.some(p=>p.name==='Zoé'));assert.equal(saved.groups[0].state,'dissolved');assert.equal(saved.songs[0].authorNames[s.people[0].id],'Zoé');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/v076-mobile.png'});
 assert.deepEqual(errors,[]);console.log('V7.6 browser: shared portraits, nickname, persistence, removal, options and Shows navigation passed.');
}finally{await browser.close();server.close();}
