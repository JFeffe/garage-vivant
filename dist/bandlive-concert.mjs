import {RULES,STYLES,createBandLive,restoreBandLive,currentSong} from './bandlive.mjs?v=0.7.15';
import {performanceResult} from './stage.mjs?v=0.7.15';

// Interactive audiences are compact. Calendar capacity and the full audience
// passed to the next band remain unchanged.
export function concertAudienceProfile(opportunity) {
  const large=opportunity.final||opportunity.crowd>12;
  const medium=!large&&['park','g2'].includes(opportunity.venue);
  const styles=[...new Set((opportunity.styles||STYLES).filter(s=>STYLES.includes(s)))];
  return {label:large?'Grande scène':medium?(opportunity.venue==='park'?'Le parc':'Le Canal'):'Le garage',audienceSize:large?12:medium?10:8,audienceRules:{resistancePercent:large?100:medium?80:65,styles:styles.length?styles:[...STYLES]}};
}

export function resolveBandLiveConcert(world) {
  const show=world.performance;
  const denied=reason=>({ready:false,reason,show});
  if(!show||show.preview||show.status!=='playing'||show.applied)return denied('Choisis un vrai spectacle prêt à commencer.');
  if(show.bandLive)return denied('Ce spectacle se joue déjà avec BandLive.');
  if(show.tick!==0||show.presentationStarted||show.songIndex>0)return denied('Choisis BandLive avant de lancer la première chanson.');
  if(show.actors.length<RULES.minMembers||show.actors.length>RULES.maxMembers)return denied('BandLive demande une formation de deux à six musiciens.');
  const booking=world.bookings.find(b=>b.performanceId===show.id&&b.status==='playing');
  const group=world.groups.find(g=>g.id===show.groupId&&g.archivedAt===null);
  if(!booking||!group||world.showEventId!==show.opportunityId)return denied('Ce spectacle ne correspond plus à un engagement actif.');
  const setlist=booking.setlist||[booking.songId];
  if(show.groupId!==booking.groupId||show.opportunityId!==booking.opportunityId||JSON.stringify(show.setlist||[show.song.id])!==JSON.stringify(setlist)||show.song.id!==setlist[0])return denied('La prestation ne correspond plus à la setlist réservée.');
  if(!setlist.length||setlist.length>2||setlist.includes(null))return denied('Prévois une ou deux compositions pour BandLive. Les jams et les setlists plus longues se jouent en spectacle classique.');
  const sourceSongs=[...new Set(setlist)].map(id=>world.songs.find(s=>s.id===id&&s.ownerGroupId===group.id&&group.repertoire.some(r=>r.songId===id&&r.active!==false)));
  if(sourceSongs.some(s=>!s)||show.actors.some(a=>!world.people.some(p=>p.id===a.id)))return denied('Le répertoire ou les musiciens de cette réservation ne sont plus disponibles.');
  const songs=sourceSongs.map(s=>({id:`song-${s.id}`,sourceSongId:s.id,title:s.title,style:s.genre,quality:s.quality,...(s.turns!==undefined?{turns:s.turns}:{}),intensity:s.intensity||0,emotion:s.emotion,tone:s.tone,mastery:group.repertoire.find(r=>r.songId===s.id).mastery,authors:[...s.authors],authorNames:s.authors.map(id=>s.authorNames?.[id]||world.people.find(p=>p.id===id)?.name||id)}));
  const people=show.actors.map(a=>({...structuredClone(world.people.find(p=>p.id===a.id)),...structuredClone(a),genre:world.people.find(p=>p.id===a.id).genre,skills:{[a.instrument]:a.skill},needs:{...world.people.find(p=>p.id===a.id).needs,energy:a.energy}}));
  return {ready:true,reason:'',show,booking,group,songs,people,profile:concertAudienceProfile(show.sourceOpportunity),songOrder:(setlist.length===1?[setlist[0],setlist[0]]:setlist).map(id=>`song-${id}`)};
}

export function beginBandLiveConcert(world) {
  const plan=resolveBandLiveConcert(world);
  if(!plan.ready)return {ok:false,message:plan.reason};
  const game=createBandLive({people:plan.people,groupId:plan.group.id,groupName:plan.show.groupName,songs:plan.songs,seed:plan.show.seed,songOrder:plan.songOrder,...plan.profile});
  // Preserve the welcome carried from the preceding band in this evening.
  for(const [i,fan] of game.fans.entries()){const prior=plan.show.fans[Math.floor(i*plan.show.fans.length/game.fans.length)];fan.hp=Math.max(1,Math.round(fan.max*(1-prior.meter/100)));}
  plan.show.bandLive={version:1,performanceId:plan.show.id,bookingId:plan.booking.id,profile:plan.profile,game,songResults:[],originalFans:structuredClone(plan.show.fans)};
  plan.show.presentationStarted=true;
  return {ok:true,game};
}

function audienceForResult(show,game) {
  return game.fans.map((fan,i)=>({...show.bandLive.originalFans[i],name:fan.name,color:fan.color,style:fan.favorite,meter:(1-fan.hp/fan.max)*100,reacted:fan.hp===0,reactedAt:fan.hp===0?show.totalTicks:null}));
}
function songResult(show,game) {
  const song=currentSong(game);
  const projection={...show,fans:audienceForResult(show,game),mastery:song.mastery,song:{...show.song,quality:song.quality}};
  return {id:song.sourceSongId,title:song.title,...performanceResult(projection)};
}

// Record each musical passage and deliver one normal performance to the
// existing consequence function. Repeated calls and reloads grant nothing twice.
export function commitBandLiveConcert(world,applyConsequences) {
  const show=world.performance,live=show?.bandLive;
  if(!live||show.preview||live.performanceId!==show.id||show.applied)return false;
  const game=live.game,finished=['won','lost'].includes(game.phase);
  if(game.turn>0&&(finished||game.phase==='choose')&&live.songResults.length<game.usedSongs.length)live.songResults.push(songResult(show,game));
  if(!finished)return false;
  for(const actor of show.actors){
    actor.energyLoss=show.intention==='wild'?game.events.filter(e=>e.type==='card'&&e.actorId===actor.id).length*1.5:0;
    actor.energy=Math.max(0,actor.startingEnergy-actor.energyLoss);
    // Acknowledge the completed presentation for compatibility with classic
    // saves; actual BandLive cards remain in live.game.events. No classic cast.
    actor.played=[...actor.hand];
  }
  const last=currentSong(game);
  Object.assign(show,{status:'finished',tick:show.totalTicks||3600,nextCue:show.cues.length,genre:last.style,mastery:last.mastery,song:{id:last.sourceSongId,title:last.title,quality:last.quality,intensity:last.intensity||0,emotion:last.emotion,tone:last.tone},songIndex:game.usedSongs.length-1,fans:audienceForResult(show,game),songResults:structuredClone(live.songResults),impacts:[],zones:[]});
  show.result=performanceResult(show);
  if(show.songResults.length>1){const xs=show.songResults;for(const key of ['quality','interpretation'])show.result[key]=Math.round(xs.reduce((n,r)=>n+r[key],0)/xs.length);for(const key of ['errors','combos'])show.result[key]=xs.reduce((n,r)=>n+r[key],0);}
  show.events=[{id:1,tick:show.tick,type:'final',text:`BandLive · ${show.result.conquered}/${show.result.total} spectateurs conquis · accueil ${show.result.score}/100.`}];
  const applied=applyConsequences(world),record=world.showHistory.find(r=>r.id===show.id);
  if(applied&&record){record.mode='bandlive';record.outcome=game.phase;record.turns=game.turn;record.musicianEffects=game.actors.map(a=>({id:a.id,name:a.name,energyBefore:a.needs.energy,energyAfter:world.people.find(p=>p.id===a.id)?.needs.energy??a.needs.energy}));record.trace=structuredClone(show);}
  return applied;
}

export function followingConcertPerformance(show) {
  if(!show?.bandLive)return show;
  const game=show.bandLive.game;
  return {...show,fans:show.bandLive.originalFans.map((f,i)=>{const fan=game.fans[Math.floor(i*game.fans.length/show.bandLive.originalFans.length)];return {...f,meter:(1-fan.hp/fan.max)*100};})};
}

export function createConcertReplay(snapshot) {
  const game=restoreBandLive(snapshot);
  return createBandLive({people:game.actors,groupId:game.groupId,groupName:game.groupName,songs:game.songs,seed:game.seed,audienceSize:game.fans.length,audienceRules:game.audienceRules,songOrder:game.songOrder,conquestEffects:game.conquestVersion===1});
}
