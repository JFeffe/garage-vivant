export function createBandLiveAim(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('bl-aim');svg.setAttribute('aria-hidden','true');
  const ns=svg.namespaceURI;let host=null;
  function attach(world){host=world;if(world&&svg.parentElement!==world)world.append(svg);hide();}
  function hide(){svg.classList.remove('visible');}
  function draw(start,ends,valid=true){
    if(!host||!start||!ends.length)return hide();svg.replaceChildren();
    for(const end of ends){
      const dx=end.x-start.x,dy=end.y-start.y,lift=Math.min(135,Math.max(50,Math.abs(dx)*.22+Math.abs(dy)*.15)),side=Math.abs(dx)<60?65:0;
      const d=`M ${start.x} ${start.y} C ${start.x+dx*.32+side} ${start.y-lift}, ${end.x-dx*.23+side*.45} ${end.y-lift*.65}, ${end.x} ${end.y}`;
      for(const cls of ['bl-aim-halo','bl-aim-line']){const p=document.createElementNS(ns,'path');p.setAttribute('class',cls);p.setAttribute('d',d);svg.append(p);}
      const circle=document.createElementNS(ns,'circle');circle.setAttribute('class','bl-aim-ring');circle.setAttribute('cx',end.x);circle.setAttribute('cy',end.y);circle.setAttribute('r','29');svg.append(circle);
    }
    svg.classList.add('visible');svg.classList.toggle('invalid',!valid);
  }
  return {attach,draw,hide};
}
