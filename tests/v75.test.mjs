import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createGroup,relationship,restore} from '../dist/engine.mjs';
import {groupContext,command} from '../dist/life.mjs';
import {membershipReason,membershipChance,proposeMembership,considerMembership} from '../dist/groups.mjs';

function fixture(){
 const s=createWorld(755,8);for(const p of s.people){p.engagement=null;p.action=null;p.lastFormation=-1e9;for(const q of s.people)if(p!==q)Object.assign(relationship(s,p,q),{affinity:60,love:0,tension:0});}
 const g=createGroup(s,s.people.slice(0,2).map(p=>p.id),{manual:true});g.development=100;return {s,g};
}
const controlled=(s,random=()=>0)=>({...groupContext(s),random});

test('An attached founder can recruit a third and fourth member without waiting or switching bands',()=>{
 const {s,g}=fixture(),[a,b,c,d]=s.people,hostFormation=a.lastFormation;
 assert.equal(membershipReason(s,a,c,g),null);assert(membershipReason(s,a,c).includes('48 h'));
 // A 10% roll used to be blocked by the founder's attachment and membership count.
 assert(proposeMembership(s,a,c,g,controlled(s,()=>.1)).ok);
 assert.equal(a.lastFormation,hostFormation);assert.equal(b.lastFormation,hostFormation);assert.equal(c.lastFormation,s.time);
 assert(proposeMembership(s,a,d,g,controlled(s,()=>.1)).ok);assert.deepEqual(g.members,[a,b,c,d].map(p=>p.id));
 assert.equal(s.groups.length,1);assert.equal(s.groupState.metrics.accepted,2);assert.deepEqual(restore(s),s);
});

test('Only the recruitment candidate waits 24 hours; creating another band still waits 48 hours',()=>{
 const {s,g}=fixture(),[a,,c,d]=s.people;c.lastFormation=s.time;
 assert(membershipReason(s,a,c,g).includes('24 h'));s.time+=1439;assert(membershipReason(s,a,c,g));
 s.time++;assert.equal(membershipReason(s,a,c,g),null);assert(membershipReason(s,c,d).includes('48 h'));
 s.time+=1440;assert.equal(membershipReason(s,c,d),null);
});

test('Recruitment keeps reciprocal links to half the roster, tension and candidate multigroup reluctance',()=>{
 const {s,g}=fixture(),[a,b,c,d,e]=s.people;
 assert(proposeMembership(s,a,c,g,controlled(s)).ok);assert(proposeMembership(s,a,d,g,controlled(s)).ok);
 for(const q of [b,c,d])relationship(s,e,q).affinity=0;
 assert(membershipReason(s,a,e,g).includes('moitié'));relationship(s,e,b).affinity=60;assert.equal(membershipReason(s,a,e,g),null);
 relationship(s,e,a).tension=60;assert(membershipReason(s,a,e,g).includes('tension'));relationship(s,e,a).tension=0;
 const chance=membershipChance(s,a,e,g),other=createGroup(s,[e.id,s.people[5].id],{manual:true});other.development=100;e.lastFormation=-1e9;
 assert(membershipChance(s,a,e,g)<chance/5);assert(!proposeMembership(s,a,e,g,controlled(s,()=>.1)).ok);assert(!g.members.includes(e.id));
});

test('Manual and autonomous recruitment share the same refusal cooldown and terminal checks',()=>{
 const {s,g}=fixture(),[a,,c]=s.people;
 const refusal=proposeMembership(s,a,c,g,controlled(s,()=>.99),{manual:true});assert(!refusal.ok);assert.equal(s.groupState.metrics.proposed,1);
 assert(command(s,{type:'invite',actorId:a.id,targetId:c.id,groupId:g.id}).message.includes('24 h'));
 s.time+=1440;const retry=command(s,{type:'invite',actorId:a.id,targetId:c.id,groupId:g.id});assert.equal(s.groupState.metrics.proposed,2);assert(Number.isFinite(retry.chance));
 const archive=fixture();archive.g.state='dissolved';archive.g.archivedAt=archive.s.time;assert(membershipReason(archive.s,archive.s.people[0],archive.s.people[2],archive.g));
});

test('A favorable encounter can choose recruitment while a stable host still resists a new band',()=>{
 const {s,g}=fixture(),[a,,c]=s.people;a.lastFormation=-1e9;let rolls=[.5,.1,.2];
 assert(considerMembership(s,a,c,controlled(s,()=>rolls.shift())).ok);assert(g.members.includes(c.id));assert.equal(s.groups.length,1);
 const d=s.people[3];assert(!proposeMembership(s,a,d,null,controlled(s,()=>.1)).ok);assert.equal(s.groups.length,1);
});
