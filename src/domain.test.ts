import {describe,it,expect} from 'vitest';import {analyze,weekRows,RecordData} from './domain';
const r=(date:string,weight:number):RecordData=>({id:date,kind:'weight',date,weight});
describe('cumulative weight efficiency',()=>{
it('uses first record and elapsed weeks, not neighboring weeks',()=>{const a=analyze([r('2026-10-26',80),r('2026-11-02',79),r('2026-11-08',77)],'2026-11-08');expect(a.average).toBeCloseTo(3/(13/7));expect(a.actual).toBe(2);expect(a.status).toBe('FASTER')});
it('handles no data and a single entry without division by zero',()=>{expect(analyze([]).average).toBeNull();expect(analyze([r('2026-11-09',80)],'2026-11-09').status).toBe('NEED DATA')});
it('supports partial weeks, flat weight and gain',()=>{expect(analyze([r('2026-11-02',80),r('2026-11-03',80)],'2026-11-03').status).toBe('ON TRACK');expect(analyze([r('2026-11-02',80),r('2026-11-03',81)],'2026-11-03').average).toBe(-7)});
it('does not fabricate a weekly result for missing weekly readings',()=>{expect(analyze([r('2026-10-01',80),r('2026-11-09',78)],'2026-11-09').actual).toBeNull()});
it('sorts input and excludes future records',()=>{expect(analyze([r('2026-11-10',10),r('2026-11-08',79),r('2026-11-01',80)],'2026-11-09').current?.weight).toBe(79)});
it('groups on Monday',()=>expect(weekRows([r('2026-11-08',78),r('2026-11-02',80)])[0].loss).toBe(2));
});
