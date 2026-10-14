export function createBandLiveInspection({root,lookup,blocked}){
  const panel=document.createElement('aside');panel.id='bl-card-preview';panel.className='bl-inspection';panel.setAttribute('aria-label','Détails de la carte');panel.setAttribute('aria-live','polite');panel.hidden=true;
  panel.innerHTML='<div class="preview-caption">DÉTAIL DE LA CARTE</div><div class="preview-face"><div class="preview-head"><span class="preview-cost"></span><strong class="preview-title"></strong></div><div class="preview-art"></div><div class="preview-owner"></div><p class="preview-description"></p><div class="preview-target"></div></div><div class="preview-outcome" hidden><strong class="outcome-name"></strong><div class="outcome-main"></div><div class="outcome-meta"></div></div><div class="preview-targets"></div>';
  document.body.append(panel);let pinned=false,source=null,timer=null;
  function hide(){clearTimeout(timer);pinned=false;panel.hidden=true;source=null;root.querySelectorAll('.bl-inspecting').forEach(el=>el.classList.remove('bl-inspecting'));}
  function show(id,lock=false){
    clearTimeout(timer);if(blocked())return hide();const data=lookup(id);if(!data)return hide();source=id;pinned=lock;
    const {card,owner,instrument,art}=data;panel.hidden=false;
    const top=Math.max(96,(root.querySelector('.bl-viewport')?.getBoundingClientRect().top||84)+12);panel.style.top=top+'px';panel.style.maxHeight=Math.max(160,innerHeight-top-14)+'px';
    panel.querySelector('.preview-cost').textContent=card.cost;panel.querySelector('.preview-title').textContent=card.name;
    panel.querySelector('.preview-art').innerHTML=art;panel.querySelector('.preview-owner').textContent=owner+' · '+instrument;
    panel.querySelector('.preview-description').textContent=card.description;panel.querySelector('.preview-target').textContent=card.twoTargets?'Deux spectateurs distincts':card.shape==='near'?'La cible et les spectateurs proches':card.shape==='row'?'Une rangée':card.shape==='sides'?'Une cible et ses voisins':card.shape==='behind'?'Une cible et derrière':card.target==='single'?'Un spectateur':'Zone du public';
    root.querySelectorAll('.bl-inspecting').forEach(el=>el.classList.remove('bl-inspecting'));root.querySelector('[data-bl-card="'+CSS.escape(id)+'"]')?.classList.add('bl-inspecting');
    if(!lock)panel.querySelector('.preview-outcome').hidden=true;
  }
  function hover(e){const card=e.target.closest('[data-bl-card]');if(card&&!pinned&&card.dataset.blCard!==source){clearTimeout(timer);timer=setTimeout(()=>show(card.dataset.blCard),100);}}
  root.addEventListener('pointerover',hover);root.addEventListener('focusin',e=>{const c=e.target.closest('[data-bl-card]');if(c&&!pinned)show(c.dataset.blCard);});
  root.addEventListener('pointerout',e=>{if(!pinned&&e.target.closest('[data-bl-card]')&&!e.relatedTarget?.closest?.('[data-bl-card]')){clearTimeout(timer);timer=setTimeout(hide,90);}});
  function outcome(value){const box=panel.querySelector('.preview-outcome');box.hidden=false;box.classList.toggle('invalid',!value.valid);for(const key of ['name','main','meta'])box.querySelector('.outcome-'+key).textContent=value[key]||'';}
  window.addEventListener('blur',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  return {show,pin:id=>show(id,true),hide,outcome,targets:panel.querySelector('.preview-targets'),panel};
}
