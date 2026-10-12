import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createWorld,step,restore,VERSION} from '../dist/engine.mjs';
import {skipShow,nextSlot} from '../dist/life.mjs';
import {RELEASE_VERSION} from '../dist/release.mjs';
import {attachment,activeGroups} from '../dist/groups.mjs';

// Observe either the empty laboratory setup or the explicit real starting configuration.
const configs=[...Array.from({length:12},(_,i)=>({seed:i===0?2040:i,count:8})),{seed:713,count:4},{seed:714,count:4},{seed:713,count:12},{seed:714,count:12}];
const output=process.argv[2]||'docs/AUDIT_V7_10.json';
const mean=xs=>xs.reduce((n,x)=>n+x,0)/(xs.length||1),round=x=>Math.round(x*100)/100;
function resolveShows(s){
 let safety=0;
 while(s.performance?.status==='playing'||s.showEventId){
  if(++safety>40)throw Error('Soirée bloquée');
  if(s.performance?.status==='playing')skipShow(s,true);
  nextSlot(s);
 }
}
function advance(s){resolveShows(s);step(s);}
const runs=[];
for(const {seed,count} of configs){
 const s=createWorld(seed,count,{setup:process.argv[3]||"varied"}),start=s.time,initialSkills=s.people.map(p=>({...p.skills}));
 const minutes={},daily=[],anomalies={},examples={},shows=new Set(),seenActivities=new Set(),activityResults={},invitations={},seenResponses=new Set();
 let firstGroup=null,firstSong=null,validationError=null,continuation=true;
 const note=(kind,example)=>{anomalies[kind]=(anomalies[kind]||0)+1;examples[kind]??=example;};
 const observed={samples:0,needs:{energy:0,social:0,fun:0,expression:0},critical:{energy:0,social:0,fun:0,expression:0},distress80:0,distress:0,exaltation:0,decadence:0};
 for(let tick=0;tick<15*1440;tick++){
  try{advance(s);}catch(error){validationError={time:s.time,message:error.stack};break;}
  const day=(s.time-start)/1440;
  if(firstGroup===null&&s.groups.length)firstGroup=round(day);
  if(firstSong===null&&s.songs.length)firstSong=round(day);
  for(const history of s.showHistory)shows.add(history.id);
  for(const row of s.activities)if(row.end!==null&&!seenActivities.has(row.id)){seenActivities.add(row.id);const key=row.key+':'+row.status;activityResults[key]=(activityResults[key]||0)+1;}
  for(const p of s.people){
   const a=p.action,req=a?.rehearsalId?s.groupState.requests.find(r=>r.id===a.rehearsalId):null;
   const state=p.engagement?(p.engagement.arrived?'show-wait':'show-route'):a?.route.length?'route:'+a.key:a?.rehearsalId&&req?.status==='open'?'practice-wait':a?.key||'idle';
   minutes[state]=(minutes[state]||0)+1;
   if(a?.key==='practice'&&req&&a.songId!==req.songId)note('rehearsalSongMismatch',{time:s.time,person:p.id,requestId:req.id,requestedSong:req.songId,actualSong:a.songId,groupId:req.groupId});
   if(a&&a.key!=='sleep'&&!a.route.length&&!p.engagement&&a.elapsed>p.actionRanges[a.key].max+15)note('actionBeyondRange',{time:s.time,person:p.id,key:a.key,elapsed:a.elapsed,max:p.actionRanges[a.key].max});
   if(a?.key==='write'&&a.projectId!==p.draft.projectId)note('compositionProjectMismatch',{time:s.time,person:p.id,actionProject:a.projectId,draftProject:p.draft.projectId});
   if(a?.key==='practice'&&a.songId&&!s.songs.some(x=>x.id===a.songId))note('missingPracticeSong',{time:s.time,person:p.id,songId:a.songId});
   for(const inv of p.invitationQueue)if(inv.status!=='pending'&&!seenResponses.has(inv.id)){seenResponses.add(inv.id);invitations[inv.status]=(invitations[inv.status]||0)+1;}
   observed.samples++;for(const k of Object.keys(observed.needs)){observed.needs[k]+=p.needs[k];observed.critical[k]+=Number(p.needs[k]<p.needThresholds[k].critical);}
   observed.distress+=p.emotions.distress;observed.distress80+=Number(p.emotions.distress>=80);observed.exaltation+=p.emotions.exaltation;observed.decadence+=p.decadence;
  }
  for(const req of s.groupState.requests)if(req.status==='playing'&&s.time>=req.expires)note('rehearsalPastExpiry',{time:s.time,requestId:req.id,expires:req.expires,started:req.started});
  if((s.time-start)%1440===0){
   try{assert.equal(JSON.stringify(restore(s)),JSON.stringify(s));}catch(error){validationError={time:s.time,message:error.message};break;}
   daily.push({day,groups:s.groups.length,active:s.groups.filter(g=>g.state==='active').length,songs:s.songs.length,projects:s.projects.length,finished:s.projects.filter(x=>x.status==='finished').length,abandoned:s.projects.filter(x=>x.status==='abandoned').length,shows:shows.size,affinity:round(mean(Object.values(s.rels).map(r=>r.affinity))),tension:round(mean(Object.values(s.rels).map(r=>r.tension))),needs:Object.fromEntries(Object.keys(observed.needs).map(k=>[k,round(mean(s.people.map(p=>p.needs[k])))])),distress:round(mean(s.people.map(p=>p.emotions.distress))),coordination:round(mean(s.groups.filter(g=>g.state==='active').map(g=>g.development))),metrics:structuredClone(s.groupState.metrics)});
  }
 }
 if(!validationError){resolveShows(s);for(const history of s.showHistory)shows.add(history.id);const last=daily.at(-1);if(last)Object.assign(last,{shows:shows.size,affinity:round(mean(Object.values(s.rels).map(r=>r.affinity))),tension:round(mean(Object.values(s.rels).map(r=>r.tension))),needs:Object.fromEntries(Object.keys(observed.needs).map(k=>[k,round(mean(s.people.map(p=>p.needs[k])))])),metrics:structuredClone(s.groupState.metrics)});}
 const final=structuredClone(s);
 if(!validationError){const twin=restore(s);for(let i=0;i<240;i++){advance(s);advance(twin);}continuation=JSON.stringify(s)===JSON.stringify(twin);}
 const maturity=final.people.filter(p=>Math.max(0,...activeGroups(final,p.id).map(g=>attachment(final,p,g).value))>=60);
 const run={seed,count,firstGroup,firstSong,validationError,continuation,anomalies,examples,daily,minutes,activityResults,invitations,shows:shows.size,bookingStatuses:final.bookings.reduce((r,b)=>(r[b.status]=(r[b.status]||0)+1,r),{}),songs:final.songs.length,adopted:final.songs.filter(x=>x.ownerGroupId).length,quality:round(mean(final.songs.map(x=>x.quality))),projects:final.projects.length,zeroWorkProjects:final.projects.filter(x=>x.minutes===0).length,finishedProjectSessions:final.projects.filter(x=>x.status==='finished').map(x=>x.sessions),groupSizes:final.groups.filter(g=>g.state==='active').map(g=>g.members.length),mature:maturity.length,matureSingle:maturity.filter(p=>activeGroups(final,p.id).length===1).length,skillGains:final.people.map((p,i)=>({id:p.id,primary:round(p.skills[p.instrument]-initialSkills[i][p.instrument]),writing:round(p.skills.writing-initialSkills[i].writing)})),observed:{averageNeeds:Object.fromEntries(Object.entries(observed.needs).map(([k,v])=>[k,round(v/observed.samples)])),criticalPercent:Object.fromEntries(Object.entries(observed.critical).map(([k,v])=>[k,round(v/observed.samples*100)])),distress:round(observed.distress/observed.samples),distress80Percent:round(observed.distress80/observed.samples*100),exaltation:round(observed.exaltation/observed.samples),decadence:round(observed.decadence/observed.samples)}};
 runs.push(run);
 console.log(JSON.stringify({seed,count,days:daily.length,groups:run.groupSizes,songs:run.songs,shows:run.shows,anomalies,validationError,continuation,needs:run.observed.averageNeeds,critical:run.observed.criticalPercent}));
 if(validationError){writeFileSync('/tmp/v73-anomaly-'+seed+'-'+count+'.json',JSON.stringify(final));}
}
const result={setup:process.argv[3]||"varied",version:VERSION,release:RELEASE_VERSION,days:15,protocol:`Configuration initiale ${process.argv[3]||'varied'}. 12 graines à 8 personnages + 4 parties à 4/12 personnages, paramètres par défaut, 15 jours écoulés. Résolution des spectacles avec skipShow/nextSlot, sans préparer les relations ni imposer les actions. Validation quotidienne exacte et continuation rechargée de 240 minutes. Compteurs de temps en minutes-personnes.`,configs,runs};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log('REPORT '+output);
if(runs.some(r=>r.validationError||!r.continuation||Object.values(r.anomalies).some(n=>n>0)))process.exitCode=1;
