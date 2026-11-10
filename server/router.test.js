import {DatabaseSync} from 'node:sqlite';import {readFileSync} from 'node:fs';import {describe,it,expect,beforeEach} from 'vitest';import{appRouter}from'./router';
let db,alice,bob;
beforeEach(()=>{const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_happy_shotgun.sql','utf8'));db={prepare(sql){let args=[];return{bind(...values){args=values;return this},async all(){return{results:sqlite.prepare(sql).all(...args)}},async first(){return sqlite.prepare(sql).get(...args)||null},async run(){sqlite.prepare(sql).run(...args);return{success:true}}}},async batch(qs){return Promise.all(qs.map(q=>q.run()))}};alice=appRouter.createCaller({db,userId:'alice'});bob=appRouter.createCaller({db,userId:'bob'})});
const record={id:'1',kind:'weight',date:'2026-01-01',weight:80};
describe('persistent user-owned records',()=>{
it('requires authentication',async()=>{await expect(appRouter.createCaller({db,userId:''}).state()).rejects.toThrow('Please sign in')});
it('creates, reads, edits and deletes',async()=>{await alice.save(record);expect((await alice.state()).records[0].weight).toBe(80);await alice.save({...record,weight:79});expect((await alice.state()).records[0].weight).toBe(79);await alice.remove({id:'1'});expect((await alice.state()).records).toHaveLength(0)});
it('isolates users including guessed record IDs',async()=>{await alice.save(record);expect((await bob.state()).records).toHaveLength(0);await bob.remove({id:'1'});expect((await alice.state()).records).toHaveLength(1);await bob.save({...record,weight:90});expect((await alice.state()).records[0].weight).toBe(80)});
it('validates values, dates and duplicate daily records',async()=>{await expect(alice.save({...record,weight:-1})).rejects.toThrow();await expect(alice.save({...record,date:'2026-02-30'})).rejects.toThrow();await alice.save(record);await expect(alice.save({...record,id:'2'})).rejects.toThrow('An entry of this type already exists')});
it('saves goals per user',async()=>{const g={height:175,targetWeight:68,targetWaist:75,targetDate:'2027-01-01',weeklyExercise:150,dailySleep:8,weeklyTargets:[{date:'2026-12-01',weight:70}]};await alice.goals(g);expect((await alice.state()).goals).toEqual(g);expect((await bob.state()).goals).toBeNull()});
it('clears only demo data',async()=>{await alice.save(record);await alice.save({...record,id:'2',date:'2026-01-02',demo:true});await alice.clearDemo();expect((await alice.state()).records).toHaveLength(1)});
});

import {baseAvatar} from '../src/avatar-config';
describe('saved body and face customization',()=>{
 it('persists independent avatars and keeps them when other goals are edited',async()=>{const g={height:175,targetWeight:68,targetWaist:75,targetDate:'2027-01-01',weeklyExercise:150,dailySleep:8,weeklyTargets:[],bodyModels:{current:{...baseAvatar,jaw:1.2},target:{...baseAvatar,weight:68,waist:75,nose:.8}}};await alice.goals(g);const saved=(await alice.state()).goals;expect(saved.bodyModels.current.jaw).toBe(1.2);expect(saved.bodyModels.target.nose).toBe(.8);expect((await bob.state()).goals).toBeNull();await alice.goals({...saved,dailySleep:7.5});expect((await alice.state()).goals.bodyModels).toEqual(g.bodyModels)});
 it('rejects avatar parameters outside the supported range',async()=>{const g={height:175,targetWeight:68,targetWaist:75,targetDate:'2027-01-01',weeklyExercise:150,dailySleep:8,weeklyTargets:[],bodyModels:{current:{...baseAvatar,faceWidth:9},target:baseAvatar}};await expect(alice.goals(g)).rejects.toThrow()});
});
