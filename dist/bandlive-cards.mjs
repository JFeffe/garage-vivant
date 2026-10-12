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

export const NEW_SPECIALS = Object.freeze({
  guitar:[{name:'Riff accrocheur',cost:1,target:'single',power:5,alternatePower:3,description:'5 puissance. +3 si la carte précédente de ce tour vient d’un autre musicien.'},{name:'Solo décisif',cost:2,target:'single',power:12,solo:true,drawOnConquest:1,description:'12 puissance. Pioche 1 carte si cette carte conquiert sa cible.'}],
  drums:[{name:'Montée rythmique',cost:1,target:'audience',tempo:3,alternateTempo:2,description:'+3 tempo. +2 si la carte précédente de ce tour vient d’un autre musicien.'},{name:'Contretemps',cost:1,target:'single',power:4,tempo:2,description:'4 puissance sur un spectateur. +2 tempo.'}],
  bass:[{name:'Ligne porteuse',cost:1,target:'audience',boost:3,draw:1,description:'+3 puissance à la prochaine carte de puissance de ce tour. Pioche 1 carte.'},{name:'Basse enveloppante',cost:1,target:'single',shape:'row',power:3,noBoredom:true,description:'3 puissance sur la rangée ciblée. Empêche son ennui ce tour.'}],
  voice:[{name:'Refrain fédérateur',cost:1,target:'single',shape:'row',turnStyle:true,draw:1,description:'La rangée adopte le style de la chanson ce tour. Pioche 1 carte.'},{name:'Appel au public',cost:2,target:'audience',power:4,tempoOnConquest:1,tempoCap:3,description:'4 puissance sur tout le public. +1 tempo par conquête directe, maximum +3.'}],
  keys:[{name:'Accord ouvert',cost:1,target:'single',shape:'sides',power:4,secondaryPower:2,description:'4 puissance sur une cible, 2 sur ses voisins à gauche et à droite.'},{name:'Variation',cost:0,target:'audience',discard:1,draw:1,oncePerTurn:true,description:'Défausse 1 autre carte, puis pioche 1 carte. Cet exemplaire : une fois par tour.'}],
  sax:[{name:'Phrase retenue',cost:1,target:'single',power:5,tempoThreshold:4,thresholdPower:3,description:'5 puissance. +3 à partir de 4 tempo, sans le consommer.'},{name:'Improvisation en duo',cost:2,target:'single',twoTargets:true,power:3,consumeTempo:4,description:'Choisis 2 spectateurs distincts : 3 puissance + jusqu’à 4 tempo consommé sur chacun.'}],
  trumpet:[{name:'Accent éclatant',cost:1,target:'single',power:5,conqueredNeighborPower:3,description:'5 puissance. +3 si un voisin immédiat est déjà conquis.'},{name:'Percée cuivrée',cost:2,target:'single',shape:'behind',power:8,secondaryPower:4,description:'8 puissance sur une cible, 4 sur le premier non-conquis derrière, dans sa colonne.'}],
  percussion:[{name:'Double frappe',cost:1,target:'single',power:6,strikes:2,description:'Deux frappes de 3 sur une cible. Les bonus de puissance comptent une seule fois.'},{name:'Relance',cost:1,target:'single',power:4,drawOnConquest:1,tempoOnConquest:1,tempoCap:1,description:'4 puissance. Si cette carte conquiert sa cible : pioche 1 carte et +1 tempo.'}],
});
export const CARD_KINDS=Object.freeze(['note','special','new1','new2']);
export const starterDeck=()=>['note','note','note','special','special'];
export const specialChoices=instrument=>['special','new1','new2'].map(kind=>({kind,...definitionFor(instrument,kind)}));
export function definitionFor(instrument,kind){return kind==='note'?NOTE:kind==='special'?SPECIALS[instrument]:NEW_SPECIALS[instrument]?.[kind==='new1'?0:kind==='new2'?1:-1];}
export function validateDeck(deck){if(!Array.isArray(deck)||deck.length!==5||deck.some(k=>!CARD_KINDS.includes(k)))throw Error('Deck BandLive invalide.');return deck;}
export function validatePersonDecks(person){
  if(person.bandLiveDecks===undefined)return;
  const decks=person.bandLiveDecks;
  if(!decks||typeof decks!=='object'||Array.isArray(decks)||Object.keys(decks).some(k=>!Object.hasOwn(INSTRUMENTS,k)))throw Error('Collection de decks BandLive invalide.');
  Object.values(decks).forEach(validateDeck);
}
export function musicianDeck(person,instrument=person.instrument){
  if(!Object.hasOwn(INSTRUMENTS,instrument))throw Error('Instrument BandLive invalide.');
  validatePersonDecks(person);
  return [...validateDeck(person.bandLiveDecks?.[instrument]||starterDeck())];
}
export function rememberInstrumentDeck(person,instrument=person.instrument){
  const deck=musicianDeck(person,instrument);person.bandLiveDecks??={};person.bandLiveDecks[instrument]=deck;return deck;
}
export function changeBandLiveInstrument(person,instrument){
  if(!Object.hasOwn(INSTRUMENTS,instrument))throw Error('Instrument BandLive invalide.');
  rememberInstrumentDeck(person);rememberInstrumentDeck(person,instrument);person.instrument=instrument;
}
