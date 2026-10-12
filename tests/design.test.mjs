import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore,step,decide,relationship} from '../dist/engine.mjs';
import {pairEligible} from '../dist/groups.mjs';
import {DESIGN_FIELDS,designProfile,applyDesign,rule} from '../dist/design-rules.mjs';
import {coolRelationV7} from '../dist/v7.mjs';
test('design overrides belong to one world, change real eligibility and preserve default behavior',()=>{
 const a=createWorld(71,4),b=structuredClone(a),[p,q]=a.people;
 relationship(a,p,q).affinity=20;relationship(a,q,p).affinity=20;
 assert(pairEligible(a,p,q));applyDesign(a,designProfile({'groups.affinity':30}));assert(!pairEligible(a,p,q));assert.equal(rule(b,'groups.affinity'),12);
 applyDesign(a,designProfile());assert(pairEligible(a,p,q));assert.equal(DESIGN_FIELDS.length,new Set(DESIGN_FIELDS.map(f=>f.id)).size);
});
test('invalid profiles reject atomically including unknown keys and inconsistent thresholds',()=>{
 const s=createWorld(7,4),before=JSON.stringify(s);
 for(const values of [{'groups.proposal':2},{'groups.proposal':null},{'groups.proposal':NaN},{'groups.proposal':'0.5'},{'groups.decisionMinutes':0},{'groups.decisionMinutes':1.5},{'unknown':1},{'relations.breakupThreshold':80}])assert.throws(()=>applyDesign(s,{format:'garage-vivant-design-1',values}));
 assert.equal(JSON.stringify(s),before);assert.throws(()=>restore({...s,design:{format:'future',values:{}}}));
});
test('custom values persist and deterministic continuation stays isolated from other worlds',()=>{
 const s=createWorld(713,4);applyDesign(s,designProfile({'groups.proposal':.6,'needs.energy':.12,'effects.relax.energy':.4}));step(s,120);const restored=restore(JSON.parse(JSON.stringify(s)));
 const unrelated=createWorld(714,4);applyDesign(unrelated,designProfile({'needs.energy':0}));step(unrelated,100);step(s,180);step(restored,180);assert.deepEqual(restored,s);
});
test('relation erosion uses the supplied world instead of a mutable global constant',()=>{
 const base={affinity:50,tension:80,love:0},a=structuredClone(base),b=structuredClone(base),s=createWorld(1,4);
 applyDesign(s,designProfile({'groups.tensionErosion':0}));coolRelationV7(a,s);coolRelationV7(b);assert.equal(a.affinity,50);assert(b.affinity<50);
});
test('empty profiles preserve legacy simulations exactly except optional profile metadata',()=>{
 const a=createWorld(9,4),b=structuredClone(a);applyDesign(b,designProfile());step(a,180);step(b,180);delete b.design;assert.deepEqual(a,b);
});
test('custom need drain and action effects change the real minute simulation',()=>{
 const a=createWorld(18,4);for(const p of a.people){decide(a,p,'relax');p.action.route=[];p.place=p.action.dest;p.needs.energy=50;}
 const b=structuredClone(a);applyDesign(b,designProfile({'needs.energy':.5,'effects.relax.energy':.8}));step(a,1);step(b,1);
 const expected=(.8-.5)-(.16-.065);assert(Math.abs((b.people[0].needs.energy-a.people[0].needs.energy)-expected)<1e-8);
});
