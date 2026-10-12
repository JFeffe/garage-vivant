import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {indexDocument} from '../scripts/doc-index.mjs';
import {TRAIT_CATALOG,DISCONNECTED} from '../dist/v7.mjs';
import {VERSION} from '../dist/engine.mjs';
import {RELEASE_VERSION,PATCH_NOTES} from '../dist/release.mjs';
assert.equal(VERSION,'0.7.3');assert.equal(RELEASE_VERSION,'0.7.9');assert.equal(PATCH_NOTES[0],'v079');const notes=readFileSync('docs/versions.md','utf8');assert(notes.includes('const ids=PATCH_NOTES'));for(const id of PATCH_NOTES)assert(notes.includes('{#'+id+'}'));
const files=['docs/index.md',...readdirSync('docs/gdd').filter(f=>f.endsWith('.md')).map(f=>'docs/gdd/'+f)],entries=files.flatMap(f=>indexDocument(f,readFileSync(f,'utf8'))),config=readFileSync('docs/.vitepress/config.mjs','utf8');
assert.equal(files.length,16);for(const f of [...files,'docs/PLAN_TEST_V7.md','docs/AUDIT_V7_3.md','docs/BALANCE_V7_5.md','docs/BILAN_V7_9.md']){const source=readFileSync(f,'utf8');if(f.includes('/gdd/'))assert(config.includes('/gdd/'+f.split('/').at(-1).slice(0,-3)));for(const match of source.matchAll(/\]\(([^)]+)\)/g)){const link=match[1].split('#')[0];if(!link||/^[a-z]+:/.test(link))continue;assert(existsSync(resolve(dirname(f),link)),`${f}: ${link}`);}}
const normalize=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();for(const query of ['sans remise','solitaire','alpha','bêta','sommeil','lien amoureux','refus','débranché','inséparables','plateaux','coauteurs','défausse','qualité relative','chaînes','noms','attachement','adoption','propriétaire','invitation','dissolution','coordination','absence','plan de test','recrutement','surnom','apparence','supprimer','configuration initiale','actions individuelles','crédit'])assert(entries.some(e=>normalize(e.title+' '+e.text).includes(normalize(query))),query+' is searchable');
const traits=readFileSync('docs/gdd/traits.md','utf8'),raccords=readFileSync('docs/gdd/raccords-v7.md','utf8');for(const t of Object.values(TRAIT_CATALOG))assert(traits.includes(t.label)&&traits.includes(t.description));const plan=readFileSync('docs/PLAN_TEST_V7.md','utf8');for(const d of DISCONNECTED){assert(raccords.includes(d.id));assert(plan.includes(d.id));}assert(config.includes("link:'/PLAN_TEST_V7'"));assert(config.includes("provider:'local'"));assert(config.includes('0.7.9'));
console.log('Documentation passed: 15 DDD, navigation, local links, shared searchable terms, complete traits and explicit disconnected register.');
