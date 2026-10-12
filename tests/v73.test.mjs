import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {restore,step,decide,compositionProject,VERSION} from '../dist/engine.mjs';
import {groupContext} from '../dist/life.mjs';
import {requestRehearsal,resolveInvitation} from '../dist/groups.mjs';

function practice(){
 const s=restore(JSON.parse(readFileSync(new URL('v071-world.json',import.meta.url)))),g=s.groups[0];
 s.bookings=[];for(const event of s.season.opportunities){event.bookingId=null;event.status='open';for(const slot of event.slots)slot.bookingId=null;}
 for(const group of s.groups){group.development=80;group.nextAdoption=group.nextPractice=group.nextBookingAttempt=1e12;for(const membership of Object.values(group.memberships))membership.nextCheck=1e12;}
 for(const p of s.people){p.sleep.nextBedtime=1e12;p.needs.energy=100;decide(s,p,'relax');p.action.route=[];p.action.remaining=100000;}
 const second={...structuredClone(s.songs[0]),id:s.nextSongId++,projectId:null,title:'Un autre morceau pour le test',ownerGroupId:g.id,adoptedAt:s.time};s.songs.push(second);g.repertoire.push({songId:second.id,mastery:0,rehearsals:0,active:true});
 const ctx={...groupContext(s),random:()=>0},result=requestRehearsal(s,g,s.songs[0].id,'g1',ctx),req=s.groupState.requests.find(r=>r.id===result.requestId),members=s.people.filter(p=>g.members.includes(p.id));
 for(const p of members){assert(resolveInvitation(s,p,ctx));p.action.route=[];p.place='g1';p.actionRanges.practice={min:500,max:600};p.action.duration=550;}
 return {s,g,req,members,second};
}
test('An announced rehearsal keeps its song across cycles and reloads',()=>{
 const {s,g,req,members,second}=practice();
 for(let minute=0;minute<65;minute++){
  step(s);for(const p of members)assert.equal(p.action.songId,req.songId,'The actual song must match the invitation');
 }
 assert.equal(g.repertoire.find(r=>r.songId===second.id).mastery,0,'An unannounced song receives no group mastery');
 const twin=restore(s);step(s,25);step(twin,25);assert.deepEqual(s,twin);
});
test('Each participant keeps a personal departure cycle in collective practice',()=>{
 const {s,members}=practice(),follower=members[1],original=follower.action;
 follower.actionRanges.practice={min:1,max:15};follower.action.duration=10;
 for(const p of members){p.action.elapsed=14;p.action.cycleRemaining=1;}
 step(s);assert.notEqual(follower.action,original,'The leader must not reset the follower departure clock');assert.equal(original.elapsed,15);assert(follower.actionCounts.practice.completed>=1);
});
test('Expiry terminates an ongoing rehearsal before further collective gains',()=>{
 const {s,g,req,members}=practice();req.expires=s.time+2;step(s);assert.equal(req.status,'playing');const mastery=g.repertoire[0].mastery;
 step(s);assert.equal(req.status,'closed');assert(members.every(p=>p.action?.rehearsalId!==req.id));assert.equal(g.repertoire[0].mastery,mastery);restore(s);
});
test('Finishing a shared composition ends the other author session, including travel',()=>{
 const {s,g,members}=practice(),[lead,peer]=members;
 decide(s,lead,'write',{groupId:g.id,newProject:true});const project=compositionProject(s,lead);
 project.authors.push(peer.id);project.authorNames[peer.id]=peer.name;
 decide(s,peer,'write',{groupId:g.id,projectId:project.id});const pending=peer.action;
 lead.action.route=[];lead.action.elapsed=14;lead.action.cycleRemaining=1;lead.actionRanges.write={min:1,max:15};project.work=project.target;
 assert(pending.route.length,'The other author is still travelling');step(s);
 assert.equal(project.status,'finished');assert.equal(s.songs.filter(x=>x.projectId===project.id).length,1);
 assert.notEqual(peer.action,pending,'A finished project cannot silently become another project in the same session');
 assert(s.activities.some(a=>a.personId===peer.id&&a.projectId===project.id&&a.end!==null)||peer.actionCounts.write.completed>0);
 assert.equal(peer.drafts[project.id],undefined);restore(s);
});
test('Published V7.2 saves change only their version and preserve the RNG',()=>{
 const old=JSON.parse(readFileSync(new URL('v072-world.json',import.meta.url))),before=structuredClone(old),s=restore(old);
 assert.equal(old.version,'0.7.2');assert.deepEqual(old,before);assert.deepEqual(s,{...old,version:VERSION});
 const twin=restore(s);step(s,240);step(twin,240);assert.deepEqual(s,twin);
 const corrupt=structuredClone(old);delete corrupt.people[0].invitationQueue;assert.throws(()=>restore(corrupt));
});
