import {audienceColumns} from './bandlive.mjs?v=0.7.20';
import {fanGeometry} from './bandlive-hand-geometry.mjs?v=0.7.20';
import {stageLayout,fitScene,FAN_BODY,ACTOR_BODY,clampSlot,defaultFanPosition,settlePlacement} from './bandlive-layout.mjs?v=0.7.20';
import {CROWD} from './crowd-physics.mjs?v=0.7.20';

export function createBandLiveStage({root,getReducedEffects}){
  let host=null,game=null,renderer=null,loading=null,editing=false,held=null,history=[],prefs={},bodies=[],geometry=null,fit=null;
  const key='garage-vivant-bandlive-disposition-v1';
  try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object')prefs=value;}catch{}
  const valid=(n,f)=>Number.isFinite(n)?n:f;
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}};
  const signature=()=>game.actors.map(a=>a.id+':'+a.instrument).join('|')+'/'+game.fans.length+'/'+audienceColumns(game)+(game.crowdVersion===1?'/pack':'');
  const config=()=>{const id=signature();let c=prefs[id];if(!c||typeof c!=='object'||Array.isArray(c))c=prefs[id]={};for(const key of ['actors','fans','hands'])if(!c[key]||typeof c[key]!=='object'||Array.isArray(c[key]))c[key]={};return c;};
  const pack=()=>game?.crowdVersion===1;
  function crowdPoint(point){
    const area=geometry.area,left=Math.max(24,(area-760)/2),scale=700/(CROWD.right-CROWD.left);
    return {x:left+30+(point.x-CROWD.left)*scale,y:56+(point.y-CROWD.top)*.87};
  }
  function placeFan(body,point){const p=crowdPoint(point);body.element.style.left=p.x-body.w/2+'px';body.element.style.top=p.y-body.h/2+'px';}
  function save(){const c=config();for(const b of bodies){if(b.type==='fan'&&pack())continue;else if(b.type==='fan')c.fans[b.id]={dx:b.x-(b.slot.left+b.slot.right)/2,dy:b.y-(b.slot.top+b.slot.bottom)/2};else if(b.type==='actor')c.actors[b.id]={dx:b.x-b.initial.x,dy:b.y-b.initial.y};else c.hands[b.id]={...c.hands[b.id],dx:b.x-b.initial.x,dy:b.y-b.initial.y};}persist();}
  function apply(){
    if(!host)return;
    for(const b of bodies){
      if(b.type==='fan'&&pack())placeFan(b,game.fans.find(f=>f.id===b.id));
      else if(b.type==='fan'){b.element.style.left=b.x-b.slot.left-b.w/2+'px';b.element.style.top=b.y-b.slot.top-b.h/2+'px';}
      else{b.element.style.left=b.x+'px';b.element.style.top=b.y-b.h/2+'px';}
    }
    renderer?.attach(host,game);
  }
  function layout(){
    if(!host||!host.isConnected||!game)return;
    const viewport=host.parentElement;
    if(!viewport.clientWidth||!viewport.clientHeight)return;
    fit=fitScene(viewport.clientWidth,viewport.clientHeight,game.actors.length,pack()?420:Math.ceil(game.fans.length/audienceColumns(game))*140);
    host.style.cssText+=`;min-width:0;width:${fit.width}px;height:${fit.height}px;left:${fit.left}px;top:${fit.top}px;transform:scale(${fit.scale});transform-origin:top left;--bl-crowd-top:${fit.crowdTop}px`;
    host.dataset.blRows=fit.rows;
    const width=host.clientWidth,height=host.clientHeight,compact=false;
    geometry=stageLayout(width,game.actors.length,game.fans.length,audienceColumns(game),compact);
    geometry.actors=game.actors.map((a,i)=>({x:65+(width-130)*(i%fit.columns+.5)/fit.columns,y:143+Math.floor(i/fit.columns)*230}));
    geometry.stage.bottom+=230*(fit.rows-1);
    const c=config();c.actors??={};c.fans??={};c.hands??={};bodies=[];
    for(const [i,a] of game.actors.entries()){
      const section=host.querySelector('[data-bl-musician="'+CSS.escape(a.id)+'"]'),info=section.querySelector('[data-bl-actor]'),hand=section.querySelector('.bl-hand');
      const initial=geometry.actors[i],p=c.actors[a.id]||{},body={id:a.id,type:'actor',element:info,...ACTOR_BODY,initial,x:initial.x+valid(p.dx,0),y:initial.y+valid(p.dy,0)};
      body.slot={left:geometry.stage.left,right:geometry.stage.right,top:geometry.stage.top-40,bottom:geometry.stage.bottom+30};clampSlot(body,body.slot);bodies.push(body);
      if(hand){
        const h=c.hands[a.id]||{},cards=[...hand.querySelectorAll('[data-bl-card]')],scale=Math.max(.55,Math.min(1.65,valid(h.scale,.94))),fan=Math.max(0,Math.min(60,valid(h.fan,26)));
        const g=fanGeometry({count:cards.length,scale,fan});hand.style.width=g.width+'px';hand.style.height=g.height+'px';hand.style.setProperty('--bl-pack-scale',scale);
        cards.forEach((el,j)=>{const p=g.cards[j];el.style.left=p.left+'px';el.style.top=p.top+'px';el.style.width=g.cardW+'px';el.style.height=g.cardH+'px';el.style.setProperty('--bl-card-angle',p.angle+'deg');});
        const initial={x:geometry.actors[i].x,y:181+Math.floor(i/fit.columns)*230+g.height/2};
        bodies.push({id:a.id,type:'cards',element:hand,w:g.width,h:g.height,initial,x:initial.x+valid(h.dx,0),y:initial.y+valid(h.dy,0)});
      }
    }
    const fans=host.querySelector('.bl-fans');fans.style.height=(pack()?420:geometry.crowdHeight)+'px';host.classList.toggle('bl-pack',pack());
    for(const [i,f] of game.fans.entries()){
      const element=host.querySelector('[data-bl-fan="'+CSS.escape(f.id)+'"]'),wrap=element.closest('.bl-fan-wrap'),slot=geometry.slots[i],p=c.fans[f.id]||{},initial=defaultFanPosition(slot,i);
      if(pack()){
        wrap.style.cssText='position:static';delete wrap.dataset.blSlot;
        bodies.push({id:f.id,type:'fan',element,w:76,h:98,x:f.x,y:f.y});continue;
      }
      wrap.style.cssText=`left:${slot.left}px;top:${slot.top}px;width:${slot.right-slot.left}px;height:${slot.bottom-slot.top}px`;
      wrap.dataset.blSlot=`R${Math.floor(i/audienceColumns(game))+1} · ${i%audienceColumns(game)+1}`;
      const body={id:f.id,type:'fan',element,...FAN_BODY,slot,x:valid(p.dx,null)===null?initial.x:(slot.left+slot.right)/2+p.dx,y:valid(p.dy,null)===null?initial.y:(slot.top+slot.bottom)/2+p.dy};clampSlot(body,slot);bodies.push(body);
    }
    // The protected fan rectangles cannot meet across slot boundaries.
    const actors=bodies.filter(b=>b.type==='actor');settlePlacement(actors,null,width,height);
    apply();host.classList.toggle('bl-layout-editing',editing);
  }
  function mount(next,state){
    game=state;host=next;
    if(!host){renderer?.pause();return;}
    layout();
    if(!renderer&&!loading){loading=import('./bandlive-minuit-renderer.mjs?v=0.7.20').then(m=>{renderer=m.createMinuitRenderer({getReducedEffects});renderer.attach(host,game);}).catch(()=>{host?.classList.add('bl-render-fallback');}).finally(()=>loading=null);}
    const button=root.querySelector('#bl-layout');if(button){button.setAttribute('aria-pressed',editing);button.textContent=editing?'✓ Terminer la disposition':'✥ Disposition';}
    const tools=root.querySelector('.bl-layout-tools');if(tools)tools.hidden=!editing;
  }
  function finish(){if(!held)return;const h=held;held=null;if(h.target.hasPointerCapture?.(h.pointer))h.target.releasePointerCapture(h.pointer);save();}
  root.addEventListener('pointerdown',e=>{
    if(!editing||e.button!==0||!host)return;
    const target=e.target.closest('[data-bl-actor],[data-bl-fan],.bl-hand');if(!target||!host.contains(target))return;
    const b=bodies.find(b=>b.element===target);if(!b)return;
    if(pack()&&b.type==='fan')return; // Disposition arranges the stage, not tactical crowd positions.
    e.preventDefault();e.stopImmediatePropagation();history.push(JSON.stringify(prefs));history=history.slice(-20);
    held={body:b,target,pointer:e.pointerId,x:e.clientX,y:e.clientY,startX:b.x,startY:b.y};target.setPointerCapture(e.pointerId);
  },true);
  root.addEventListener('pointermove',e=>{if(!held||held.pointer!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();const b=held.body;b.x=held.startX+(e.clientX-held.x)/fit.scale;b.y=held.startY+(e.clientY-held.y)/fit.scale;
    if(b.slot)clampSlot(b,b.slot);if(b.type==='cards')settlePlacement(bodies,b,host.clientWidth,host.clientHeight);else if(b.type==='actor')settlePlacement(bodies.filter(x=>x.type==='actor'),b,host.clientWidth,host.clientHeight);apply();},true);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(type,e=>{if(held&&e.pointerId===held.pointer){e.stopImmediatePropagation();finish();}},true);
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&editing){finish();editing=false;host?.classList.remove('bl-layout-editing');mount(host,game);}});
  const observer=new ResizeObserver(()=>layout());observer.observe(root);
  let motionFrame=null;
  function moveFans(movement){
    if(!pack()||!movement?.length)return;
    if(motionFrame!==null)cancelAnimationFrame(motionFrame);
    if(getReducedEffects()||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const started=performance.now();
    const paint=now=>{const t=Math.min(1,Math.max(0,(now-started-480)/650)),p=1-Math.pow(1-t,3);
      for(const m of movement){const b=bodies.find(b=>b.type==='fan'&&b.id===m.id);if(b)placeFan(b,{x:m.from.x+(m.to.x-m.from.x)*p,y:m.from.y+(m.to.y-m.from.y)*p});}
      motionFrame=t<1?requestAnimationFrame(paint):null;
    };paint(started);
  }
  return {mount,moveFans,crowdPoint,leave(){finish();if(motionFrame!==null)cancelAnimationFrame(motionFrame);motionFrame=null;renderer?.pause();},get editing(){return editing;},toggle(){finish();editing=!editing;mount(host,game);},
    undo(){finish();if(history.length){prefs=JSON.parse(history.pop());persist();layout();}},reset(){finish();history.push(JSON.stringify(prefs));delete prefs[signature()];persist();layout();},
    tune(actorId,value){if(!game)return;const c=config();c.hands[actorId]={...c.hands[actorId],...value};persist();layout();},
    settings(actorId){return game?(config().hands?.[actorId]||{scale:.94,fan:26}):{scale:.82,fan:26};},
    resize:layout};
}
