import test from 'node:test';
import assert from 'node:assert/strict';
import {stageLayout,clampSlot,FAN_BODY,defaultFanPosition,settlePlacement} from '../dist/bandlive-layout.mjs';
import {overlaps} from '../dist/bandlive-physics.mjs';
test('all allowed crowds retain their slots and protected rectangles after arbitrary drags',()=>{
  for(const count of [3,8,10,12]){
    const g=stageLayout(1200,6,count,Math.min(4,count)),bodies=g.slots.map((slot,i)=>({id:'f'+i,type:'fan',...FAN_BODY,slot,...defaultFanPosition(slot,i)}));
    for(const b of bodies){b.x+=1000;b.y-=1000;clampSlot(b,b.slot);}
    for(const [i,b] of bodies.entries()){
      assert.equal(b.id,'f'+i);assert(b.x-b.w/2>=b.slot.left);assert(b.x+b.w/2<=b.slot.right);assert(b.y-b.h/2>=b.slot.top);assert(b.y+b.h/2<=b.slot.bottom);
      assert(bodies.slice(i+1).every(other=>!overlaps(b,other)));
    }
  }
});
test('moving a hand through the crowd never pushes its protected bodies',()=>{
  const fan={id:'f0',type:'fan',x:100,y:100,...FAN_BODY},hand={id:'p0',type:'cards',x:100,y:100,w:210,h:155};const before={...fan};
  settlePlacement([fan,hand],hand,700,600);assert.deepEqual(fan,before);
});
