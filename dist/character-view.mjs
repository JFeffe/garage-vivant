// One appearance renderer for map cubes, show accessories and UI portraits.
export const ACCESSORIES={hair:'Cheveux',glasses:'Lunettes',cap:'Casquette',brows:'Sourcils',moustache:'Moustache',earring:'Boucle d’oreille'};
export const MOVEMENTS={calm:'Calme',nervous:'Nerveux',flamboyant:'Flamboyant',shy:'Timide'};
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const characterName=p=>p.nickname?`${p.name} « ${p.nickname} »`:p.name;
// y is the bottom of the head; the tiny body extends 0.32 head widths below it.
export function drawMicroBody(ctx,x,y,size,p){
 ctx.save();ctx.fillStyle=p.color||'#82a98b';ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=size*.12;ctx.lineCap='round';
 ctx.beginPath();ctx.roundRect(x-size*.19,y-size*.05,size*.38,size*.25,size*.08);ctx.fill();
 ctx.beginPath();
 ctx.moveTo(x-size*.19,y+size*.04);ctx.lineTo(x-size*.3,y+size*.14);
 ctx.moveTo(x+size*.19,y+size*.04);ctx.lineTo(x+size*.3,y+size*.14);
 ctx.moveTo(x-size*.1,y+size*.18);ctx.lineTo(x-size*.12,y+size*.26);
 ctx.moveTo(x+size*.1,y+size*.18);ctx.lineTo(x+size*.12,y+size*.26);ctx.stroke();
 ctx.fillStyle='#00000018';ctx.beginPath();ctx.roundRect(x-size*.12,y+size*.04,size*.24,size*.12,size*.04);ctx.fill();ctx.restore();
}
export function decorateCube(ctx,x,y,size,p,t=0) {
  const a=p.identity?.accessory,top=y-size;
  ctx.save();ctx.lineWidth=Math.max(1,size*.07);ctx.strokeStyle='#33423b';ctx.fillStyle='#39413b';
  if(a==='hair'){ctx.beginPath();ctx.moveTo(x-size*.42,top+4);ctx.lineTo(x-size*.24,top-5);ctx.lineTo(x+1,top+1);ctx.lineTo(x+size*.32,top-3);ctx.lineTo(x+size*.44,top+5);ctx.fill();}
  if(a==='glasses'){ctx.strokeRect(x-size*.37,y-size*.57,size*.29,size*.24);ctx.strokeRect(x+size*.08,y-size*.57,size*.29,size*.24);ctx.beginPath();ctx.moveTo(x-size*.08,y-size*.48);ctx.lineTo(x+size*.08,y-size*.48);ctx.stroke();}
  if(a==='cap'){ctx.fillStyle='#445662';ctx.fillRect(x-size*.5,top-3,size,6);ctx.fillRect(x,top+1,size*.7,3);}
  if(a==='brows'){ctx.beginPath();ctx.moveTo(x-size*.3,y-size*.65);ctx.lineTo(x-size*.1,y-size*.61);ctx.moveTo(x+size*.1,y-size*.61);ctx.lineTo(x+size*.3,y-size*.65);ctx.stroke();}
  if(a==='moustache'){ctx.beginPath();ctx.ellipse(x,y-size*.25,size*.23,size*.08,0,0,Math.PI*2);ctx.fill();}
  if(a==='earring'){ctx.strokeStyle='#f3d78c';ctx.beginPath();ctx.arc(x+size*.48,y-size*.28,size*.09,0,Math.PI*2);ctx.stroke();}
  if(p.identity?.accent==='scarf'){ctx.fillStyle='#edd19a';ctx.fillRect(x-size*.4,y-3,size*.8,3);ctx.fillRect(x+size*.2,y-3,3,size*.25);}
  ctx.restore();
}
export function drawCharacter(ctx,x,y,size,p){
 drawMicroBody(ctx,x,y,size,p);
 ctx.save();ctx.fillStyle=p.color;ctx.beginPath();ctx.roundRect(x-size/2,y-size,size,size,3);ctx.fill();
 ctx.fillStyle='#ffffff38';ctx.fillRect(x-size/2,y-size,size, size*.2);
 ctx.fillStyle='#00000015';ctx.fillRect(x+size*.3,y-size*.8,size*.2,size*.8);
 ctx.fillStyle='#ffffff';ctx.fillRect(x-size*.25,y-size*.55,size*.1,size*.1);ctx.fillRect(x+size*.15,y-size*.55,size*.1,size*.1);
 decorateCube(ctx,x,y,size,p);ctx.restore();
}
const portraits=new Map();
export function characterPortrait(p,size=36){
 const key=JSON.stringify([p.color,p.identity]);let src=portraits.get(key);
 if(!src){const canvas=document.createElement('canvas');canvas.width=canvas.height=96;drawCharacter(canvas.getContext('2d'),48,72,52,p);src=canvas.toDataURL();if(portraits.size>=128)portraits.clear();portraits.set(key,src);}
 return `<img class="character-portrait" width="${size}" height="${size}" src="${src}" alt="${escape(characterName(p))}" data-accessory="${escape(p.identity.accessory)}" data-accent="${escape(p.identity.accent||'')}" data-movement="${escape(p.identity.movement)}">`;
}
