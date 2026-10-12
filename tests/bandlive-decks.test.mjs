import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore} from '../dist/engine.mjs';
import {completePerformance} from '../dist/life.mjs';
import {createBandLive,availableSongs,chooseSong,playCard,endTurn,canPlay,restoreBandLive,previewCard} from '../dist/bandlive.mjs';
import {INSTRUMENTS,starterDeck,musicianDeck,changeBandLiveInstrument,specialChoices,definitionFor} from '../dist/bandlive-cards.mjs';
import {beginBandLiveConcert,commitBandLiveConcert,exchangeBandLiveCard,skipBandLiveExchange,createConcertReplay} from '../dist/bandlive-concert.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
function fixture(instrument='guitar',kind='new1'){
 const people=createWorld(41,4).people.slice(0,2);people[0].instrument=instrument;people[0].bandLiveDecks={[instrument]:[kind,'note','note','special','special']};
 const g=createBandLive({people,songs:[{id:'a',title:'A',style:'Punk'}],audienceSize:12,seed:7,audienceRules:{styles:['Jazz','Punk'],resistancePercent:100}});chooseSong(g,'a');
 g.fans.forEach(f=>{f.hp=f.max=100;f.favorite='Jazz';f.intent='solo';});
 return {g,id:g.cards[0].id};
}
function give(g,id){for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(x=>x!==id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(id);g.energy=3;}
function use(g,id,target='f0',opts={}){give(g,id);const copy=structuredClone(g),preview=previewCard(g,id,target,opts),r=playCard(g,id,target,opts);assert(r.ok,r.message);assert.deepEqual(g,preview.game);assert.notDeepEqual(g,copy);assert.deepEqual(restoreBandLive(g),g);return r;}
function finish(world){const g=world.performance.bandLive.game;while(!['won','lost'].includes(g.phase)){if(g.phase==='choose')chooseSong(g,availableSongs(g)[0].id);else endTurn(g);commitBandLiveConcert(world,completePerformance);}return g;}
test('each instrument keeps five starter cards and exactly three special choices',()=>{
 for(const instrument of Object.keys(INSTRUMENTS)){const p=createWorld(2,2).people[0];p.instrument=instrument;assert.deepEqual(musicianDeck(p),starterDeck());assert.equal(specialChoices(instrument).length,3);assert(specialChoices(instrument).every(c=>c.name&&c.description));}
});
test('instrument changes retain independent personal decks and export/import preserves all of them',()=>{
 const w=createWorld(2,2),p=w.people[0];p.instrument='guitar';changeBandLiveInstrument(p,'keys');p.bandLiveDecks.keys[0]='new2';changeBandLiveInstrument(p,'guitar');p.bandLiveDecks.guitar[1]='new1';changeBandLiveInstrument(p,'keys');assert.deepEqual(musicianDeck(p),['new2','note','note','special','special']);assert.equal(p.bandLiveDecks.guitar[1],'new1');assert.deepEqual(restore(JSON.parse(JSON.stringify(w))),w);assert.equal(w.people[1].bandLiveDecks,undefined);
 const bad=structuredClone(w);bad.people[0].bandLiveDecks.keys=['unknown'];assert.throws(()=>restore(bad));
});
test('new shows bring only the active instrument deck and replays retain the original snapshot',()=>{
 const {world}=preparedConcert();world.people[0].bandLiveDecks={guitar:['new1','new2','note','special','special'],keys:['new2','new2','note','special','special']};const {game}=beginBandLiveConcert(world);assert.deepEqual(game.cards.filter(c=>c.actorId===world.people[0].id).map(c=>c.kind),world.people[0].bandLiveDecks.guitar);world.people[0].bandLiveDecks.guitar[0]='special';const replay=createConcertReplay(game);assert.equal(replay.cards.find(c=>c.actorId===world.people[0].id).kind,'new1');assert.deepEqual(restoreBandLive(game),game);
});
test('Riff and Montée require the previous card from another musician in the same turn',()=>{
 for(const instrument of ['guitar','drums']){const {g,id}=fixture(instrument);const other=g.cards.find(c=>c.actorId!==g.cards[0].actorId&&c.kind==='note');use(g,other.id,'f8');const r=use(g,id);if(instrument==='guitar')assert.equal(r.event.hits[0].power,8);else assert.equal(g.tempo,5);endTurn(g);g.fans.forEach(f=>f.intent='bored');use(g,id);if(instrument==='guitar')assert.equal(g.events.findLast(e=>e.type==='card').hits[0].power,5);else assert.equal(g.tempo,8);}
});
test('direct conquest rewards ignore chain conquests and grant once per card',()=>{
 const {g,id}=fixture('percussion','new2');g.fans[0].hp=4;g.fans[0].effect='shock';g.fans[1].hp=3;g.fans[1].effect='wave';give(g,id);const hand=g.hand.length;use(g,id);assert.equal(g.hand.length,hand);assert.equal(g.tempo,1);assert(g.fans[1].conquered);
 const other=fixture('voice','new2');other.g.fans.slice(0,5).forEach(f=>{f.hp=4;f.effect='spotlight';});use(other.g,other.id);assert.equal(other.g.tempo,3);
 const solo=fixture('guitar','new2');solo.g.fans[0].hp=12;solo.g.fans[0].intent='bored';give(solo.g,solo.id);const n=solo.g.hand.length;use(solo.g,solo.id);assert.equal(solo.g.hand.length,n);
});
test('Ligne porteuse draws and prepares the next power card; Contretemps also produces tempo',()=>{
 const {g,id}=fixture('bass');give(g,id);const n=g.hand.length;use(g,id);assert.equal(g.hand.length,n);assert.equal(g.boost,3);const note=g.cards.find(c=>c.kind==='note');assert.equal(use(g,note.id).event.hits[0].power,9);assert.equal(g.boost,0);
 const c=fixture('drums','new2');assert.equal(use(c.g,c.id).event.hits[0].power,4);assert.equal(c.g.tempo,2);
});
test('row effects respect geometry; turn style and boredom prevention expire after end turn',()=>{
 const bass=fixture('bass','new2');bass.g.fans.forEach(f=>{f.hp=50;f.intent='bored';});use(bass.g,bass.id,'f4');assert.deepEqual(bass.g.fans.slice(4,8).map(f=>f.hp),[47,47,47,47]);endTurn(bass.g);assert.deepEqual(bass.g.fans.slice(4,8).map(f=>f.hp),[47,47,47,47]);assert.equal(bass.g.fans[0].hp,53);assert(bass.g.fans.every(f=>!f.noBoredom));
 const voice=fixture('voice');use(voice.g,voice.id,'f4');assert.equal(voice.g.fans.filter(f=>f.turnStyle==='Punk').length,4);voice.g.fans[4].chorusStyle='Punk';endTurn(voice.g);assert(voice.g.fans.every(f=>!f.turnStyle));assert.equal(voice.g.fans[4].chorusStyle,'Punk');
});
test('Accord ouvert does not wrap rows and Percée cuivrée skips conquered spectators',()=>{
 const keys=fixture('keys');assert.deepEqual(use(keys.g,keys.id,'f3').event.hits.map(h=>[h.id,h.power]),[['f3',4],['f2',2]]);
 const horn=fixture('trumpet','new2');horn.g.fans[4].hp=0;horn.g.fans[4].conquered=true;assert.deepEqual(use(horn.g,horn.id).event.hits.map(h=>[h.id,h.power]),[['f0',8],['f8',4]]);
 const accent=fixture('trumpet');accent.g.fans[1].hp=0;accent.g.fans[1].conquered=true;assert.equal(use(accent.g,accent.id).event.hits[0].power,8);
});
test('Variation requires a different discard, is bounded per copy per turn and survives reload',()=>{
 const {g,id}=fixture('keys','new2');give(g,id);const before=structuredClone(g);assert(!playCard(g,id,'audience',{discardId:id}).ok);assert.deepEqual(g,before);const discardId=g.hand.find(x=>x!==id);use(g,id,'audience',{discardId});give(g,id);assert(!canPlay(g,id));assert(!canPlay(restoreBandLive(g),id));endTurn(g);give(g,id);assert(canPlay(g,id));
});
test('sax threshold does not spend tempo; duo requires two distinct targets and consumes at most four',()=>{
 const phrase=fixture('sax');phrase.g.tempo=4;assert.equal(use(phrase.g,phrase.id).event.hits[0].power,8);assert.equal(phrase.g.tempo,4);
 const {g,id}=fixture('sax','new2');g.tempo=6;give(g,id);const before=structuredClone(g);assert(!playCard(g,id,'f0',{secondTargetId:'f0'}).ok);assert.deepEqual(g,before);assert.deepEqual(use(g,id,'f0',{secondTargetId:'f5'}).event.hits.map(h=>[h.id,h.power]),[['f0',7],['f5',7]]);assert.equal(g.tempo,2);
});
test('Double frappe applies preparation, style and spotlight bonuses once across both strikes',()=>{
 const {g,id}=fixture('percussion');g.boost=3;g.fans[0].favorite='Punk';g.fans[0].spotlight=true;const r=use(g,id);assert.equal(r.event.hits.length,2);assert.equal(r.event.hits.reduce((n,h)=>n+h.power,0),13);assert.equal(g.fans[0].hp,87);assert.equal(g.boost,0);
});
test('a completed losing show offers exactly one exchange across reload, preserving deck size and replay',()=>{
 const {world}=preparedConcert();beginBandLiveConcert(world);assert(!exchangeBandLiveCard(world,{actorId:world.people[0].id,slot:0,kind:'new1'}).ok);const g=finish(world),w=restore(JSON.parse(JSON.stringify(world))),actor=g.actors[0],before=structuredClone(g);assert.equal(w.performance.bandLive.reward.status,'pending');assert(exchangeBandLiveCard(w,{actorId:actor.id,slot:0,kind:'new1'}).ok);assert.equal(musicianDeck(w.people.find(p=>p.id===actor.id),actor.instrument)[0],'new1');assert.equal(w.performance.bandLive.game.cards[0].kind,'note');assert.deepEqual(w.performance.bandLive.game,before);assert.equal(w.showHistory[0].bandLiveReward.status,'claimed');assert.deepEqual(restore(w),w);assert(!exchangeBandLiveCard(w,{actorId:actor.id,slot:1,kind:'new2'}).ok);assert(!skipBandLiveExchange(w));assert.equal(createConcertReplay(w.performance.bandLive.game).cards[0].kind,'note');
});
test('exchange uses the played instrument even after a change, rejects outsiders and can be skipped',()=>{
 const {world}=preparedConcert();const {game}=beginBandLiveConcert(world);finish(world);const actor=game.actors[0],p=world.people.find(p=>p.id===actor.id);changeBandLiveInstrument(p,'keys');assert(!exchangeBandLiveCard(world,{actorId:world.people.at(-1).id,slot:0,kind:'new1'}).ok);assert(exchangeBandLiveCard(world,{actorId:p.id,slot:0,kind:'new2'}).ok);assert.equal(p.bandLiveDecks[actor.instrument][0],'new2');assert.deepEqual(p.bandLiveDecks.keys,starterDeck());
 const other=preparedConcert().world;beginBandLiveConcert(other);finish(other);assert(skipBandLiveExchange(other));assert(!exchangeBandLiveCard(other,{actorId:other.people[0].id,slot:0,kind:'new1'}).ok);restore(other);
});

test('boredom prevention also lasts through the finale and a won show grants one exchange',()=>{
 const {g,id}=fixture('bass','new2');endTurn(g);endTurn(g);g.fans.forEach(f=>{f.hp=50;f.intent='bored';});use(g,id,'f4');endTurn(g);assert.equal(g.phase,'choose');assert.equal(g.fans[4].hp,44);assert.equal(g.fans[0].hp,50);assert(g.fans.every(f=>!f.noBoredom));restoreBandLive(g);
 const {world}=preparedConcert();const {game}=beginBandLiveConcert(world);chooseSong(game,'song-1');game.fans.forEach(f=>f.hp=1);const card=game.cards.find(c=>c.instrument==='sax'&&c.kind==='special');give(game,card.id);game.tempo=4;playCard(game,card.id,'audience');assert.equal(game.phase,'won');commitBandLiveConcert(world,completePerformance);const a=game.actors[0];assert(exchangeBandLiveCard(world,{actorId:a.id,slot:0,kind:'new1'}).ok);assert(!exchangeBandLiveCard(world,{actorId:a.id,slot:1,kind:'new2'}).ok);restore(world);
});
