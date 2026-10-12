import test from 'node:test';
import assert from 'node:assert/strict';
import {restore,step} from '../dist/engine.mjs';
import {completePerformance,command,nextSlot,skipShow,playTicks} from '../dist/life.mjs';
import {validatePerformance} from '../dist/stage.mjs';
import {chooseSong,availableSongs,playCard,endTurn,restoreBandLive} from '../dist/bandlive.mjs';
import {concertAudienceProfile,resolveBandLiveConcert,beginBandLiveConcert,commitBandLiveConcert,followingConcertPerformance,createConcertReplay} from '../dist/bandlive-concert.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';

function finishWithoutCards(world){
  const game=world.performance.bandLive.game;
  while(!['won','lost'].includes(game.phase)){if(game.phase==='choose')chooseSong(game,availableSongs(game)[0].id);else endTurn(game);commitBandLiveConcert(world,completePerformance);}
  return game;
}

test('calendar BandLive uses the confirmed, arrived band and reserved compositions, without changing neighbourhood RNG or decks',()=>{
  const {world}=preparedConcert(),before=structuredClone(world),plan=resolveBandLiveConcert(world);
  assert(plan.ready);const result=beginBandLiveConcert(world);assert(result.ok);
  const game=result.game;assert.equal(game.actors.length,before.performance.actors.length);assert.deepEqual(game.actors.map(a=>a.id),before.performance.actors.map(a=>a.id));
  assert.deepEqual(game.songOrder,['song-1','song-2']);assert.deepEqual(game.songs.map(s=>s.title),before.songs.map(s=>s.title));assert.equal(game.version,3);
  assert.equal(world.rng,before.rng);assert.deepEqual(world.people,before.people);assert.deepEqual(world.groups,before.groups);assert.deepEqual(world.bookings,before.bookings);
  assert.equal(game.fans.length,8);assert(game.fans.every(f=>before.performance.sourceOpportunity.styles.includes(f.favorite)));assert.deepEqual(restore(world),world);
  const snapshot=structuredClone(world);step(world,100);playTicks(world,100000);skipShow(world,true);assert.deepEqual(world,snapshot,'A pending interactive show cannot be simulated or skipped as a classic show');
});
test('venues set progressively larger and more resistant audiences; styles outside the setlist remain resumable',()=>{
  const profiles=[concertAudienceProfile({venue:'g1',crowd:12,styles:['Punk']}),concertAudienceProfile({venue:'park',crowd:12,styles:['Jazz']}),concertAudienceProfile({venue:'g1',crowd:24,final:true,styles:['Ska']})];
  assert.deepEqual(profiles.map(p=>p.audienceSize),[8,10,12]);assert.deepEqual(profiles.map(p=>p.audienceRules.resistancePercent),[65,80,100]);
  const {world}=preparedConcert({venue:'park'});world.performance.sourceOpportunity.styles=['Jazz'];const {game}=beginBandLiveConcert(world);assert.equal(game.fans.length,10);assert(game.fans.every(f=>f.favorite==='Jazz'));assert.deepEqual(restoreBandLive(game),game);restore(world);
});
test('an interactive band inherits the audience welcome of the preceding act',()=>{
  const {world}=preparedConcert();for(const fan of world.performance.fans)fan.meter=20;const {game}=beginBandLiveConcert(world);assert(game.fans.every(f=>f.hp===Math.round(f.max*.8)));assert.deepEqual(restore(world),world);
});
test('a booked setlist keeps its order, and a single composition gets a second passage within six turns',()=>{
  for(const setlistLength of [1,2]){const {world}=preparedConcert({setlistLength});const {game}=beginBandLiveConcert(world);assert.deepEqual(availableSongs(game).map(s=>s.id),['song-1']);assert(!chooseSong(game,'song-2').ok);chooseSong(game,'song-1');for(let i=0;i<3;i++){endTurn(game);commitBandLiveConcert(world,completePerformance);}assert.equal(game.turn,3);assert.equal(world.performance.bandLive.songResults.length,1);assert.deepEqual(availableSongs(game).map(s=>s.id),[setlistLength===1?'song-1':'song-2']);finishWithoutCards(world);assert.equal(game.turn,6);assert.equal(world.showHistory[0].songs.length,2);assert.deepEqual(restore(world),world);}
});
test('a completed show applies the existing group and musician consequences once, even after reload',()=>{
  const {world,groupId,bookingId}=preparedConcert();beginBandLiveConcert(world);const before=structuredClone(world),game=finishWithoutCards(world),record=world.showHistory[0];
  assert.equal(game.phase,'lost');assert.equal(world.performance.applied,true);assert.equal(world.bookings.find(b=>b.id===bookingId).status,'played');assert.equal(record.mode,'bandlive');assert.equal(record.turns,6);assert.equal(record.musicianEffects.length,game.actors.length);
  assert(world.groups.find(g=>g.id===groupId).shows.includes(record.id));assert(record.effects.after.morale<record.effects.before.morale);assert(record.musicianEffects.every(e=>e.energyAfter===Math.max(0,e.energyBefore-15)));
  assert(world.people.filter(p=>game.actors.some(a=>a.id===p.id)).every(p=>!p.engagement));assert.equal(world.time,before.time);
  const done=structuredClone(world);assert(!commitBandLiveConcert(world,completePerformance));assert(!completePerformance(world));assert.deepEqual(world,done);
  const reloaded=restore(JSON.parse(JSON.stringify(world)));assert(!commitBandLiveConcert(reloaded,completePerformance));assert.deepEqual(reloaded,done);
  const legacy=structuredClone(world.performance);delete legacy.bandLive;validatePerformance(legacy);
});
test('a victory records all conquered spectators and grants one result; wild fatigue follows cards actually played',()=>{
  const {world}=preparedConcert({intention:'wild'});const {game}=beginBandLiveConcert(world);chooseSong(game,'song-1');for(const f of game.fans)f.hp=1;
  const card=game.cards.find(c=>c.kind==='special'&&c.instrument==='sax');assert(card);for(const pile of ['hand','deck','discard'])game[pile]=game[pile].filter(id=>id!==card.id);while(game.hand.length>=5)game.deck.push(game.hand.pop());game.hand.push(card.id);game.tempo=4;
  assert(playCard(game,card.id,'audience').ok);assert.equal(game.phase,'won');assert(commitBandLiveConcert(world,completePerformance));assert.equal(world.showHistory.length,1);assert.equal(world.showHistory[0].score,100);assert.equal(world.showHistory[0].conquered,8);assert.equal(world.performance.actors.find(a=>a.id===card.actorId).energyLoss,1.5);restore(world);
});
test('reload resumes the exact owned game and replay is an isolated deterministic rehearsal',()=>{
  const {world}=preparedConcert();const {game}=beginBandLiveConcert(world);chooseSong(game,'song-1');endTurn(game);commitBandLiveConcert(world,completePerformance);
  const reloaded=restore(JSON.parse(JSON.stringify(world)));assert.deepEqual(reloaded.performance.bandLive.game,game);finishWithoutCards(world);finishWithoutCards(reloaded);assert.deepEqual(reloaded,world);
  const before=structuredClone(world),a=createConcertReplay(world.performance.bandLive.game),b=createConcertReplay(world.performance.bandLive.game);assert.deepEqual(a,b);assert.equal(a.phase,'choose');chooseSong(a,'song-1');endTurn(a);assert.deepEqual(world,before);
});
test('the next band retains the venue audience and proceeds classically in the same evening',()=>{
  const {world}=preparedConcert({following:true});const original=world.performance.fans.length;beginBandLiveConcert(world);finishWithoutCards(world);assert.equal(world.performance.fans.length,8);const previous=followingConcertPerformance(world.performance);assert.equal(previous.fans.length,original);
  assert(nextSlot(world,previous));assert(!world.performance.bandLive);assert.equal(world.performance.fans.length,original);skipShow(world);assert.equal(world.showHistory.length,2);assert.equal(nextSlot(world),false);assert.equal(world.showEventId,null);restore(world);
});
test('direct next-slot transitions restore the full venue audience after reload without changing results or rewards',()=>{
  for(const options of [{},{venue:'park'}]){
    let {world}=preparedConcert({...options,following:true});
    const original=structuredClone(world.performance.fans);
    beginBandLiveConcert(world);finishWithoutCards(world);
    world=restore(JSON.parse(JSON.stringify(world)));
    const previous=world.performance,before=structuredClone(world),game=previous.bandLive.game;
    assert(previous.fans.length<original.length);
    assert(nextSlot(world));
    assert(!world.performance.bandLive);
    assert.deepEqual(world.performance.fans,original.map((fan,i)=>{
      const liveFan=game.fans[Math.floor(i*game.fans.length/original.length)];
      return {...fan,meter:Math.min(30,(1-liveFan.hp/liveFan.max)*100*.2),reacted:false,reactedAt:null,lastHit:null,receptivity:Math.min(1.1,fan.receptivity)};
    }));
    assert.deepEqual(world.performance.initialFans,world.performance.fans);
    assert.deepEqual(previous,before.performance,'The completed show remains an exact replay snapshot');
    assert.deepEqual(world.showHistory,before.showHistory,'Advancing grants no additional result');
    assert.deepEqual(world.people,before.people,'Advancing does not reapply musician consequences');
    assert.deepEqual(world.groups.find(g=>g.id===previous.groupId),before.groups.find(g=>g.id===previous.groupId),'Advancing does not reapply band rewards');
    assert.deepEqual(restore(JSON.parse(JSON.stringify(world))),world);
    skipShow(world);assert.equal(world.showHistory.length,2);assert.equal(world.showHistory.find(r=>r.id!==previous.id).total,original.length);
    assert.equal(world.showHistory.find(r=>r.id===previous.id).total,game.fans.length);
    assert.equal(world.showHistory.find(r=>r.id===previous.id).mode,'bandlive');
  }
});
test('interrupted next-slot transitions carry the live audience welcome without granting a BandLive result',()=>{
  const {world,bookingId}=preparedConcert({following:true});
  const {game}=beginBandLiveConcert(world);chooseSong(game,'song-1');
  const card=game.hand.find(id=>game.cards.find(c=>c.id===id).kind==='note');
  assert(playCard(game,card,game.fans[0].id).ok);
  const previous=world.performance,expected=followingConcertPerformance(previous);
  assert(expected.fans.some(f=>f.meter>0));
  assert(command(world,{type:'cancelPerformance',actorId:game.actors[0].id}).ok);
  const snapshot=structuredClone(previous);
  assert(nextSlot(world,previous));
  assert(!world.performance.bandLive);
  assert.deepEqual(world.performance.fans,expected.fans.map(f=>({...f,meter:Math.min(30,f.meter*.2),reacted:false,reactedAt:null,lastHit:null,receptivity:Math.min(1.1,f.receptivity)})));
  assert.deepEqual(previous,snapshot);assert.equal(world.showHistory.length,0);
  assert.equal(world.bookings.find(b=>b.id===bookingId).status,'cancelled');
  assert.deepEqual(restore(JSON.parse(JSON.stringify(world))),world);
  skipShow(world);assert.equal(world.showHistory.length,1);assert(!world.showHistory[0].mode);
});
test('interruption reuses cancellation, grants no result and releases the performers',()=>{
  const {world,bookingId}=preparedConcert();beginBandLiveConcert(world);const game=world.performance.bandLive.game;chooseSong(game,'song-1');const actorId=game.actors[0].id;assert(command(world,{type:'cancelPerformance',actorId}).ok);assert.equal(world.performance,null);assert.equal(world.showHistory.length,0);assert.equal(world.bookings.find(b=>b.id===bookingId).status,'cancelled');assert(world.people.every(p=>!p.engagement));restore(world);
});
test('ineligible bookings remain intact, and invalid linked concert saves are rejected',()=>{
  for(const mutate of [s=>s.performance.preview=true,s=>s.performance.presentationStarted=true,s=>s.performance.setlist=[null],s=>s.bookings.find(b=>b.performanceId===s.performance.id).setlist=[null]]){const {world}=preparedConcert();mutate(world);const before=structuredClone(world);assert(!beginBandLiveConcert(world).ok);assert.deepEqual(world,before);}
  const oversized=preparedConcert({instruments:['guitar','bass','drums','voice','keys','sax','trumpet']}).world;assert(!beginBandLiveConcert(oversized).ok);assert.equal(oversized.performance.actors.length,7);
  const {world}=preparedConcert();beginBandLiveConcert(world);for(const mutate of [s=>s.performance.bandLive.performanceId='another-show',s=>s.performance.bandLive.game.groupId='other',s=>s.performance.bandLive.game.hand.push(s.performance.bandLive.game.deck[0]),s=>s.performance.bandLive.game.audienceRules.styles=['invalid']]){const bad=structuredClone(world);mutate(bad);assert.throws(()=>restore(bad));}
});
