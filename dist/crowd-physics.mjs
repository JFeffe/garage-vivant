// World-space crowd shared by both shows. No renderer or world/card RNG is used.
export const CROWD = Object.freeze({left:135,right:875,top:250,bottom:600,radius:34,near:125,wide:205,corridor:48});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const nearby=(fans,source,radius=CROWD.near)=>fans.filter(f=>f!==source&&distance(f,source)<=radius);
export function outward(source){
  const dx=source.x-505,dy=source.y-150,d=Math.hypot(dx,dy)||1;
  return {x:dx/d,y:dy/d};
}
export function corridor(fans,source){
  const dir=outward(source);
  return fans.filter(f=>f!==source).map(f=>{const dx=f.x-source.x,dy=f.y-source.y;return {f,along:dx*dir.x+dy*dir.y,side:Math.abs(dx*dir.y-dy*dir.x)};})
    .filter(p=>p.along>0&&p.side<=CROWD.corridor).sort((a,b)=>a.along-b.along||a.f.id.localeCompare(b.f.id)).map(p=>p.f);
}
function bound(f){
  f.x=clamp(f.x,CROWD.left,CROWD.right);f.y=clamp(f.y,CROWD.top,CROWD.bottom);
  if(f.x===CROWD.left&&f.vx<0||f.x===CROWD.right&&f.vx>0)f.vx=0;
  if(f.y===CROWD.top&&f.vy<0||f.y===CROWD.bottom&&f.vy>0)f.vy=0;
}
export function resolveCrowd(fans,held=null,passes=12){
  // Circular bodies transfer pressure; labels and card hands have no collider.
  for(let pass=0;pass<passes;pass++){
    let changed=false;
    for(let i=0;i<fans.length;i++)for(let j=i+1;j<fans.length;j++){
      const a=fans[i],b=fans[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),gap=CROWD.radius*2-d;
      if(gap<=.001)continue;
      changed=true;const nx=d>0?dx/d:1,ny=d>0?dy/d:0,ma=a===held?0:b===held?1:.5,mb=b===held?0:a===held?1:.5;
      a.x-=nx*(gap+.002)*ma;a.y-=ny*(gap+.002)*ma;b.x+=nx*(gap+.002)*mb;b.y+=ny*(gap+.002)*mb;
      const closing=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
      if(closing>0){a.vx-=nx*closing*ma;a.vy-=ny*closing*ma;b.vx+=nx*closing*mb;b.vy+=ny*closing*mb;}
      bound(a);bound(b);
    }
    if(!changed)break;
  }
  fans.forEach(bound);
}
export function createPack(count,seed,{spread=1}={}){
  let rng=(seed^0x725ca39b)>>>0;
  const random=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
  const fans=[],rx=Math.min(350,(95+Math.sqrt(count)*38)*spread),ry=Math.min(164,(65+Math.sqrt(count)*22)*spread);
  for(let i=0;i<count;i++){
    let best=null,bestGap=-1;
    for(let attempt=0;attempt<180;attempt++){
      const angle=random()*Math.PI*2,r=Math.sqrt(random()),p={x:505+Math.cos(angle)*rx*r,y:425+Math.sin(angle)*ry*r};
      const gap=fans.length?Math.min(...fans.map(f=>distance(f,p))):Infinity;
      if(gap>bestGap){best=p;bestGap=gap;}if(gap>=82)break;
    }
    fans.push({id:'f'+i,...best,vx:0,vy:0});
  }
  resolveCrowd(fans,null,80);
  return fans.map(({x,y,vx,vy})=>({x,y,homeX:x,homeY:y,vx,vy}));
}
export function stepCrowd(fans,{returnHome=false}={}){
  for(const f of fans){
    if(returnHome){f.vx+=(f.homeX-f.x)*.6/60;f.vy+=(f.homeY-f.y)*.6/60;}
    f.vx*=.965;f.vy*=.965;f.x+=f.vx/60;f.y+=f.vy/60;bound(f);
  }
  resolveCrowd(fans);
}
export function pushCrowd(fans,source,radius=CROWD.near,strength=125){
  for(const f of nearby(fans,source,radius)){
    const d=distance(f,source),dir=d>0?{x:(f.x-source.x)/d,y:(f.y-source.y)/d}:outward(source);
    f.vx+=dir.x*strength;f.vy+=dir.y*strength;
  }
}
export function settleCrowd(fans){
  for(let i=0;i<90;i++)stepCrowd(fans);
  fans.forEach(f=>{f.vx=0;f.vy=0;});
}
export function validCrowd(fans){
  return fans.every(f=>Number.isFinite(f.x)&&f.x>=CROWD.left&&f.x<=CROWD.right&&Number.isFinite(f.y)&&f.y>=CROWD.top&&f.y<=CROWD.bottom&&Number.isFinite(f.homeX)&&f.homeX>=CROWD.left&&f.homeX<=CROWD.right&&Number.isFinite(f.homeY)&&f.homeY>=CROWD.top&&f.homeY<=CROWD.bottom&&Number.isFinite(f.vx)&&Math.abs(f.vx)<=10000&&Number.isFinite(f.vy)&&Math.abs(f.vy)<=10000);
}
