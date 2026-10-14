import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createGroup} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,previewCard,endTurn,cardTargets,cardDefinition,conquestTargets,restoreBandLive} from '../dist/bandlive.mjs';
import {clearReactionProgress} from '../dist/bandlive-reactions.mjs';
import {createConcertReplay} from '../dist/bandlive-concert.mjs';
import {createPerformance,advancePerformance,validatePerformance,SHOW_TICKS} from '../dist/stage.mjs';
import {command} from '../dist/life.mjs';
import {CROWD,createPack,distance,stepCrowd,validCrowd} from '../dist/crowd-physics.mjs';
function game(instrument='guitar',kind='note'){
  const w=createWorld(301,4),people=w.people.map(p=>({...p,instrument,bandLiveDeck:['note',kind,kind,'special','special']}));
  const g=createBandLive({people,songs:[{id:'a',title:'Le pack',style:'Punk',turns:3}],seed:9,audienceSize:12});chooseSong(g,'a');
  g.fans.forEach((f,i)=>{Object.assign(f,{hp:100,max:100,favorite:'Punk',effect:'spotlight',intent:'rhythm',x:145+i%6*140,y:260+Math.floor(i/6)*330,vx:0,vy:0});f.homeX=f.x;f.homeY=f.y;clearReactionProgress(f);});return g;
}
function at(g,id,x,y){const f=g.fans.find(f=>f.id===id);Object.assign(f,{x,y,homeX:x,homeY:y});return f;}
function give(g,kind='note'){
  const c=g.cards.find(c=>c.kind===kind);for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(id=>id!==c.id);
  while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(c.id);g.energy=3;return c;
}
function play(g,c,id){const before=structuredClone(g),preview=previewCard(g,c.id,id);assert(preview.ok);assert.deepEqual(g,before);const r=playCard(g,c.id,id);assert(r.ok);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);return r;}
test('packs are seeded, bounded, mixed and separated for both crowd sizes without using card RNG',()=>{
  for(const n of [3,8,10,12,24,36])for(const seed of [0,9,1982]){
    const pack=createPack(n,seed);assert.deepEqual(pack,createPack(n,seed));assert(validCrowd(pack));
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)assert(distance(pack[i],pack[j])>=CROWD.radius*2-.1);
    assert(new Set(pack.map(f=>f.x)).size===n);assert(new Set(pack.map(f=>f.y)).size===n);
  }
  const w=createWorld(5,4),opts={people:w.people,songs:[{id:'a',title:'A',style:'Punk'}],seed:22,audienceSize:12};
  const legacy=createBandLive({...opts,crowdPhysics:false}),pack=createBandLive(opts);assert.equal(pack.rng,legacy.rng);assert.equal(pack.reactionRng,legacy.reactionRng);assert.deepEqual(pack.deck,legacy.deck);assert.deepEqual(createConcertReplay(pack).fans,createBandLive(opts).fans);
});
test('near cards follow distance rather than row or array order; preparation previews list all recipients',()=>{
  const g=game('bass','new1'),f=at(g,'f0',500,400);at(g,'f7',585,400);at(g,'f1',760,400);
  const c=give(g,'new1');assert.equal(cardDefinition(c,g).shape,'near');assert(!cardDefinition(c,g).description.includes('rangée'));
  assert.deepEqual(cardTargets(g,c,f).map(f=>f.id),['f0','f7']);const r=play(g,c,'f0');assert.deepEqual(r.event.targets,['f0','f7']);
  assert(g.fans[7].noBoredom);assert(!g.fans[1].noBoredom);at(g,'f7',850,550);assert(g.fans[7].noBoredom);
});
test('near damage and style cards keep their values and spend tempo once for the entire zone',()=>{
  const g=game('keys','new2');at(g,'f0',500,400);at(g,'f7',585,400);at(g,'f1',760,400);g.tempo=3;
  const r=play(g,give(g,'new2'),'f0');assert.deepEqual(r.event.hits.map(h=>[h.id,h.power]),[['f0',7],['f7',7]]);assert.equal(g.tempo,1);
  const h=game('trumpet','new2');at(h,'f0',500,400);at(h,'f7',585,400);const t=play(h,give(h,'new2'),'f0');assert(t.ok);at(h,'f7',850,550);assert.equal(h.fans[7].turnStyle,'Punk');endTurn(h);assert.equal(h.fans[7].turnStyle,undefined);
});
test('conquered-neighbour trumpet bonus uses the positions at the time the card is played',()=>{
  const g=game('trumpet','new1');at(g,'f0',500,400);const f=at(g,'f7',580,400);f.hp=0;f.conquered=true;
  play(g,give(g,'new1'),'f0');assert.equal(g.tempo,3);at(g,'f7',850,550);play(g,give(g,'new1'),'f0');assert.equal(g.tempo,4);
});
test('shock preview includes chains and collision displacement; all chain targets resolve before movement',()=>{
  const g=game();at(g,'f0',500,400).effect='shock';g.fans[0].hp=1;at(g,'f7',590,400);g.fans[7].hp=2;g.fans[7].effect='wave';at(g,'f2',677,400);
  const before=g.fans.map(f=>({x:f.x,y:f.y})),r=play(g,give(g),'f0');assert.deepEqual(r.effects.map(e=>e.fanId),['f0','f7']);
  assert.equal(g.fans[2].hp,98);assert(r.event.movement.length);assert(g.fans[7].x>before[7].x);assert(g.fans[2].x>before[2].x,'A pushed body transfers pressure to another spectator');assert(g.fans.every(f=>f.vx===0&&f.vy===0));
});
test('following remembers a nearby conquest even when the push separates both spectators',()=>{
  const g=game(),f=at(g,'f0',500,460);f.intent='following';f.hp=60;const source=at(g,'f7',500,340);source.hp=1;source.effect='shock';
  play(g,give(g),'f7');assert(f.reactionNeighbor);assert(distance(f,source)>CROWD.near);const hp=f.hp;endTurn(g);assert.equal(f.hp,hp-3);assert.notEqual(f.intent,'following');
});
test('pierce travels away from the stage in geometric order and stops at the first survivor',()=>{
  const g=game(),f=at(g,'f0',505,300);f.effect='pierce';f.hp=1;at(g,'f7',505,380).hp=3;at(g,'f2',505,460).hp=5;at(g,'f4',505,550);at(g,'f1',730,400);
  assert.deepEqual(conquestTargets(g,f).map(f=>f.id),['f7','f2']);const r=play(g,give(g),'f0');assert.equal(g.fans[7].hp,0);assert.equal(g.fans[2].hp,1);assert.equal(g.fans[4].hp,100);assert.equal(r.effects.length,2);
});
test('wide effects reach farther than near effects; spotlight and chorus follow their recipients',()=>{
  const g=game(),f=at(g,'f0',500,400);at(g,'f7',580,400);at(g,'f2',680,400);f.effect='wave';const wide=conquestTargets(g,f).map(f=>f.id);assert(wide.includes('f2')&&wide.includes('f7'));f.effect='spotlight';assert.deepEqual(conquestTargets(g,f).map(f=>f.id),['f7']);f.hp=1;
  play(g,give(g),'f0');at(g,'f7',850,550);assert(g.fans[7].spotlight);assert(!g.fans[2].spotlight);endTurn(g);assert.equal(g.fans[7].spotlight,undefined);
  const h=game();at(h,'f0',500,400).effect='chorus';h.fans[0].hp=1;at(h,'f7',680,400);h.fans[7].favorite='Punk';play(h,give(h),'f0');at(h,'f7',850,550);assert.equal(h.fans[7].chorusStyle,'Punk');for(let i=0;i<3;i++)endTurn(h);assert.equal(h.fans[7].chorusStyle,undefined);
});
test('end-turn conquests also settle pushes and resume exactly from saved positions',()=>{
  const g=game();at(g,'f0',500,400).effect='shock';g.fans[0].hp=3;g.fans[0].reactionTempo=3;at(g,'f7',590,400);
  const h=restoreBandLive(g);endTurn(g);endTurn(h);assert.deepEqual(h,g);assert(g.fans[7].x>590);assert.deepEqual(restoreBandLive(g),g);
});
test('invalid physics saves are rejected; old grid saves and replays keep their rules',()=>{
  const g=game();for(const change of [g=>g.crowdVersion=2,g=>g.fans[0].x=NaN,g=>delete g.fans[0].vy,g=>g.fans[0].y=999]){const bad=structuredClone(g);change(bad);assert.throws(()=>restoreBandLive(bad));}
  delete g.crowdVersion;g.fans[0].effect='shock';assert.deepEqual(conquestTargets(g,g.fans[0]).map(f=>f.id),['f1','f4']);assert.equal(createConcertReplay(g).crowdVersion,undefined);assert.deepEqual(restoreBandLive(g),g);
});
test('classic crowd transfers velocity through touching bodies and stays in bounds',()=>{
  const fans=[{id:'a',x:500,y:400,vx:180,vy:0},{id:'b',x:570,y:400,vx:0,vy:0},{id:'c',x:640,y:400,vx:0,vy:0}];
  for(let i=0;i<90;i++)stepCrowd(fans);assert(fans[2].x>640);assert(fans[1].x>570);for(let i=0;i<2;i++)assert(distance(fans[i],fans[i+1])>=68-.01);
});
test('classic shows keep deterministic playback, saves and legacy replays with 36 spectators',()=>{
  const w=createWorld(81,4),group=createGroup(w,w.people.map(p=>p.id),{manual:true}),opts={id:'show',seed:72,people:w.people,group,song:{id:1,title:'Test',genre:'Indie',quality:60,intensity:50,emotion:'joy'},opportunity:{id:'o',name:'Scène',styles:['Indie'],crowd:36},preview:true};
  const show=createPerformance(opts),slow=structuredClone(show),fast=structuredClone(show);assert.equal(show.crowdVersion,1);assert(validCrowd(show.fans));advancePerformance(slow,420);validatePerformance(slow);const restored=structuredClone(slow);advancePerformance(restored,SHOW_TICKS);while(slow.status==='playing')advancePerformance(slow,13);advancePerformance(fast,SHOW_TICKS);assert.deepEqual(fast,slow);assert.deepEqual(restored,slow);validatePerformance(fast);
  const old=createPerformance({...opts,crowdPhysics:false});advancePerformance(old,SHOW_TICKS);w.performance=old;assert(command(w,{type:'replay'}).ok);assert.equal(w.performance.crowdVersion,undefined);advancePerformance(w.performance,SHOW_TICKS);assert.deepEqual(w.performance.events,old.events);
});
