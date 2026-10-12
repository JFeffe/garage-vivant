import {songTurns} from './song-rules.mjs?v=0.7.13';
// BandLive keeps its own RNG and decks. Concert outcomes are connected separately.
export const RULES = Object.freeze({minMembers:2,maxMembers:6,minAudience:3,maxAudience:12,energy:3,hand:5,turns:6,songTurns:3,tempoMax:10,finale:3,boredom:3,styleBonus:2,soloBonus:3});
export const STYLES = Object.freeze(['Indie','Punk','Folk','Métal','Jazz','Électro','Ska','Pop']);
export const INSTRUMENTS = Object.freeze({guitar:'Guitare',drums:'Batterie',bass:'Basse',voice:'Chant',keys:'Clavier',sax:'Saxophone',trumpet:'Trompette',percussion:'Percussions'});
export const SPECIALS = Object.freeze(Object.fromEntries(Object.entries({
  guitar:{name:'Solo',cost:2,target:'single',power:8,useTempo:true,solo:true,description:'8 puissance + tout le tempo sur un spectateur. Consomme le tempo.'},
  drums:{name:'Pulsation',cost:1,target:'audience',tempo:4,description:'+4 tempo.'},
  bass:{name:'Soutien',cost:0,target:'audience',tempo:1,boost:3,description:'+1 tempo. +3 puissance à la prochaine carte de puissance du tour.'},
  voice:{name:'Refrain',cost:2,target:'audience',power:5,description:'5 puissance sur tous les spectateurs.'},
  keys:{name:'Accord',cost:1,target:'audience',power:2,tempo:2,description:'+2 tempo. 2 puissance sur tous les spectateurs.'},
  sax:{name:'Improvisation',cost:1,target:'audience',power:0,useTempo:true,description:'Tout le tempo en puissance sur chaque spectateur. Consomme le tempo.'},
  trumpet:{name:'Fanfare',cost:0,target:'audience',tempo:2,description:'+2 tempo.'},
  percussion:{name:'Roulement',cost:1,target:'audience',tempo:1,boost:5,description:'+1 tempo. +5 puissance à la prochaine carte de puissance du tour.'},
}).map(([key,value])=>[key,Object.freeze(value)])));
export const NOTE = Object.freeze({name:'Note',cost:1,target:'single',power:6,description:'6 puissance sur un spectateur.'});

function random(game) {
  game.rng=(Math.imul(1664525,game.rng)+1013904223)>>>0;
  return game.rng/4294967296;
}
function shuffle(game,items) {
  for(let i=items.length-1;i>0;i--){const j=Math.floor(random(game)*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return items;
}
function log(game,message){game.logs.push(message);}
export function cardDefinition(card){return card.kind==='note'?NOTE:SPECIALS[card.instrument];}
export function cardById(game,id){return game.cards.find(card=>card.id===id);}

const AUDIENCE=[
  ['Lou',24,'#c798ac','hair'],['Pat',20,'#d6b15a','glasses'],['Kim',25,'#78a89b','cap'],
  ['Max',24,'#a88dc6','cap'],['Sacha',20,'#d18e71','hair'],['Nico',25,'#88a6ce','glasses'],
  ['Charlie',24,'#b5b477','hair'],['Alex',20,'#c78296','cap'],['Jo',25,'#86b6a0','glasses'],
  ['Mika',24,'#cda763','glasses'],['Cam',20,'#aa91b7','hair'],['Jules',25,'#7ba6af','cap'],
];
function createAudience(songs,count,rules=null){
  const styles=rules?.styles||[...new Set(songs.map(song=>song.style))];
  return AUDIENCE.slice(0,count).map(([name,base,color,accessory],i)=>({
    id:`f${i}`,name,max:Math.round(base*(rules?.resistancePercent||100)/100),hp:Math.round(base*(rules?.resistancePercent||100)/100),favorite:rules?styles[i%styles.length]:i<3?(songs[i===0?0:1]||songs[0]).style:styles[(i-3)%styles.length],
    color,identity:{accessory},intent:i%2?'solo':'bored',
  }));
}

export function createBandLive(options) { return createGame(options,RULES.maxMembers); }
function createGame({people,groupId=null,groupName='Le band du quartier',songs,seed=2040,audienceSize=RULES.minAudience,audienceRules=null,songOrder=null},memberLimit) {
  if(!Array.isArray(people)||people.length<RULES.minMembers||people.length>memberLimit||people.some(p=>!p||typeof p.id!=='string'||!p.id||typeof p.name!=='string'||!SPECIALS[p.instrument])||new Set(people.map(p=>p.id)).size!==people.length)throw Error('Choisis de deux à six musiciens du groupe.');
  if(!Array.isArray(songs)||!songs.length||new Set(songs.map(s=>s.id)).size!==songs.length||songs.some(s=>!s||!s.id||!s.title||!s.style||s.turns!==undefined&&![3,4,5].includes(s.turns)))throw Error('Choisis une chanson du répertoire.');
  if(groupId!==null&&(typeof groupId!=='string'||!groupId))throw Error('Groupe invalide.');
  if(!Number.isInteger(audienceSize)||audienceSize<RULES.minAudience||audienceSize>RULES.maxAudience)throw Error('Choisis de trois à douze spectateurs.');
  if(audienceRules&&(!Array.isArray(audienceRules.styles)||!audienceRules.styles.length||new Set(audienceRules.styles).size!==audienceRules.styles.length||audienceRules.styles.some(s=>!STYLES.includes(s))||!Number.isInteger(audienceRules.resistancePercent)||audienceRules.resistancePercent<20||audienceRules.resistancePercent>200))throw Error('Public BandLive invalide.');
  if(songOrder&&(!Array.isArray(songOrder)||songOrder.length!==2||songOrder.some(id=>!songs.some(s=>s.id===id))))throw Error('La setlist BandLive doit prévoir deux passages.');
  const actors=people.map(p=>({id:p.id,name:p.name,instrument:p.instrument,genre:p.genre,color:p.color,identity:structuredClone(p.identity||{}),personality:structuredClone(p.personality||{}),skill:p.skills?.[p.instrument]??p.skill??0,needs:structuredClone(p.needs||{}),exaltation:p.exaltation??p.emotions?.exaltation??0,distress:p.distress??p.emotions?.distress??0}));
  const cards=actors.flatMap(actor=>Array.from({length:5},(_,i)=>({id:`${actor.id}:${i}`,actorId:actor.id,instrument:actor.instrument,kind:i<3?'note':'special'})));
  const game={version:songs.some(s=>s.turns!==undefined)?4:audienceRules||songOrder?3:2,seed:seed>>>0,rng:seed>>>0,groupId,groupName,actors,cards,songs:structuredClone(songs),usedSongs:[],songId:null,phase:'choose',turn:0,section:0,energy:3,tempo:0,boost:0,hand:[],deck:cards.map(c=>c.id),discard:[],played:0,logs:['Le band prend la scène. Choisis la première chanson.'],events:[],fans:createAudience(songs,audienceSize,audienceRules)};
  if(game.version>=3){game.audienceRules=structuredClone(audienceRules);game.songOrder=songOrder&&[...songOrder];}
  shuffle(game,game.deck);
  // Preserve ENCORE's varied opening hand, without looping for a two-person band.
  if(actors.length>=3)for(let tries=0;tries<100&&new Set(game.deck.slice(-5).map(id=>cardById(game,id).actorId)).size<3;tries++)shuffle(game,game.deck);
  return game;
}
export const passageTurns=game=>game.version>=4?songTurns(currentSong(game)):RULES.songTurns;
export function totalTurns(game){
  if(game.version<4)return RULES.turns;
  const ids=game.songOrder||game.usedSongs,used=ids.reduce((n,id)=>n+songTurns(game.songs.find(s=>s.id===id)),0);
  const remaining=2-ids.length;
  if(!remaining)return used;
  const lengths=availableSongs(game).map(songTurns).sort((a,b)=>b-a);
  return used+(game.songs.length===1?remaining*lengths[0]:lengths.slice(0,remaining).reduce((n,x)=>n+x,0));
}
export const sectionName=game=>game.section===passageTurns(game)?'Finale':game.section===1?'Couplet':`Refrain ${game.section-1}`;
export function currentSong(game){return game.songs.find(song=>song.id===game.songId);}
export function availableSongs(game){return game.songs.filter(song=>game.songOrder?song.id===game.songOrder[game.usedSongs.length]:game.songs.length===1||!game.usedSongs.includes(song.id));}
function draw(game,count) {
  for(let i=0;i<count;i++){
    if(!game.deck.length)game.deck=shuffle(game,game.discard.splice(0));
    if(game.deck.length)game.hand.push(game.deck.pop());
  }
}
function startTurn(game) {
  game.phase='play';game.turn++;game.section++;game.energy=RULES.energy;game.boost=0;
  game.fans.forEach((fan,i)=>fan.intent=(game.turn+i)%2?'bored':'solo');
  draw(game,RULES.hand);
  log(game,`Tour ${game.turn} · ${currentSong(game).title} · ${sectionName(game)}.`);
}
export function chooseSong(game,id) {
  if(game.phase!=='choose'||!availableSongs(game).some(song=>song.id===id))return {ok:false,message:'Cette chanson ne peut pas être choisie.'};
  game.songId=id;game.usedSongs.push(id);game.section=0;
  if(game.turn)game.tempo=Math.max(0,game.tempo-2);
  startTurn(game);
  return {ok:true};
}
export function canPlay(game,id) {
  const card=cardById(game,id);
  return !!card&&game.phase==='play'&&game.hand.includes(id)&&game.energy>=cardDefinition(card).cost;
}
export function powerAgainst(game,card,fan) {
  const definition=cardDefinition(card);
  if(!Object.hasOwn(definition,'power'))return 0;
  return definition.power+(definition.useTempo?game.tempo:0)+game.boost+(fan.favorite===currentSong(game)?.style?RULES.styleBonus:0)+(definition.solo&&fan.intent==='solo'?RULES.soloBonus:0);
}
function conquer(game,fan) {
  if(fan.hp===0&&!fan.conquered){fan.conquered=true;log(game,`${fan.name} est conquis !`);}
}
function checkVictory(game) {
  if(game.fans.every(fan=>fan.hp===0)){game.phase='won';log(game,'Tout le public est conquis. Show réussi !');return true;}
  return false;
}
export function playCard(game,id,targetId=null) {
  if(!canPlay(game,id))return {ok:false,message:'Cette carte ne peut pas être jouée : vérifie ta main et ton énergie.'};
  const card=cardById(game,id),definition=cardDefinition(card),fan=game.fans.find(f=>f.id===targetId);
  if(definition.target==='single'&&(!fan||fan.hp===0))return {ok:false,message:'Dépose cette carte sur un spectateur encore à conquérir.'};
  const powerCard=Object.hasOwn(definition,'power'),targets=powerCard?(definition.target==='single'?[fan]:game.fans.filter(f=>f.hp>0)):[];
  // Snapshot power before consuming tempo or the next-card bonus. Zero-power
  // Improvisation still is a power card and consumes those resources.
  const hits=targets.map(f=>({id:f.id,before:f.hp,power:powerAgainst(game,card,f)}));
  game.energy-=definition.cost;game.hand.splice(game.hand.indexOf(id),1);game.discard.push(id);game.played++;
  for(const hit of hits){const f=game.fans.find(f=>f.id===hit.id);f.hp=Math.max(0,f.hp-hit.power);hit.after=f.hp;hit.gain=hit.before-hit.after;conquer(game,f);}
  if(powerCard){game.boost=0;if(definition.useTempo)game.tempo=0;}
  if(definition.tempo)game.tempo=Math.min(RULES.tempoMax,game.tempo+definition.tempo);
  if(definition.boost)game.boost+=definition.boost;
  const event={id:game.events.length+1,type:'card',turn:game.turn,cardId:id,actorId:card.actorId,name:definition.name,hits,tempo:game.tempo,boost:game.boost};
  game.events.push(event);log(game,`${definition.name} · ${INSTRUMENTS[card.instrument]}${hits.length?' : '+hits.map(h=>`${game.fans.find(f=>f.id===h.id).name} −${h.power}`).join(', '):''}.`);
  checkVictory(game);
  return {ok:true,event};
}
export function endTurn(game) {
  if(game.phase!=='play')return {ok:false,message:'Le tour est déjà terminé.'};
  game.discard.push(...game.hand.splice(0));game.boost=0;
  if(game.section===passageTurns(game)){
    const hits=game.fans.filter(f=>f.hp>0).map(f=>{const before=f.hp;f.hp=Math.max(0,f.hp-RULES.finale);conquer(game,f);return {id:f.id,before,after:f.hp,gain:before-f.hp,power:RULES.finale};});
    game.events.push({id:game.events.length+1,type:'finale',turn:game.turn,hits});
    log(game,'Finale : 3 puissance sur tout le public.');
    if(checkVictory(game))return {ok:true};
  }
  for(const fan of game.fans)if(fan.hp>0&&fan.intent==='bored'){fan.hp=Math.min(fan.max,fan.hp+RULES.boredom);log(game,`${fan.name} s’ennuie : +3 à sa barre.`);}
  if(game.usedSongs.length===2&&game.section===passageTurns(game)){game.phase='lost';log(game,'Fin du show. Il reste du public à conquérir.');}
  else if(game.section===passageTurns(game)){game.phase='choose';log(game,'Choisis la chanson du deuxième passage. Son départ retire 2 tempo.');}
  else startTurn(game);
  return {ok:true};
}

export function restoreBandLive(input) {
  const fail=()=>{throw Error('Répétition BandLive invalide.');};
  if(!input||![1,2,3,4].includes(input.version)||!['choose','play','won','lost'].includes(input.phase)||!Array.isArray(input.actors)||!Array.isArray(input.songs))fail();
  const game=structuredClone(input);
  const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
  if(game.actors.some(a=>!a||!object(a.identity)||!object(a.personality)||!object(a.needs)||!Number.isFinite(a.skill)||typeof a.genre!=='string'||typeof a.color!=='string'))fail();
  // Older rehearsals could have more than six musicians. Keep their snapshots
  // playable without permitting oversized new formations.
  if(game.version>=2&&game.groupId!==null&&(typeof game.groupId!=='string'||!game.groupId))fail();
  if(game.version>=3&&(!Object.hasOwn(game,'audienceRules')||!Object.hasOwn(game,'songOrder')))fail();
  const expected=createGame({people:game.actors,groupId:game.groupId,groupName:game.groupName,songs:game.songs,seed:game.seed,audienceRules:game.audienceRules,songOrder:game.songOrder},game.version===1?24:RULES.maxMembers).cards;
  if(!Number.isInteger(game.seed)||game.seed<0||game.seed>4294967295||!Number.isInteger(game.rng)||game.rng<0||game.rng>4294967295||typeof game.groupName!=='string'||!Number.isInteger(game.played)||game.played<0||game.played>50)fail();
  if(!Number.isInteger(game.turn)||game.turn<0||game.turn>(game.version>=4?10:6)||!Number.isInteger(game.section)||game.section<0||game.section>(game.version>=4?5:3))fail();
  if(!Number.isInteger(game.energy)||game.energy<0||game.energy>3||!Number.isInteger(game.tempo)||game.tempo<0||game.tempo>10||!Number.isInteger(game.boost)||game.boost<0||game.boost>500)fail();
  if(!Array.isArray(game.cards)||JSON.stringify(game.cards)!==JSON.stringify(expected)||!Array.isArray(game.deck)||!Array.isArray(game.hand)||!Array.isArray(game.discard)||game.hand.length>5)fail();
  const all=[...game.deck,...game.hand,...game.discard],ids=new Set(expected.map(c=>c.id));
  if(all.length!==ids.size||new Set(all).size!==all.length||all.some(id=>!ids.has(id)))fail();
  if(!Array.isArray(game.usedSongs)||!game.songOrder&&game.songs.length>1&&new Set(game.usedSongs).size!==game.usedSongs.length||game.usedSongs.some((id,i)=>!game.songs.some(s=>s.id===id)||game.songOrder&&id!==game.songOrder[i])||game.usedSongs.length>2||game.songId!==null&&!game.usedSongs.includes(game.songId))fail();
  const lengths=game.usedSongs.map(id=>game.version>=4?songTurns(game.songs.find(s=>s.id===id)):3);
  if(game.songs.some(s=>s.turns!==undefined&&![3,4,5].includes(s.turns)))fail();
  if(game.turn===0&&(game.phase!=='choose'||game.section!==0||game.usedSongs.length||game.songId!==null))fail();
  if(game.turn>0&&(!lengths.length||game.songId!==game.usedSongs.at(-1)||game.section<1||game.section>lengths.at(-1)||game.turn!==lengths.slice(0,-1).reduce((n,x)=>n+x,0)+game.section))fail();
  if(game.phase==='choose'&&game.turn>0&&(lengths.length!==1||game.section!==lengths[0]))fail();
  if(game.phase==='play'&&(!currentSong(game)||game.turn<1||game.section<1)||game.phase==='lost'&&(game.usedSongs.length!==2||game.section!==lengths.at(-1)))fail();
  if(!Array.isArray(game.fans)||game.fans.length<RULES.minAudience||game.fans.length>RULES.maxAudience||new Set(game.fans.map(f=>f?.id)).size!==game.fans.length||game.fans.some(f=>!f||typeof f.id!=='string'||!f.id||typeof f.name!=='string'||!Number.isInteger(f.max)||f.max<1||f.max>1000||!Number.isInteger(f.hp)||f.hp<0||f.hp>f.max||!['bored','solo'].includes(f.intent)||!(game.audienceRules?.styles||game.songs.map(s=>s.style)).includes(f.favorite)||!!f.conquered!==(f.hp===0)))fail();
  if((game.phase==='won')!==game.fans.every(f=>f.hp===0)||!Array.isArray(game.logs)||game.logs.length>1000||game.logs.some(line=>typeof line!=='string')||!Array.isArray(game.events)||game.events.length>500)fail();
  return game;
}
