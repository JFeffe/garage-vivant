import {writeFileSync} from 'node:fs';
import {createWorld,step,restore} from '../dist/engine.mjs';
import {skipShow,nextSlot} from '../dist/life.mjs';
import {activeGroups,attachment} from '../dist/groups.mjs';
import {GROUP_RULES} from '../dist/group-rules.mjs';
const seeds=[2040,...Array.from({length:18},(_,i)=>i+1),713],mean=xs=>xs.reduce((a,b)=>a+b,0)/(xs.length||1),runs=[],extended=[];
for(const seed of seeds){
 const s=createWorld(seed,8),start=s.time;let first=null,checkpoints=[];
 while(s.time<start+30*1440){
  // The existing skip command resolves real performances; this never creates a band or changes relations to arrange a test.
  if(s.performance?.status==='playing'){skipShow(s,true);nextSlot(s);}step(s);
  if(first===null&&s.groups.length)first=(s.time-start)/1440;
  const elapsed=s.time-start;
  if([3,5,10,30].some(d=>elapsed===d*1440)){
   const mature=s.people.filter(p=>Math.max(0,...activeGroups(s,p.id).map(g=>attachment(s,p,g).value))>=60);
   checkpoints.push({day:elapsed/1440,formed:s.groups.length,active:s.groups.filter(g=>g.state==='active').length,survivors7d:s.groups.filter(g=>g.state==='active'&&s.time-g.created>=10080).length,mature:mature.length,matureSingle:mature.filter(p=>activeGroups(s,p.id).length===1).length,multi:s.people.filter(p=>activeGroups(s,p.id).length>1).length,maxMembership:Math.max(...s.people.map(p=>activeGroups(s,p.id).length)),affinity:mean(Object.values(s.rels).map(r=>r.affinity)),tension:mean(Object.values(s.rels).map(r=>r.tension)),metrics:structuredClone(s.groupState.metrics)});
   restore(s);
  }
 }
 // Reload at maturity must preserve the future, not just accept the snapshot.
 const twin=restore(s);for(let i=0;i<240;i++){if(s.performance?.status==='playing'){skipShow(s,true);nextSlot(s);skipShow(twin,true);nextSlot(twin);}step(s);step(twin);}
 if(JSON.stringify(s)!==JSON.stringify(twin))throw Error('Continuation différente : '+seed);
 if([2040,1,2].includes(seed)){
  while(s.time<start+90*1440){if(s.performance?.status==='playing'){skipShow(s,true);nextSlot(s);}step(s);}
  restore(s);
  const mature=s.people.filter(p=>Math.max(0,...activeGroups(s,p.id).map(g=>attachment(s,p,g).value))>=60);
  extended.push({seed,day:90,active:s.groups.filter(g=>g.state==='active').length,survivors30d:s.groups.filter(g=>g.state==='active'&&s.time-g.created>=30*1440).length,mature:mature.length,matureSingle:mature.filter(p=>activeGroups(s,p.id).length===1).length,maxMembership:Math.max(...s.people.map(p=>activeGroups(s,p.id).length)),metrics:structuredClone(s.groupState.metrics)});
 }
 runs.push({seed,firstGroup:first,checkpoints});console.log(seed,first?.toFixed(2),checkpoints.at(-1).active);
}
const formed10=runs.filter(r=>r.firstGroup!==null&&r.firstGroup<=10).length,last=runs.map(r=>r.checkpoints.at(-1)),mature=last.reduce((n,r)=>n+r.mature,0),matureSingle=last.reduce((n,r)=>n+r.matureSingle,0);
const result={version:'0.7.2',seeds,rules:GROUP_RULES,protocol:'8 personnages, paramètres par défaut, 30 jours écoulés et prolongement à 90 jours des graines 2040, 1 et 2 ; commandes de saut des spectacles existantes, aucune intervention sur groupes ou relations.',summary:{formedBy3:runs.filter(r=>r.firstGroup!==null&&r.firstGroup<=3).length,formedBy5:runs.filter(r=>r.firstGroup!==null&&r.firstGroup<=5).length,formedBy10:formed10,total:runs.length,failedSeeds:runs.filter(r=>r.firstGroup===null||r.firstGroup>10).map(r=>r.seed),active30:last.reduce((n,r)=>n+r.active,0),survivors7d:last.reduce((n,r)=>n+r.survivors7d,0),mature,matureSingle,maxMembership:Math.max(...last.map(r=>r.maxMembership)),practiceStarts:last.reduce((n,r)=>n+r.metrics.practices,0),departures:last.reduce((n,r)=>n+r.metrics.departures,0)},runs,extended};
writeFileSync('docs/BALANCE_V7_2.json',JSON.stringify(result,null,2)+'\n');console.log(result.summary);
if(formed10<16||mature===0||matureSingle<=mature/2)process.exitCode=1;
