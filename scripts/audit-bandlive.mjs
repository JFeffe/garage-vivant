import {writeFile} from 'node:fs/promises';
import {createWorld} from '../dist/engine.mjs';
import {createBandLive,cardById,cardDefinition,powerAgainst,canPlay,playCard,chooseSong,availableSongs,endTurn} from '../dist/bandlive.mjs';
import {concertAudienceProfile} from '../dist/bandlive-concert.mjs';

// A reproducible, short-sighted player, not an optimal solver or a human win rate.
export function chooseAuditMove(game) {
  let best=null;
  const alive=game.fans.filter(f=>f.hp>0),sax=game.actors.some(a=>a.instrument==='sax'),guitar=game.actors.some(a=>a.instrument==='guitar');
  for(const id of game.hand){
    if(!canPlay(game,id))continue;
    const card=cardById(game,id),d=cardDefinition(card),targets=d.target==='single'?alive:[null];
    const later=game.hand.filter(x=>x!==id&&cardDefinition(cardById(game,x)).cost<=game.energy-d.cost).map(x=>cardDefinition(cardById(game,x))).filter(x=>Object.hasOwn(x,'power'));
    const nextTargets=later.some(x=>x.target==='audience')?alive.length:later.length?1:0;
    for(const target of targets){
      const hit=Object.hasOwn(d,'power')?(target?[target]:alive):[];
      const gain=hit.reduce((n,f)=>n+Math.min(f.hp,powerAgainst(game,card,f)),0),conquered=hit.filter(f=>powerAgainst(game,card,f)>=f.hp).length;
      const tempo=Math.min(10-game.tempo,d.tempo||0)*(sax?alive.length*.55:guitar ? .7 : .05),boost=(d.boost||0)*nextTargets*.85;
      const score=(gain+conquered*3+tempo+boost)/(d.cost+.35);
      if(score>.01&&(!best||score>best.score))best={id,target:target?.id||'audience',score};
    }
  }
  return best;
}
export function playAuditGame(game) {
  let guard=0;
  while(!['won','lost'].includes(game.phase)&&guard++<100){
    if(game.phase==='choose'){chooseSong(game,availableSongs(game)[0].id);continue;}
    const action=chooseAuditMove(game);
    if(action)playCard(game,action.id,action.target);else endTurn(game);
  }
  if(guard>=100)throw Error('Unbounded BandLive audit game.');
  return game;
}

async function audit(){
  const people=createWorld(2040,8).people;
  const rosters=[['Duo guitare/basse',['guitar','bass']],['Duo clavier/sax',['keys','sax']],['Trio guitare/basse/batterie',['guitar','bass','drums']],['Quatuor chant',['guitar','bass','drums','voice']],['Quatuor sax',['guitar','bass','drums','sax']],['Quatuor collectif',['keys','voice','sax','trumpet']],['Six instruments',['guitar','bass','drums','voice','keys','sax']]];
  const venues=[{venue:'g1',crowd:12,styles:['Indie','Folk','Pop']},{venue:'park',crowd:12,styles:['Ska','Jazz','Électro']},{venue:'g1',crowd:24,final:true,styles:['Pop','Indie','Ska','Folk']}];
  const rows=[];
  for(const [roster,instruments] of rosters)for(const venue of venues)for(const compatible of [true,false]){
    const profile=concertAudienceProfile(venue),songs=(compatible?[venue.styles[0],venue.styles.at(-1)]:['Punk','Métal']).map((style,i)=>({id:'song-'+i,title:'Morceau '+(i+1),style}));
    const row={roster,instruments,scene:profile.label,audience:profile.audienceSize,resistancePercent:profile.audienceRules.resistancePercent,styles:compatible?'de la scène':'hors des styles de la scène',games:100,wins:0,conquered:0,score:0,positiveResults:0,cards:0,winningTurns:0};
    for(let seed=1;seed<=100;seed++){
      const game=createBandLive({people:instruments.map((instrument,i)=>({...people[i],instrument})),groupName:roster,songs,seed,songOrder:songs.map(s=>s.id),...profile});playAuditGame(game);
      const count=game.fans.filter(f=>f.hp===0).length,engagement=game.fans.reduce((n,f)=>n+(1-f.hp/f.max)*100,0)/game.fans.length,score=Math.round(engagement*.62+count/game.fans.length*38);
      row.wins+=game.phase==='won';row.conquered+=count;row.score+=score;row.positiveResults+=score>=(venue.final?60:30);row.cards+=game.played;if(game.phase==='won')row.winningTurns+=game.turn;
    }
    row.winPercent=row.wins;row.averageConquered=+(row.conquered/100).toFixed(2);row.averageScore=+(row.score/100).toFixed(1);row.positivePercent=row.positiveResults;row.averageCards=+(row.cards/100).toFixed(1);row.averageWinningTurn=row.wins?+(row.winningTurns/row.wins).toFixed(2):null;
    for(const k of ['conquered','score','positiveResults','cards','winningTurns'])delete row[k];rows.push(row);
  }
  const report={method:'100 deterministic seeds per combination; greedy card and target choices; six turns; fixed approved cards; venue-defined audience; no neighbourhood effects. This is a benchmark, not an optimal solver or a human win-rate estimate.',games:rows.reduce((n,r)=>n+r.games,0),rows};
  await writeFile('docs/BANDLIVE_BALANCE.json',JSON.stringify(report,null,2)+'\n');
  console.table(rows.filter(r=>r.styles==='de la scène').map(r=>({formation:r.roster,scene:r.scene,public:r.audience,victoires:r.winPercent+'%',accueil:r.averageScore,bilanPositif:r.positivePercent+'%'})));
  console.log(report.games+' prestations BandLive simulées. Rapport : docs/BANDLIVE_BALANCE.json');
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1])await audit();
