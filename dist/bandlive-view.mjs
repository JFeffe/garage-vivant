import {RULES,INSTRUMENTS,SPECIALS,restoreBandLive,cardById,cardDefinition,currentSong,availableSongs,chooseSong,canPlay,playCard,endTurn} from './bandlive.mjs?v=0.7.7';
import {resolveBandLivePlan,createBandLiveFromWorld} from './bandlive-roster.mjs?v=0.7.7';
import {createConcertReplay,resolveBandLiveConcert} from './bandlive-concert.mjs?v=0.7.7';
import {NEEDS,PERSONALITY} from './engine.mjs?v=0.7.7';
import {instrumentArt,drawStageBackdrop} from './show-view.mjs?v=0.7.7';
import {decorateCube,enableAudio,playSound} from './v5-view.mjs?v=0.7.7';

const STORAGE='garage-vivant-bandlive-v1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STYLE_PATHS={
  Indie:'M5 18V6l14-3v12M5 18c0 4-6 4-6 0s6-4 6 0M19 15c0 4-6 4-6 0s6-4 6 0',
  Punk:'m14 2-9 12h7l-2 8 9-12h-7z',
  Folk:'M12 3c-8 0-11 12-3 15 8 3 11-5 11-12-4 1-5-3-8-3zM7 22 17 8',
  Métal:'m3 19 3-14 6 8 6-8 3 14M5 20h14',
  Jazz:'M8 3h7v3h-4v7c0 9-9 9-9 3l5-4 3 6M15 6l3 3',
  Électro:'m2 13 5-8 5 14 5-14 5 8M3 22h18',
  Ska:'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  Pop:'m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z',
  Rock:'m14 2-9 12h7l-2 8 9-12h-7z',
};
export function styleIcon(style){return `<span class="bl-style" data-bl-style="${esc(style)}" tabindex="0" aria-label="${esc(style)}"><svg viewBox="-2 0 26 24" aria-hidden="true"><path d="${STYLE_PATHS[style]||STYLE_PATHS.Indie}"/></svg></span>`;}
function cubeHTML(actor,type){return `<canvas class="bl-cube" width="144" height="144" data-bl-cube="${esc(actor.id)}" data-bl-cube-type="${type}" aria-hidden="true"></canvas>`;}
function drawCube(canvas,actor,conquered=false){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,144,144);
  const box=(x,y,size)=>{ctx.fillStyle=actor.color||'#82a98b';ctx.beginPath();ctx.roundRect(x,y,size,size,7);ctx.fill();ctx.fillStyle='#ffffff35';ctx.fillRect(x,y,size,9);ctx.fillStyle='#223932';ctx.fillRect(x+size*.32,y+size*.32,size*.09,size*.09);ctx.fillRect(x+size*.58,y+size*.32,size*.09,size*.09);};
  if(conquered){for(let i=0;i<9;i++)box(16+i%3*38,20+Math.floor(i/3)*38,29);}
  else {box(26,35,92);decorateCube(ctx,72,127,92,actor);}
}
function actorTooltip(actor){
  const traits=Object.entries(actor.personality).map(([key,value])=>`${esc(PERSONALITY[key]||key)} ${Math.round(value)}`).join(' · '),needs=Object.entries(actor.needs).map(([key,value])=>`${esc(NEEDS[key]||key)} : ${Math.round(value)}/100`).join('<br>');
  return `<strong>${esc(actor.name)} · ${INSTRUMENTS[actor.instrument]}</strong><p>Style : ${esc(actor.genre)}<br>Maîtrise : ${Math.round(actor.skill)}/100</p><p>${needs}</p><p>3 Note · 2 ${SPECIALS[actor.instrument].name}<br>${esc(SPECIALS[actor.instrument].description)}</p>${traits?`<small>${traits}</small>`:''}`;
}
function fanTooltip(game,fan){
  return `<strong>${esc(fan.name)}${styleIcon(fan.favorite)}</strong><p>Résistance : ${fan.hp}/${fan.max}<br>Style favori : ${esc(fan.favorite)}<br>${fan.conquered?'Conquis : reste dans le public.':fan.intent==='solo'?'Attend un Solo : cette carte lui inflige +3 puissance.':'S’ennuie : récupère 3 résistance à la fin du tour.'}</p><small>Une chanson de son style ajoute +2 puissance aux cartes qui le touchent.</small>`;
}

export function createBandLiveModule({getWorld,onOpen,onReturn,onDisable,canStart,notify,getReducedEffects=()=>false,getPlan=()=>({}),onConcertStart,onConcertUpdate,onConcertCancel}) {
  const root=document.querySelector('#bandlive-view'),nav=document.querySelector('#bandlive-nav'),toggle=document.querySelector('#bandlive-enabled');
  let enabled=false,game=null,preparing=false,draft={groupId:'',memberIds:null,seed:2040,audienceSize:RULES.minAudience},selectedCard=null,activeCard=null,dragPointer=null,dragPoint=null,dragFrame=null,ghost=null,animation=null,sound=false,storageProblem=false;
  try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved){enabled=!!saved.enabled;if(saved.draft)draft=saved.draft;if(saved.game)game=restoreBandLive(saved.game);}}catch{notify('La répétition BandLive enregistrée ne peut pas être reprise. Le quartier est disponible.');}
  let rehearsalGame=game,liveId=null,lastReport=null;
  const liveShow=()=>{const s=getWorld().performance;return liveId&&s?.id===liveId&&s.bandLive&&getWorld().showEventId?s:null;};
  function syncConcert(){
    const show=getWorld().performance;
    if(show?.bandLive&&!show.preview&&getWorld().showEventId){if(!liveId)rehearsalGame=game;liveId=show.id;game=show.bandLive.game;preparing=false;}
    else if(liveId){liveId=null;game=rehearsalGame;preparing=!game;}
    nav.hidden=!enabled&&!liveId;
  }
  syncConcert();
  const tooltip=document.createElement('div');tooltip.id='bandlive-tooltip';tooltip.className='bl-tooltip';tooltip.role='tooltip';tooltip.hidden=true;document.body.append(tooltip);
  function persist(){if(liveShow()&&liveShow().bandLive.game===game)onConcertUpdate?.();else if(!liveId)rehearsalGame=game;try{localStorage.setItem(STORAGE,JSON.stringify({enabled,draft,game:liveId?rehearsalGame:game}));storageProblem=false;}catch{if(!storageProblem)notify('La répétition ne peut pas être enregistrée dans ce navigateur.');storageProblem=true;}}
  function hideTip(){tooltip.hidden=true;root.querySelectorAll('[aria-describedby="bandlive-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
  function showTip(target){
    const style=target.closest('[data-bl-style]'),actorEl=target.closest('[data-bl-actor]'),fanEl=target.closest('[data-bl-fan]');
    let html,anchor;
    if(style){html=esc(style.dataset.blStyle);anchor=style;}
    else if(actorEl&&game){html=actorTooltip(game.actors.find(a=>a.id===actorEl.dataset.blActor));anchor=actorEl;}
    else if(fanEl&&game){html=fanTooltip(game,game.fans.find(f=>f.id===fanEl.dataset.blFan));anchor=fanEl;}
    else return hideTip();
    if(activeCard||animation)return hideTip();
    tooltip.innerHTML=html;tooltip.hidden=false;anchor.setAttribute('aria-describedby',tooltip.id);
    const r=anchor.getBoundingClientRect(),w=tooltip.offsetWidth,h=tooltip.offsetHeight;
    tooltip.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';
    tooltip.style.top=(r.bottom+h+12<innerHeight?r.bottom+9:Math.max(8,r.top-h-9))+'px';
  }
  function initializeDraft(){
    return resolveBandLivePlan(getWorld(),draft,{canStart:canStart()});
  }
  function setupHTML(){
    const {groups,group,people,members,songs,ready,reason}=initializeDraft();
    const selection=groups.length?`<label>Groupe du quartier<select id="bl-group">${groups.map(g=>`<option value="${esc(g.id)}" ${g.id===draft.groupId?'selected':''}>${esc(g.name)} · ${g.members.length} membres</option>`).join('')}</select></label>`:'';
    const musicians=group?`<fieldset><legend>Musiciens · ${members.length}/${RULES.maxMembers} · au moins ${RULES.minMembers}</legend>${people.length>RULES.maxMembers?`<p class="muted">Ce groupe compte ${people.length} membres. Choisis jusqu’à six musiciens pour cette scène.</p>`:''}<div class="bl-member-picker">${people.map(p=>`<label><input type="checkbox" data-bl-member="${esc(p.id)}" ${draft.memberIds.includes(p.id)?'checked':members.length>=RULES.maxMembers?'disabled':''}><span><b>${esc(p.name)}</b><small>${INSTRUMENTS[p.instrument]} · ${esc(p.genre)}<br>${SPECIALS[p.instrument].name} · ${SPECIALS[p.instrument].cost} énergie</small></span></label>`).join('')}</div></fieldset>`:'';
    const repertoire=group?`<section class="bl-repertoire"><h3>Chansons du groupe · ${songs.length}</h3>${songs.length?`<ul>${songs.map(s=>`<li><div><b>${esc(s.title)}</b>${styleIcon(s.style)}<span>${esc(s.style)}</span></div><small>Par ${s.authorNames.map(esc).join(', ')} · maîtrise ${Math.round(s.mastery)}/100</small></li>`).join('')}</ul>${songs.length===1?'<p>Une seule chanson au répertoire : elle sera reprise au deuxième passage.</p>':'<p>Choisis ta première chanson sur scène, puis une autre pour le deuxième passage.</p>'}`:'<p>Aucune composition active dans ce répertoire.</p>'}</section>`:'';
    return `<div class="panel bl-setup"><span class="eyebrow">BANDLIVE · RÉPÉTITION</span><h2>À toi de jouer le show.</h2><p>Joue les chansons de ton groupe avec deux à six de ses musiciens. Chaque instrument apporte trois Note et deux cartes spéciales à la pioche commune.</p>${selection}${musicians}${repertoire}${reason?`<p class="bl-setup-reason" role="status">${esc(reason)}</p>`:''}${!group||!songs.length?'<button data-open-groups class="text-button">Ouvrir les groupes du quartier ↗</button>':''}<label>Spectateurs<input id="bl-audience-size" type="number" min="${RULES.minAudience}" max="${RULES.maxAudience}" step="1" value="${draft.audienceSize}"><span class="muted">3 à 12 · plus de public, plus de défi</span></label><label>Graine de la répétition<input id="bl-seed" type="number" min="0" max="4294967295" value="${draft.seed}"></label><div class="inline-actions"><button id="bl-start" class="primary" ${!ready?'disabled':''}>Prendre la scène</button>${game?'<button id="bl-resume">Reprendre la répétition en cours</button>':''}</div><p class="muted">Répétition sans récompense. Le quartier attend pendant le show.</p><details><summary>Les cartes spéciales des huit instruments</summary><div class="bl-reference">${Object.entries(SPECIALS).map(([key,c])=>`<article><b>${INSTRUMENTS[key]} · ${c.name} · ${c.cost} énergie</b><p>${esc(c.description)}</p></article>`).join('')}</div></details></div>`;
  }
  function handHTML(actor){
    const cards=game.hand.map(id=>cardById(game,id)).filter(c=>c.actorId===actor.id),step=Math.min(104,100/Math.max(1,cards.length-1));
    return `<div class="bl-hand" aria-label="Cartes de ${esc(actor.name)}">${cards.map((card,i)=>{
      const c=cardDefinition(card),power=Object.hasOwn(c,'power'),tag=power?'impact':'rhythm';
      return `<button type="button" class="bl-card ${power?'bl-power':'bl-preparation'} ${selectedCard===card.id?'bl-selected':''}" data-bl-card="${esc(card.id)}" draggable="true" style="left:${i*step}px;--bl-card-order:${i}" ${!canPlay(game,card.id)||animation?'disabled':''} aria-label="${esc(c.name)} · ${INSTRUMENTS[card.instrument]} · ${c.cost} énergie. ${esc(c.description)}" aria-pressed="${selectedCard===card.id}"><span class="bl-cost">${c.cost}</span><strong>${esc(c.name)}</strong>${instrumentArt(actor.instrument,tag)}<span class="bl-card-rule">${esc(c.description)}</span><small>${c.target==='single'?'Un spectateur':'Zone du public'}</small></button>`;
    }).join('')}${!cards.length?'<span class="bl-empty-hand">Aucune carte en main</span>':''}</div>`;
  }
  function showHTML(){
    const song=currentSong(game),won=game.phase==='won',lost=game.phase==='lost',finished=won||lost,choosing=game.phase==='choose',live=liveShow();
    const eyebrow=live?`BANDLIVE · ${esc(live.opportunityName)}`:game.songOrder?'BANDLIVE · REPLAY SANS RÉCOMPENSE':'BANDLIVE · RÉPÉTITION';
    const record=live&&getWorld().showHistory.find(r=>r.id===live.id);
    const effect=(label,key)=>{const e=record?.effects;return e?`<span><b>${Math.round(e.before[key])} → ${Math.round(e.after[key])}</b> ${label}</span>`:'';};
    const report=finished&&live?`<section class="bl-concert-result panel"><span class="eyebrow">BILAN DU SPECTACLE</span><h3>${won?'Tout le public est conquis !':'Le show est terminé.'}</h3><div class="bl-result-values"><span><b>${live.result.score}/100</b> Accueil du public</span><span><b>${live.sourceOpportunity.organizer?.exigence||30}/100</b> Attentes de la scène</span>${effect('Réputation','reputation')}${effect('Moral','morale')}${effect('Coordination','development')}</div><ul>${(record?.musicianEffects||[]).map(p=>`<li>${esc(p.name)} · énergie ${Math.round(p.energyBefore)} → ${Math.round(p.energyAfter)}</li>`).join('')}</ul><p>Le bilan dépend de l’accueil du public et des attentes de cette scène. Ce résultat compte dans la partie et reste dans l’historique du groupe.</p></section>`:'';
    const waiting=live&&getWorld().bookings.some(b=>b.opportunityId===live.opportunityId&&['booked','assembling'].includes(b.status));
    return `<div class="bl-arena"><div class="bl-hud"><div><span class="eyebrow">${eyebrow}</span><h2>${esc(game.groupName)}</h2><p>${song?`${esc(song.title)} · ${esc(song.style)} · ${['Couplet','Refrain','Finale'][game.section-1]} · passage ${game.usedSongs.length}/2`:'Les chansons du groupe. Six tours. Tout le public à conquérir.'}</p></div>${live?'':'<button id="bl-setup" class="text-button">Changer le band</button>'}<div class="bl-resources"><span><b data-bl-energy>${game.energy}/3</b> Énergie</span><span><b data-bl-tempo>${game.tempo}/10</b> Tempo</span><span><b>${game.turn}/6</b> Tour</span><span><b>${game.fans.filter(f=>f.hp===0).length}/${game.fans.length}</b> Conquis</span>${game.boost?`<span class="bl-boost"><b>+${game.boost}</b> Prochaine puissance · ce tour</span>`:''}</div></div>${choosing?`<div class="bl-song-choice"><b>${game.songOrder?(game.turn?'Deuxième passage de la setlist · −2 tempo au départ':'Setlist réservée · première chanson'):game.turn?(game.songs.length===1?'Reprise de la chanson · −2 tempo au départ':'Choisis la deuxième chanson · −2 tempo au départ'):'Choisis la première chanson'}</b>${availableSongs(game).map(s=>`<button data-bl-song="${esc(s.id)}"><strong>${esc(s.title)}</strong>${styleIcon(s.style)}<small>${esc(s.style)} · 3 tours · finale : 3 puissance sur tout le public</small></button>`).join('')}</div>`:''}<div class="bl-viewport"><div class="bl-world" style="--bl-players:${game.actors.length};--bl-min-width:${Math.max(800,game.actors.length*205)}px"><canvas class="bl-effects" aria-hidden="true"></canvas><div class="bl-musicians">${game.actors.map(actor=>`<section class="bl-musician"><div class="bl-musician-info" data-bl-actor="${esc(actor.id)}" tabindex="0" aria-label="Informations de ${esc(actor.name)}">${cubeHTML(actor,'actor')}<div class="bl-name"><b>${esc(actor.name)}</b>${styleIcon(actor.genre)}</div><small>${INSTRUMENTS[actor.instrument]}</small></div>${handHTML(actor)}</section>`).join('')}</div><div class="bl-audience-viewport" tabindex="0" role="region" aria-label="Public · défilement vertical"><div class="bl-audience" data-bl-target="audience" tabindex="0" role="group" aria-label="Zone du public. Dépose ici une carte collective ou de préparation."><span class="bl-zone-label">LE PUBLIC</span><div class="bl-fans">${game.fans.map(fan=>`<div class="bl-fan-wrap"><span class="bl-intent">${fan.hp===0?'Conquis !':fan.intent==='solo'?'Attend un Solo':'S’ennuie · +3 en fin de tour'}</span><button class="bl-fan ${fan.hp===0?'bl-conquered':''}" data-bl-fan="${fan.id}" data-bl-target="${fan.id}" aria-label="${esc(fan.name)} · ${fan.hp}/${fan.max} · ${fan.hp===0?'Conquis':fan.intent==='solo'?'Attend un Solo':'S’ennuie'}">${cubeHTML(fan,'fan')}<span class="bl-name"><b>${esc(fan.name)}</b>${styleIcon(fan.favorite)}</span><span class="bl-resistance" role="progressbar" aria-label="Résistance de ${esc(fan.name)}" aria-valuemin="0" aria-valuemax="${fan.max}" aria-valuenow="${fan.hp}"><i style="width:${fan.hp/fan.max*100}%"></i></span><span class="bl-hp">${fan.hp}/${fan.max}</span></button></div>`).join('')}</div><span class="bl-drop-hint">Cartes collectives et préparations → dépose dans cette zone</span></div></div></div></div>${report}<div class="bl-controls"><p id="bl-help" role="status">${finished?(won?'Tout le public est conquis !':'Le show est terminé. Il reste du public à conquérir.'):choosing?'Choisis une chanson pour piger ta main.':selectedCard?'Choisis un spectateur ou la zone du public.':'Glisse une carte vers le public, ou sélectionne-la puis choisis sa cible.'}</p><span class="bl-piles">Pioche ${game.deck.length} · Main ${game.hand.length} · Défausse ${game.discard.length}</span>${game.phase==='play'?`<button id="bl-end" class="primary" ${animation?'disabled':''}>Fin du tour →</button>`:''}<button id="bl-sound" aria-pressed="${sound}">Son : ${sound?'ON':'OFF'}</button>${live&&!finished?'<button id="bl-cancel" class="text-button">Interrompre le show</button>':''}${finished?`<button id="bl-return" class="primary">${waiting?'Continuer la soirée →':'Retour au quartier · continuer'}</button>${live?'':'<button id="bl-replay">Rejouer la répétition</button>'}`:''}</div><details class="bl-log"><summary>Déroulement du show · ${game.played} cartes jouées</summary><div>${game.logs.map(line=>`<p>${esc(line)}</p>`).join('')}</div></details></div>`;
  }
  function render(){
    const previousViewport=root.querySelector('.bl-viewport'),previousAudience=root.querySelector('.bl-audience-viewport');
    const scroll=previousViewport?{x:previousViewport.scrollLeft,y:previousAudience?.scrollTop||0}:null;
    hideTip();root.innerHTML=game&&!preparing?showHTML():setupHTML();
    const viewport=root.querySelector('.bl-viewport'),audience=root.querySelector('.bl-audience-viewport');
    if(viewport&&scroll){viewport.scrollLeft=scroll.x;if(audience)audience.scrollTop=scroll.y;}
    if(game&&!preparing){for(const canvas of root.querySelectorAll('[data-bl-cube]')){const actor=canvas.dataset.blCubeType==='actor'?game.actors.find(a=>a.id===canvas.dataset.blCube):game.fans.find(f=>f.id===canvas.dataset.blCube);drawCube(canvas,actor,actor.hp===0);}drawEffects();}
    if(liveShow()&&['won','lost'].includes(game.phase)&&!animation&&lastReport!==game){root.querySelector('.bl-concert-result')?.scrollIntoView({block:'start'});lastReport=game;}
  }
  function announce(message){const help=root.querySelector('#bl-help');if(help)help.textContent=message;}
  function clearDrag(){
    activeCard=null;dragPointer=null;dragPoint=null;if(dragFrame!==null)cancelAnimationFrame(dragFrame);dragFrame=null;ghost?.remove();ghost=null;root.classList.remove('bl-dragging');root.querySelectorAll('.bl-drop-active,.bl-drop-valid').forEach(el=>el.classList.remove('bl-drop-active','bl-drop-valid'));
  }
  function startDrag(id){
    if(!game||!canPlay(game,id)||animation)return false;
    activeCard=id;hideTip();root.classList.add('bl-dragging');const c=cardDefinition(cardById(game,id));
    root.querySelectorAll(c.target==='single'?'.bl-fan:not(.bl-conquered)':'.bl-audience').forEach(el=>el.classList.add('bl-drop-valid'));
    return true;
  }
  function highlightDrop(target){
    root.querySelectorAll('.bl-drop-active').forEach(el=>el.classList.remove('bl-drop-active'));
    if(!activeCard||!target)return;
    const c=cardDefinition(cardById(game,activeCard));
    if(c.target==='single'){if(target.dataset.blTarget!=='audience'&&!target.classList.contains('bl-conquered'))target.classList.add('bl-drop-active');}
    else root.querySelector('.bl-audience')?.classList.add('bl-drop-active');
  }
  function dropAtPoint(x,y){
    const target=document.elementFromPoint(x,y)?.closest('[data-bl-target]');
    return target&&root.contains(target)?target:null;
  }
  function moveDrag(x,y){
    dragPoint={x,y};highlightDrop(dropAtPoint(x,y));
    if(dragFrame!==null)return;
    let previous=performance.now();
    function scrollFrame(now){
      if(!activeCard||!dragPoint){dragFrame=null;return;}
      const viewport=root.querySelector('.bl-viewport'),audience=root.querySelector('.bl-audience-viewport');
      const r=viewport.getBoundingClientRect(),a=audience.getBoundingClientRect(),{x,y}=dragPoint;
      const left=Math.max(0,r.left),right=Math.min(innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);
      const step=Math.min(32,now-previous)*.6;previous=now;
      const velocity=(point,start,end)=>point<start+35?-Math.max(0,1-(point-start)/35):point>end-35?Math.max(0,1-(end-point)/35):0;
      if(x>=left&&x<=right&&y>=top&&y<=bottom){
        viewport.scrollLeft+=velocity(x,left,right)*step;
        const audienceTop=Math.max(top,a.top),audienceBottom=Math.min(bottom,a.bottom);
        if(y>=audienceTop&&y<=audienceBottom)audience.scrollTop+=velocity(y,audienceTop,audienceBottom)*step;
        highlightDrop(dropAtPoint(x,y));
      }
      dragFrame=requestAnimationFrame(scrollFrame);
    }
    dragFrame=requestAnimationFrame(scrollFrame);
  }
  function pointFor(selector){
    const world=root.querySelector('.bl-world').getBoundingClientRect(),el=root.querySelector(selector),r=el?.getBoundingClientRect();
    if(!r)return null;
    const clip=el.closest('.bl-audience-viewport')?.getBoundingClientRect(),centerY=r.top+r.height/2;
    if(clip&&(centerY<clip.top||centerY>clip.bottom))return null;
    return {x:r.left+r.width/2-world.left,y:centerY-world.top};
  }
  function perform(id,targetId){
    if(animation)return false;
    const card=cardById(game,id),origin=card&&pointFor(`[data-bl-actor="${CSS.escape(card.actorId)}"] .bl-cube`),r=playCard(game,id,targetId);
    clearDrag();selectedCard=null;
    if(!r.ok){announce(r.message);return false;}
    const hits=r.event.hits;
    animation={started:performance.now(),origin,hits,event:r.event,shot:false,impact:false};
    if(sound)playSound({type:'card',instrument:card.instrument});
    persist();render();requestAnimationFrame(animate);return true;
  }
  function drawEffects(){
    const canvas=root.querySelector('.bl-effects');if(!canvas)return;
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(w/900,(root.querySelector('.bl-musicians')?.offsetHeight||315)/360);drawStageBackdrop(ctx,{stageBottom:360});ctx.restore();
    if(!animation)return;
    const elapsed=(performance.now()-animation.started)/1000,reduced=getReducedEffects(),p=Math.min(1,Math.max(0,(elapsed-.12)/.22));
    for(const eventHit of animation.hits){
      const position=pointFor(`[data-bl-fan="${CSS.escape(eventHit.id)}"] .bl-cube`);
      if(!animation.origin||!position)continue;const origin=animation.origin,hit={...eventHit,...position};
      if(elapsed<.34){ctx.strokeStyle='#ecc78699';ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(hit.x,hit.y);ctx.stroke();ctx.setLineDash([]);if(!reduced){ctx.fillStyle='#fff5d7';ctx.beginPath();ctx.arc(origin.x+(hit.x-origin.x)*p,origin.y+(hit.y-origin.y)*p,5,0,Math.PI*2);ctx.fill();}}
      else{const age=elapsed-.34;ctx.strokeStyle=`rgba(236,199,134,${Math.max(0,1-age/.5)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(hit.x,hit.y,reduced?44:12+age*145,0,Math.PI*2);ctx.stroke();ctx.font='700 17px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#172e2b';ctx.strokeText(`−${hit.power}`,hit.x,hit.y-58-(reduced?0:age*25));ctx.fillStyle='#f2dfaa';ctx.fillText(`−${hit.power}`,hit.x,hit.y-58-(reduced?0:age*25));if(!reduced&&age<.18){ctx.fillStyle='#f2dfaa';ctx.fillText('BANG !',hit.x,hit.y+55);}}
    }
  }
  function animate(){
    if(!animation)return;
    const elapsed=performance.now()-animation.started;
    if(sound&&elapsed>120&&!animation.shot&&animation.hits.length){playSound({type:'shot'});animation.shot=true;}
    if(sound&&elapsed>340&&!animation.impact&&animation.hits.length){playSound({type:'impact'});animation.impact=true;}
    drawEffects();
    if(elapsed<850)requestAnimationFrame(animate);else{animation=null;render();}
  }
  root.addEventListener('dragstart',event=>{const card=event.target.closest('[data-bl-card]');if(!card||!startDrag(card.dataset.blCard))return event.preventDefault();event.dataTransfer.setData('application/x-bandlive-card',activeCard);event.dataTransfer.effectAllowed='move';});
  root.addEventListener('dragend',clearDrag);
  root.addEventListener('dragleave',event=>{if(!root.contains(event.relatedTarget)){dragPoint=null;highlightDrop(null);}});
  root.addEventListener('dragover',event=>{if(!activeCard)return;event.preventDefault();event.dataTransfer.dropEffect='move';moveDrag(event.clientX,event.clientY);});
  root.addEventListener('drop',event=>{if(!activeCard)return;event.preventDefault();const target=dropAtPoint(event.clientX,event.clientY),id=activeCard;if(target)perform(id,target.dataset.blTarget);else clearDrag();});
  root.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse')return;
    const card=event.target.closest('[data-bl-card]');if(!card||!startDrag(card.dataset.blCard))return;
    event.preventDefault();dragPointer=event.pointerId;root.setPointerCapture(event.pointerId);ghost=card.cloneNode(true);ghost.classList.add('bl-ghost');ghost.style.left=event.clientX-50+'px';ghost.style.top=event.clientY-70+'px';ghost.removeAttribute('data-bl-card');document.body.append(ghost);
  });
  root.addEventListener('pointermove',event=>{
    if(dragPointer!==event.pointerId)return;
    event.preventDefault();ghost.style.left=event.clientX-50+'px';ghost.style.top=event.clientY-70+'px';moveDrag(event.clientX,event.clientY);
  });
  root.addEventListener('pointerup',event=>{if(dragPointer!==event.pointerId)return;const id=activeCard,target=dropAtPoint(event.clientX,event.clientY);root.releasePointerCapture(event.pointerId);if(target)perform(id,target.dataset.blTarget);else clearDrag();});
  // Native HTML dragging cancels its mouse pointer. Only cancel a captured
  // touch/pen drag here; mouse dragging finishes through drop/dragend.
  root.addEventListener('pointercancel',event=>{if(dragPointer===event.pointerId)clearDrag();});
  root.addEventListener('lostpointercapture',()=>{if(dragPointer!==null)clearDrag();});
  root.addEventListener('mouseover',event=>showTip(event.target));root.addEventListener('focusin',event=>showTip(event.target));
  root.addEventListener('mouseout',event=>{if(!event.relatedTarget||!root.contains(event.relatedTarget))hideTip();});root.addEventListener('focusout',hideTip);
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){clearDrag();selectedCard=null;hideTip();render();}else if(event.key==='Enter'&&event.target.matches('.bl-audience')&&selectedCard){event.preventDefault();perform(selectedCard,'audience');}});
  root.addEventListener('click',async event=>{
    if(event.target.closest('[data-bl-style]'))return;
    const target=event.target.closest('button,[data-bl-target]');if(!target)return;
    if(target.dataset.blSong){chooseSong(game,target.dataset.blSong);persist();render();}
    else if(target.dataset.blCard){selectedCard=selectedCard===target.dataset.blCard?null:target.dataset.blCard;render();root.querySelector(`[data-bl-card="${CSS.escape(target.dataset.blCard)}"]`)?.focus({preventScroll:true});}
    else if(target.dataset.blTarget&&selectedCard)perform(selectedCard,target.dataset.blTarget);
    else if(target.id==='bl-start'){
      const plan=initializeDraft();if(!plan.ready){notify(plan.reason);return render();}
      game=createBandLiveFromWorld(getWorld(),draft);preparing=false;persist();render();
    }else if(target.id==='bl-end'&&!animation){endTurn(game);selectedCard=null;persist();render();}
    else if(target.id==='bl-cancel'&&liveShow()){onConcertCancel?.();syncConcert();render();}
    else if(target.id==='bl-setup'&&!liveShow()){animation=null;clearDrag();selectedCard=null;preparing=true;initializeDraft();render();}
    else if(target.id==='bl-resume'){preparing=false;render();}
    else if(target.id==='bl-return'&&['won','lost'].includes(game.phase)){animation=null;clearDrag();selectedCard=null;persist();const concert=!!liveShow();onReturn({concert});if(concert)syncConcert();}
    else if(target.id==='bl-replay'&&!liveShow()){
      animation=null;clearDrag();selectedCard=null;
      if(game.songOrder){game=createConcertReplay(game);preparing=false;persist();render();return;}
      draft={groupId:game.groupId||'',memberIds:game.actors.map(a=>a.id),seed:game.seed,audienceSize:game.fans.length};
      const plan=initializeDraft();
      if(!game.groupId||plan.group?.id!==game.groupId||!plan.ready){preparing=true;return render();}
      game=createBandLiveFromWorld(getWorld(),draft);persist();render();
    }
    else if(target.id==='bl-sound'){sound=!sound&&await enableAudio();render();}
  });
  root.addEventListener('change',event=>{
    if(event.target.id==='bl-group'){draft.groupId=event.target.value;draft.memberIds=null;initializeDraft();persist();render();}
    else if(event.target.dataset.blMember){const id=event.target.dataset.blMember;draft.memberIds=draft.memberIds.filter(member=>member!==id);if(event.target.checked){if(draft.memberIds.length>=RULES.maxMembers){event.target.checked=false;notify('Six musiciens maximum pour BandLive.');}else draft.memberIds.push(id);}persist();render();}
    else if(event.target.id==='bl-seed'){const seed=Number(event.target.value);if(Number.isInteger(seed)&&seed>=0&&seed<=4294967295)draft.seed=seed;else event.target.value=draft.seed;persist();}
    else if(event.target.id==='bl-audience-size'){const size=Number(event.target.value);if(Number.isInteger(size)&&size>=RULES.minAudience&&size<=RULES.maxAudience)draft.audienceSize=size;else event.target.value=draft.audienceSize;persist();}
  });
  toggle.checked=enabled;nav.hidden=!enabled&&!liveId;
  toggle.addEventListener('change',()=>{enabled=toggle.checked;nav.hidden=!enabled&&!liveId;hideTip();clearDrag();persist();if(!enabled)onDisable();});
  document.addEventListener('click',event=>{
    const concertButton=event.target.closest('[data-bandlive-concert]');
    if(concertButton&&enabled){const result=onConcertStart?.();if(!result?.ok){notify(result?.message||'Le spectacle ne peut pas commencer.');return;}syncConcert();onOpen();return;}
    const button=event.target.closest('[data-bandlive-open]');if(!button)return;
    syncConcert();if(!enabled&&!liveId)return;if(liveShow()){onOpen();return;}
    const plan=getPlan(),groupId=button.dataset.bandliveGroup||plan.groupId;
    if(!game||button.dataset.bandliveGroup||groupId&&groupId!==game.groupId){animation=null;clearDrag();selectedCard=null;draft.groupId=groupId||draft.groupId;draft.memberIds=button.dataset.bandliveGroup?null:plan.members||null;preparing=true;initializeDraft();}
    onOpen();
  });
  root.addEventListener('scroll',hideTip,true);
  const observer=new ResizeObserver(()=>{hideTip();drawEffects();});observer.observe(root);
  return {
    enabled:()=>enabled,
    active:()=>!!(getWorld().performance?.bandLive&&getWorld().showEventId),
    sync:syncConcert,
    refresh(){syncConcert();lastReport=null;initializeDraft();render();},
    replayConcert(snapshot){if(!enabled||!canStart()){notify(!enabled?'Active BandLive dans Réglages pour revoir ce show.':'Termine la soirée avant de revoir un show.');return false;}animation=null;clearDrag();selectedCard=null;liveId=null;game=createConcertReplay(snapshot);rehearsalGame=game;preparing=false;persist();onOpen();return true;},
    concertEntryHTML(show){if(show?.bandLive&&getWorld().showEventId)return '<div class="panel bl-entry"><b>Ce spectacle se joue avec BandLive.</b><button data-bandlive-open class="primary">Reprendre BandLive ↗</button></div>';if(!enabled||!show||show.preview||show.status!=='playing'||show.tick||show.presentationStarted)return '';const plan=resolveBandLiveConcert(getWorld());return `<div class="panel bl-entry"><div><b>Jouer ce spectacle avec BandLive</b><p>${plan.ready?`${plan.profile.label} · ${plan.profile.audienceSize} spectateurs · setlist réservée · le résultat compte dans la partie.`:esc(plan.reason)}</p></div><button data-bandlive-concert class="primary" ${plan.ready?'':'disabled'}>Jouer avec BandLive ↗</button></div>`;},
    leave(){hideTip();clearDrag();},
    entryHTML(){return enabled?'<div class="panel bl-entry"><div><b>BandLive · le show jouable</b><p>Réserve un show avec deux à six musiciens et une ou deux compositions, puis choisis BandLive à l’arrivée sur scène. Les répétitions restent sans récompense.</p></div><button data-bandlive-open class="primary">Essayer BandLive ↗</button></div>':'';},
  };
}
