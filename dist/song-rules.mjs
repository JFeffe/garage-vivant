// A composition has a fixed length, not an experience level. Missing values
// keep legacy songs at three turns without rerolling saves or consuming RNG.
export const songTurns = song => song?.turns ?? 3;
// Presentation only: derive from the saved score, including legacy songs.
export const SONG_QUALITY_TIERS = Object.freeze([
  Object.freeze({id:'rough',label:'Bancale',min:0,max:25}),
  Object.freeze({id:'modest',label:'Modeste',min:25,max:50}),
  Object.freeze({id:'catchy',label:'Accrocheuse',min:50,max:80}),
  Object.freeze({id:'hit',label:'Hit',min:80,max:100}),
]);
export function songQualityTier(song) {
  const quality=Number.isFinite(song?.quality)?song.quality:0;
  return SONG_QUALITY_TIERS.findLast(t=>quality>=t.min)||SONG_QUALITY_TIERS[0];
}
export function songQualityHTML(song) {
  const tier=songQualityTier(song);
  return `<span class="song-quality song-quality-${tier.id}" title="Qualité de composition : ${tier.min} à ${tier.max}${tier.max===100?' inclus':' exclu'}/100. Catégorie descriptive, sans bonus BandLive.">${tier.label}</span>`;
}
export function compositionTurns(quality, random) {
  const q = Math.max(0, Math.min(100, quality)) / 100;
  const draw = random();
  return draw < .1 + .5 * q ? 5 : draw < .4 + .5 * q ? 4 : 3;
}
