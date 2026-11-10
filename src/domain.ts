import type {BodyModels} from './avatar-config';
export type Kind='weight'|'exercise'|'sleep'|'measurement';
export type RecordData={id:string;kind:Kind;date:string;weight?:number;duration?:number;exerciseType?:string;intensity?:'Low'|'Moderate'|'High';hours?:number;chest?:number;waist?:number;hip?:number;note?:string;demo?:boolean};
export type Goals={height:number;targetWeight:number;targetWaist:number;targetDate:string;weeklyExercise:number;dailySleep:number;weeklyTargets:{date:string;weight:number}[];bodyModels?:BodyModels};
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const day=(s:string)=>Date.parse(s+'T00:00:00Z')/86400000;
export const dateAt=(n:number)=>new Date(n*86400000).toISOString().slice(0,10);
export const weekStart=(s:string)=>{const n=day(s);return n-((new Date(n*86400000).getUTCDay()+6)%7)};
export const defaults=():Goals=>({height:175,targetWeight:68,targetWaist:75,targetDate:dateAt(day(today())+90),weeklyExercise:150,dailySleep:8,weeklyTargets:[]});
export const mean=(a:number[])=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
export function analyze(records:RecordData[],asOf=today()){
 const rows=records.filter(r=>r.kind==='weight'&&r.date<=asOf).sort((a,b)=>a.date.localeCompare(b.date));
 const first=rows[0],current=rows.at(-1); const days=first?day(asOf)-day(first.date):0;const loss=first&&current?first.weight!-current.weight!:0;
 const average=rows.length>=2&&days>0?loss/(days/7):null;
 const week=rows.filter(r=>day(r.date)>=weekStart(asOf));
 const actual=week.length>=2?week[0].weight!-week.at(-1)!.weight!:null;
 const diff=actual!==null&&average!==null?actual-average:null;
 const status=diff===null?'NEED DATA':Math.abs(diff)<=0.01?'ON TRACK':diff>0?'FASTER':'SLOWER';
 return {rows,first,current,days,loss,average,actual,diff,status};
}
export function weekRows(records:RecordData[]){const map=new Map<string,RecordData[]>();records.filter(r=>r.kind==='weight').sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{const key=dateAt(weekStart(r.date));map.set(key,[...(map.get(key)||[]),r])});return [...map].map(([date,rows])=>({date,count:rows.length,start:rows[0].weight!,end:rows.at(-1)!.weight!,loss:rows[0].weight!-rows.at(-1)!.weight!})).reverse()}
export function demoRecords():RecordData[]{const a:RecordData[]=[];const base=day(today());for(let i=84;i>=0;i--){const date=dateAt(base-i),x=84-i; a.push({id:crypto.randomUUID(),kind:'weight',date,weight:+(79.8-x*.067+Math.sin(x*.6)*.22).toFixed(1),demo:true}); if(i%3!==1)a.push({id:crypto.randomUUID(),kind:'exercise',date,exerciseType:i%2?'Strength training':'Walking',duration:i%2?45:30,intensity:'Moderate',demo:true});a.push({id:crypto.randomUUID(),kind:'sleep',date,hours:+(7.2+Math.sin(x)*.7).toFixed(1),demo:true});if(i%7===0)a.push({id:crypto.randomUUID(),kind:'measurement',date,chest:+(98-x*.03).toFixed(1),waist:+(89-x*.07).toFixed(1),hip:+(101-x*.03).toFixed(1),demo:true});}return a;}
