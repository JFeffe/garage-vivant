export function createBandLiveAim(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('bl-aim');svg.setAttribute('aria-hidden','true');
  const ns=svg.namespaceURI;let host=null;
  function attach(world){host=world;if(world&&svg.parentElement!==world)world.append(svg);hide();}
  function reset(){svg.replaceChildren();hide();}
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
  function forecast(zones,movement){
    for(const zone of zones){
      const shape=document.createElementNS(ns,zone.direction?'path':'ellipse');shape.setAttribute('class','bl-pack-zone');
      if(zone.direction){const {x,y}=zone.center,dx=zone.direction.x*600,dy=zone.direction.y*600,len=Math.hypot(dx/.946,dy/.87),w=zone.halfWidth||48,nx=-(dy/.87)/len*w*.946,ny=(dx/.946)/len*w*.87;shape.setAttribute('d',`M ${x+nx} ${y+ny} L ${x+dx+nx} ${y+dy+ny} L ${x+dx-nx} ${y+dy-ny} L ${x-nx} ${y-ny} Z M ${x} ${y} L ${x+dx} ${y+dy}`);}
      else{shape.setAttribute('cx',zone.center.x);shape.setAttribute('cy',zone.center.y);shape.setAttribute('rx',zone.radius*.946);shape.setAttribute('ry',zone.radius*.87);}
      svg.append(shape);
    }
    for(const m of movement){const p=document.createElementNS(ns,'path');p.setAttribute('class','bl-pack-push');p.setAttribute('d',`M ${m.from.x} ${m.from.y} L ${m.to.x} ${m.to.y}`);svg.append(p);const end=document.createElementNS(ns,'circle');end.setAttribute('class','bl-pack-destination');end.setAttribute('cx',m.to.x);end.setAttribute('cy',m.to.y);end.setAttribute('r','7');svg.append(end);}
    if(zones.length||movement.length)svg.classList.add('visible');
  }
  return {attach,draw,forecast,hide,reset};
}
