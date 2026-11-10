import{z}from'zod';import{recordSchema,goalSchema}from'./record-schemas';import{today}from'./domain';
const stateSchema=z.object({records:z.array(recordSchema),goals:goalSchema.nullable()});
type Journal=z.infer<typeof stateSchema>;
export const guestKey='health-journal-device-v1';
export function guestRequest(name:string,input:unknown,storage:Pick<Storage,'getItem'|'setItem'>=localStorage){
 let state:Journal;try{const raw=storage.getItem(guestKey);state=raw?stateSchema.parse(JSON.parse(raw)):{records:[],goals:null}}catch{throw Error('Your device journal could not be read. Check browser storage permissions or use your exported backup.');}
 switch(name){
 case 'state':return state;
 case 'save':{const r=recordSchema.parse(input);if(r.date>today())throw Error('Health entries cannot be dated in the future');if(r.kind!=='exercise'&&state.records.some(x=>x.id!==r.id&&x.kind===r.kind&&x.date===r.date))throw Error('An entry of this type already exists for this date. Please edit it instead.');state.records=[...state.records.filter(x=>x.id!==r.id),r].sort((a,b)=>a.date.localeCompare(b.date));break;}
 case 'remove':{const{id}=z.object({id:z.string()}).parse(input);state.records=state.records.filter(x=>x.id!==id);break;}
 case 'goals':state.goals=goalSchema.parse(input);break;
 case 'import':if(state.records.length)throw Error('Sample data can only be loaded into an empty journal');state.records=z.array(recordSchema).max(1000).parse(input).sort((a,b)=>a.date.localeCompare(b.date));break;
 case 'clearDemo':state.records=state.records.filter(x=>!x.demo);break;
 default:throw Error('Unknown journal action');
 }
 try{storage.setItem(guestKey,JSON.stringify(state))}catch{throw Error('Your browser could not save this entry. Check available storage and browser privacy settings.');}return{ok:true};
}
