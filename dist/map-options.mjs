export const MAP_OPTIONS=Object.freeze({actions:'Actions individuelles',collective:'Actions collectives',icons:'Icônes d’activité',names:'Noms',emotions:'Émotions',links:'Liens',paths:'Trajets',night:'Ambiance nocturne'});
export const MAP_DEFAULTS=Object.freeze({actions:true,collective:true,icons:true,names:true,emotions:true,links:false,paths:false,night:true});
const KEY='garage-vivant-map-options';
export function readMapOptions(storage){try{const raw=JSON.parse(storage.getItem(KEY)||'{}');return Object.fromEntries(Object.entries(MAP_DEFAULTS).map(([k,v])=>[k,typeof raw[k]==='boolean'?raw[k]:v]));}catch{return {...MAP_DEFAULTS};}}
export function saveMapOptions(storage,value){try{storage.setItem(KEY,JSON.stringify(value));}catch{}}
export function mapOptionsHTML(value){return `<details class="map-options"><summary>Affichage de la carte</summary><div>${Object.entries(MAP_OPTIONS).map(([k,label])=>`<label><input type="checkbox" data-map-option="${k}" ${value[k]?'checked':''}> ${label}</label>`).join('')}<button data-reset-map>Rétablir</button></div></details>`;}
