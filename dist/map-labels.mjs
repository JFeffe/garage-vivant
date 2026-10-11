// Pure layout: badges are drawn last, outside person/effect rectangles.
const intersects=(a,b)=>a.x<b.x+b.w+3&&a.x+a.w+3>b.x&&a.y<b.y+b.h+3&&a.y+a.h+3>b.y;
export function placeActivityLabels(items,obstacles=[],bounds={w:1100,h:670}){
 const occupied=[...obstacles],placed=[];
 for(const item of [...items].sort((a,b)=>a.anchor.y-b.anchor.y||a.anchor.x-b.anchor.x||a.id.localeCompare(b.id))){
  const origin={x:Math.max(8,Math.min(bounds.w-item.w-8,item.anchor.x-item.w/2)),y:Math.max(8,Math.min(bounds.h-item.h-8,item.anchor.y-66))};
  const candidate=(dx,dy)=>{const c={x:origin.x+dx*12,y:origin.y+dy*(item.h+4),w:item.w,h:item.h};return c.x>=8&&c.y>=8&&c.x+c.w<=bounds.w-8&&c.y+c.h<=bounds.h-8&&!occupied.some(o=>intersects(c,o))?c:null;};
  let box=candidate(0,0);
  for(let ring=1;!box&&ring<=Math.ceil(Math.max(bounds.w/12,bounds.h/(item.h+4)));ring++){
   for(let x=-ring;!box&&x<=ring;x++)box=candidate(x,-ring)||candidate(x,ring);
   for(let y=-ring+1;!box&&y<ring;y++)box=candidate(-ring,y)||candidate(ring,y);
  }
  if(!box)throw Error('Carte trop dense pour les libellés.');
  occupied.push(box);placed.push({...item,...box});
 }
 return placed;
}
