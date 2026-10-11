import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld,createGroup,restore,step,decide,interruptActivity,relationship,PLACES} from '../dist/engine.mjs';
import {command,groupContext,departForShow,showJourney,skipShow,nextSlot} from '../dist/life.mjs';
import {attachment,groupSkills,pairEligible,membershipChance,membershipReason,proposeMembership,requestRehearsal,resolveInvitation,dissolveGroup} from '../dist/groups.mjs';
import {bandsHTML} from '../dist/v6-view.mjs';
import {placeActivityLabels} from '../dist/map-labels.mjs';
// Generated and validated with the published V7.1 engine at 75f60044a68d4602cf4ebc5d9f3f9b9aaaa3fd03.
const legacy=JSON.parse(readFileSync(new URL('v071-world.json',import.meta.url))),copy=structuredClone;
function quiet(){const s=createWorld(722,4);for(const p of s.people){p.sleep.nextBedtime=1e12;p.needs.energy=100;p.emotions.distress=0;decide(s,p,'relax');p.action.route=[];p.action.remaining=100000;}return s;}
function prepared(){const s=restore(legacy);for(const p of s.people){p.sleep.nextBedtime=1e12;p.needs.energy=100;p.emotions.distress=0;decide(s,p,'relax');p.action.route=[];p.action.remaining=100000;}s.bookings=[];for(const o of s.season.opportunities){o.bookingId=null;o.status='open';for(const slot of o.slots)slot.bookingId=null;}for(const g of s.groups){g.development=80;g.nextPractice=g.nextAdoption=g.nextBookingAttempt=1e12;for(const m of Object.values(g.memberships))m.nextCheck=1e12;}return s;}
const controlled=s=>({...groupContext(s),random:()=>0});

test('Real V7.1 migration archives trust and resolves shared repertoire without rewriting authors or mastery',()=>{
 const before=copy(legacy),s=restore(legacy),song=s.songs[0],g1=s.groups[0],g2=s.groups[1];assert.deepEqual(legacy,before);assert.equal(s.version,'0.7.3');assert.equal(song.ownerGroupId,g1.id);assert.equal(song.adoptedAt,null);assert.equal(g1.repertoire[0].mastery,60);assert.equal(g2.repertoire.length,0);assert.equal(s.legacyV71.sharedRepertoires[0].mastery,30);assert.equal(s.people[0].songMastery[song.id],44);assert.deepEqual(song.authors,legacy.songs[0].authors);
 for(const [key,r]of Object.entries(legacy.rels)){assert(!('trust'in s.rels[key]));assert.equal(s.legacyV71.trust[key],r.trust);assert.equal(s.rels[key].affinity,r.affinity);}
 assert(s.bookings[0].legacySetlist);assert(s.legacyV71.confirmedBookings.includes(s.bookings[0].id));assert.deepEqual(restore(s),s);
 const twin=restore(s);step(s,250);step(twin,250);assert.deepEqual(s,twin);
 const tie=copy(legacy);for(const g of tie.groups)g.repertoire[0].mastery=60;tie.groups.reverse();assert.equal(restore(tie).songs[0].ownerGroupId,g1.id);
});

test('Adoption and authors survive departure, deactivation and terminal dissolution',()=>{
 const s=prepared(),g=s.groups[0],song=s.songs[0],author=s.people[0],row=g.repertoire[0];
 assert(command(s,{type:'repertoire',actorId:author.id,groupId:g.id,songId:song.id,remove:true}).ok);assert.equal(row.active,false);assert.equal(row.mastery,60);assert.equal(song.ownerGroupId,g.id);
 assert(command(s,{type:'repertoire',actorId:author.id,groupId:g.id,songId:song.id}).ok);assert.equal(row.active,true);assert.equal(row.mastery,60);
 assert(command(s,{type:'leaveGroup',actorId:author.id,groupId:g.id}).ok);assert.equal(g.state,'dissolved');assert.equal(g.members.length,0);assert(song.authors.includes(author.id));assert.equal(song.ownerGroupId,g.id);assert.equal(author.songMastery[song.id],44);assert.equal(row.mastery,60);assert.equal(g.alumni.length,2);const archivedHTML=bandsHTML(s,g.id,'',true);assert(archivedHTML.includes('Archives (1)'));assert(archivedHTML.includes('Dissolution définitive'));assert(archivedHTML.includes(song.title));assert(!archivedHTML.includes('data-rehearse=')&&!archivedHTML.includes('data-open-shows='));
 assert(!command(s,{type:'repertoire',actorId:author.id,groupId:s.groups[1].id,songId:song.id}).ok);assert(!command(s,{type:'revive',actorId:author.id,groupId:g.id}).ok);const metrics=copy(s.groupState.metrics);assert(!dissolveGroup(s,g,'again',groupContext(s)));assert.deepEqual(s.groupState.metrics,metrics);restore(s);
});

test('Attachment and skill aggregates are derived, directional, and membership remains optional',()=>{
 const s=quiet(),[a,b,c]=s.people;a.skills.guitar=10;b.skills.guitar=30;const g=createGroup(s,[a.id,b.id],{manual:true});g.development=80;g.reputation=30;const initial=attachment(s,a,g).value;relationship(s,a,b).affinity=90;assert(attachment(s,a,g).value>initial);const against=attachment(s,b,g).value;assert(attachment(s,a,g).value>against);g.reputation=90;assert(attachment(s,a,g).value>initial);
 const skills=groupSkills(s,g).guitar;assert.equal(skills.mean,20);assert.equal(skills.min,10);assert.equal(skills.max,30);
 a.lastFormation=b.lastFormation=-1e9;relationship(s,b,a).affinity=12;assert(pairEligible(s,a,b));relationship(s,b,a).affinity=0;assert(!pairEligible(s,a,b));relationship(s,a,b).love=relationship(s,b,a).love=25;assert(pairEligible(s,a,b));
 for(const [p,q]of [[a,c],[c,a]])relationship(s,p,q).affinity=90;
 g.development=50;g.reputation=0;const chance=membershipChance(s,c,a);g.development=80;assert(membershipChance(s,c,a)<chance);
 a.lastFormation=s.time;assert(membershipReason(s,c,a).includes('48 h'));a.lastFormation=-1e9;
 const before=copy(s),stale=proposeMembership(s,c,a,null,controlled(s),{manual:true,name:g.name});assert(!stale.ok);assert.deepEqual(s,before);
 const created=proposeMembership(s,c,a,null,controlled(s));assert(created.ok);assert.equal(s.groups.find(x=>x.id===created.groupId).origin,'autonome');
 b.skills.guitar=10;const html=bandsHTML(s,g.id);assert(html.includes('Minimum / Moyenne / Maximum : 10'));assert(html.includes('Attachement'));restore(s);
});

test('Practice calls wait in FIFO outside the bag and waiting produces no gains',()=>{
 const s=prepared(),g=s.groups[0],a=s.people[0],b=s.people[1],song=s.songs[0],ctx=controlled(s),bags=s.people.map(p=>copy(p.bag)),old=a.action;
 const result=requestRehearsal(s,g,song.id,'g1',ctx);assert(result.ok);assert.equal(a.action,old);assert.deepEqual(s.people.map(p=>p.bag),bags);assert(!requestRehearsal(s,g,song.id,'g1',ctx).ok);assert(resolveInvitation(s,a,ctx));assert.equal(a.action.rehearsalId,result.requestId);assert.deepEqual(a.bag,bags[0]);a.action.route=[];a.place='g1';
 const skill=copy(a.skills),mastery=a.songMastery[song.id],collective=g.repertoire[0].mastery,coordination=g.development;step(s);assert.equal(a.action.elapsed,0);assert.deepEqual(a.skills,skill);assert.equal(a.songMastery[song.id],mastery);assert.equal(g.repertoire[0].mastery,collective);assert.equal(g.development,coordination);assert.equal(s.activities.find(x=>x.id===a.action.activityId).status,'waiting');assert.deepEqual(restore(s),s);
 assert(resolveInvitation(s,b,ctx));b.action.route=[];b.place='g1';step(s);assert.equal(s.groupState.requests[0].status,'playing');assert.equal(s.groupState.metrics.practices,1);assert(g.repertoire[0].mastery>collective);assert(g.development>coordination);const after=g.repertoire[0].mastery;interruptActivity(s,b);decide(s,b,'relax');b.action.route=[];b.action.remaining=100000;step(s,5);assert.equal(g.repertoire[0].mastery,after);assert(a.songMastery[song.id]>mastery);
 const twin=restore(s);step(s,20);step(twin,20);assert.deepEqual(s,twin);
});

test('Invitation expiry, refusal, sleep and empty bag do not manufacture or refund tokens',()=>{
 const s=prepared(),g=s.groups[0],p=s.people[0],ctx=controlled(s);requestRehearsal(s,g,s.songs[0].id,'g1',ctx);const bag=copy(p.bag);p.sleep.nextBedtime=s.time+1;step(s);assert.equal(p.action.key,'sleep');assert.equal(p.invitationQueue[0].status,'pending');assert.deepEqual(p.bag,bag);
 s.time=s.groupState.requests[0].expires;assert(!resolveInvitation(s,p,ctx));assert.equal(p.invitationQueue[0].status,'expired');assert.deepEqual(p.bag,bag);
 const waiting=prepared(),wp=waiting.people[0],wg=waiting.groups[0];requestRehearsal(waiting,wg,waiting.songs[0].id,'g1',controlled(waiting));resolveInvitation(waiting,wp,controlled(waiting));wp.action.route=[];wp.place='g1';step(waiting,121);assert.equal(waiting.groupState.requests[0].status,'closed');assert.equal(waiting.groupState.metrics.practices,0);assert.equal(wg.repertoire[0].mastery,60);restore(waiting);
 const fifo=prepared(),fp=fifo.people[0],fg=fifo.groups[0],other=fifo.groups[1];const second={...copy(fifo.songs[0]),id:2,projectId:null,title:'Deuxième chanson',ownerGroupId:null,adoptedAt:null};fifo.songs.push(second);fifo.nextSongId=3;assert(command(fifo,{type:'repertoire',actorId:fp.id,groupId:other.id,songId:2}).ok);requestRehearsal(fifo,fg,1,'g1',controlled(fifo));requestRehearsal(fifo,other,2,'g2',controlled(fifo));fifo.groupState.requests[0].status='closed';const before=copy(fp.bag);assert(resolveInvitation(fifo,fp,controlled(fifo)));assert.equal(fp.invitationQueue[0].status,'expired');assert.equal(fp.invitationQueue[1].status,'accepted');assert.equal(fp.action.songId,2);assert.deepEqual(fp.bag,before);restore(fifo);
});

test('Confirmed shows interrupt sleep on individually calculated journeys, without ordinary energy refusal',()=>{
 const s=restore(legacy),b=s.bookings[0];for(const g of s.groups){g.nextPractice=g.nextAdoption=g.nextBookingAttempt=1e12;for(const m of Object.values(g.memberships))m.nextCheck=1e12;}s.time=b.time-200;
 const people=b.members.map(id=>s.people.find(p=>p.id===id));people.forEach((p,i)=>{p.x=i?1000:10;p.y=i?650:20;p.sleep.nextBedtime=1e12;decide(s,p,'sleep');p.action.route=[];p.action.remaining=100000;});const journeys=people.map(p=>showJourney(s,p,b));assert.notEqual(journeys[0].departure,journeys[1].departure);
 step(s,190);for(const p of people){assert(p.engagement?.arrived);assert.equal(p.action,null);p.needs.energy=0;}step(s,10);assert.equal(s.performance?.status,'playing');assert.equal(s.performance.actors.length,people.length);assert(s.performance.actors.some(p=>p.energy===0));assert.equal(s.time,b.time);const clock=s.time;step(s,100);assert.equal(s.time,clock);restore(s);
 const absent=restore(legacy),ab=absent.bookings[0],p=absent.people[0];absent.time=ab.time;p.decadence=100;absent.rng=12345;const before=copy(absent.rels),coord=absent.groups[1].development;assert(!departForShow(absent,p));assert(ab.absences[p.id]);const rng=absent.rng;assert(!departForShow(absent,p));assert.equal(absent.rng,rng);assert.deepEqual(absent.rels,before);assert.equal(absent.groups[1].development,coord);
});

test('Current saves reject broken ownership, references, terminal states and active confidence',()=>{
 const valid=prepared();requestRehearsal(valid,valid.groups[0],1,'g1',controlled(valid));
 for(const mutate of [s=>s.rels['p1>p2'].trust=10,s=>s.songs[0].ownerGroupId='g2',s=>s.people[0].invitationQueue[0].requestId='missing',s=>s.groupState.requests[0].place='park',s=>s.groupState.nextRequestId=1,s=>s.groups[0].state='dissolved',s=>s.groups[0].memberships.p1.nextCheck=NaN,s=>s.groupState.metrics.accepted=-1]){const bad=copy(valid);mutate(bad);assert.throws(()=>restore(bad));}
 const bad=quiet();bad.bookings=copy(legacy.bookings);bad.groups=[];assert.throws(()=>restore(bad));
});

test('Map labels never cover cubes, emotion/action effects, names, other labels or bounds',()=>{
 const obstacles=Array.from({length:24},(_,i)=>({x:400+(i%6)*28,y:260+Math.floor(i/6)*34,w:90,h:84})),items=obstacles.map((o,i)=>({id:'p'+i,text:'Trajet · Composer',w:125,h:18,anchor:{x:o.x+40,y:o.y+50}}));items.push({id:'session',text:'Pratique collective',w:200,h:20,anchor:{x:490,y:280}});
 const placed=placeActivityLabels(items,obstacles),overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;assert.equal(placed.length,25);for(let i=0;i<placed.length;i++){const a=placed[i];assert(a.x>=0&&a.y>=0&&a.x+a.w<=1100&&a.y+a.h<=670);assert(obstacles.every(b=>!overlap(a,b)));assert(placed.slice(i+1).every(b=>!overlap(a,b)));}assert.deepEqual(placeActivityLabels(items,obstacles),placed);
});

test('First natural-formation gate covers twenty default seeds with no prepared links or groups',()=>{
 let formed=0;for(const seed of [2040,...Array.from({length:18},(_,i)=>i+1),713]){const s=createWorld(seed),end=s.time+14400;while(s.time<end&&!s.groups.length){if(s.performance?.status==='playing'){skipShow(s,true);nextSlot(s);}step(s);}if(s.groups.length)formed++;restore(s);}assert(formed>=16,formed+' / 20 formed by ten days');
});
