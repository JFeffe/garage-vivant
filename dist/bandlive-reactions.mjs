// Reaction RNG is independent of card draws and world simulation.
export const REACTIONS=Object.freeze({
  bored:{name:'S’ennuie',description:'En fin de tour : perd 3 conquête, sauf protection. Reste si aucune conquête ne peut être perdue.'},
  attentive:{name:'Attentif',description:'La prochaine carte de puissance qui le touche reçoit +3 puissance contre lui.'},
  distracted:{name:'Distrait',description:'La prochaine carte de puissance qui le touche reçoit −3 puissance contre lui, minimum 0.'},
  rhythm:{name:'Attend du rythme',description:'Gagner réellement 3 tempo pendant un même tour avec ce statut actif lui donne +3 conquête en fin de tour. Le tempo peut ensuite être consommé.'},
  variety:{name:'Veut de la variété',description:'Quand un deuxième musicien différent le touche avec une carte de puissance dans le même tour, cette carte reçoit +3 puissance contre lui.'},
  following:{name:'Se laisse entraîner',description:'Si un voisin immédiat est conquis avec ce statut actif pendant le tour : +3 conquête en fin de tour.'},
});
export function clearReactionProgress(fan){fan.reactionActors=[];fan.reactionTempo=0;fan.reactionNeighbor=false;}
export function rerollReaction(game,fan){
  const choices=Object.keys(REACTIONS).filter(key=>key!==fan.intent);
  game.reactionRng=(Math.imul(1664525,game.reactionRng)+1013904223)>>>0;
  fan.intent=choices[Math.floor(game.reactionRng/4294967296*choices.length)];clearReactionProgress(fan);
}
export function initializeReactions(game){
  game.reactionVersion=1;game.reactionRng=(game.seed^0x51a7c3d9)>>>0;
  game.fans.forEach(fan=>{fan.intent=null;rerollReaction(game,fan);});
}
export function reactionPower(game,fan,actorId){
  if(game.reactionVersion!==1)return 0;
  return fan.intent==='attentive'?3:fan.intent==='distracted'?-3:fan.intent==='variety'&&fan.reactionActors.some(id=>id!==actorId)?3:0;
}
export function hitReaction(game,fan,actorId){
  if(game.reactionVersion!==1)return false;
  if(['attentive','distracted'].includes(fan.intent))return true;
  if(fan.intent!=='variety')return false;
  const triggered=fan.reactionActors.some(id=>id!==actorId);
  if(!fan.reactionActors.includes(actorId))fan.reactionActors.push(actorId);
  return triggered;
}
export function reactionText(game,fan){
  if(game.reactionVersion!==1)return fan.intent==='solo'?'Attend un Solo':'S’ennuie · −3 conquête';
  const r=REACTIONS[fan.intent];
  return r.name+(fan.intent==='rhythm'?` · ${Math.min(3,fan.reactionTempo)}/3 tempo`:fan.intent==='variety'?` · ${Math.min(1,fan.reactionActors.length)}/2 musiciens`:'');
}
