import {bodyModelsSchema} from '../src/avatar-config';
import {initTRPC,TRPCError} from '@trpc/server';import {z} from 'zod';
export type Context={db:D1Database;userId:string};
const t=initTRPC.context<Context>().create();
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v,'Invalid date');
const base=z.object({id:z.string().min(1).max(100),date,note:z.string().max(1000).optional(),demo:z.boolean().optional()});
export const recordSchema=z.discriminatedUnion('kind',[
base.extend({kind:z.literal('weight'),weight:z.number().min(20).max(500)}),
base.extend({kind:z.literal('exercise'),exerciseType:z.string().min(1).max(80),duration:z.number().int().min(1).max(1440),intensity:z.enum(['Low','Moderate','High'])}),
base.extend({kind:z.literal('sleep'),hours:z.number().min(.1).max(24)}),
base.extend({kind:z.literal('measurement'),chest:z.number().min(20).max(300),waist:z.number().min(20).max(300),hip:z.number().min(20).max(300)})]);
export const goalSchema=z.object({height:z.number().min(100).max(250),targetWeight:z.number().min(20).max(500),targetWaist:z.number().min(20).max(300),targetDate:date,weeklyExercise:z.number().min(0).max(10080),dailySleep:z.number().min(1).max(24),weeklyTargets:z.array(z.object({date,weight:z.number().min(20).max(500)})).max(100),bodyModels:bodyModelsSchema.optional()});
const auth=t.procedure.use(async({ctx,next})=>{if(!ctx.userId)throw new TRPCError({code:'UNAUTHORIZED',message:'Please sign in'});if(!ctx.db)throw new TRPCError({code:'INTERNAL_SERVER_ERROR',message:'The database is not connected yet'});return next()});
export const appRouter=t.router({
 state:auth.query(async({ctx})=>{const [r,g]=await Promise.all([ctx.db.prepare('SELECT data FROM records WHERE user_id = ? ORDER BY date ASC').bind(ctx.userId).all<{data:string}>(),ctx.db.prepare('SELECT data FROM goals WHERE user_id = ?').bind(ctx.userId).first<{data:string}>()]);return{records:r.results.map(x=>JSON.parse(x.data)),goals:g?JSON.parse(g.data):null}}),
 save:auth.input(recordSchema).mutation(async({ctx,input})=>{if(input.date>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'}))throw new TRPCError({code:'BAD_REQUEST',message:'Health entries cannot be dated in the future'});const q=ctx.db.prepare('SELECT id FROM records WHERE user_id=? AND kind=? AND date=? AND id<>?').bind(ctx.userId,input.kind,input.date,input.id);if(input.kind!=='exercise'&&await q.first())throw new TRPCError({code:'CONFLICT',message:'An entry of this type already exists for this date. Please edit it instead.'});await ctx.db.prepare('INSERT INTO records (id,user_id,kind,date,data) VALUES (?,?,?,?,?) ON CONFLICT(user_id,id) DO UPDATE SET kind=excluded.kind,date=excluded.date,data=excluded.data').bind(input.id,ctx.userId,input.kind,input.date,JSON.stringify(input)).run();return{ok:true}}),
 remove:auth.input(z.object({id:z.string()})).mutation(async({ctx,input})=>{await ctx.db.prepare('DELETE FROM records WHERE user_id=? AND id=?').bind(ctx.userId,input.id).run();return{ok:true}}),
 goals:auth.input(goalSchema).mutation(async({ctx,input})=>{await ctx.db.prepare('INSERT INTO goals (user_id,data) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data').bind(ctx.userId,JSON.stringify(input)).run();return{ok:true}}),
 import:auth.input(z.array(recordSchema).max(1000)).mutation(async({ctx,input})=>{const existing=await ctx.db.prepare('SELECT id FROM records WHERE user_id=? LIMIT 1').bind(ctx.userId).first();if(existing)throw new TRPCError({code:'CONFLICT',message:'Sample data can only be loaded into an empty journal'});for(let i=0;i<input.length;i+=50)await ctx.db.batch(input.slice(i,i+50).map(r=>ctx.db.prepare('INSERT INTO records (id,user_id,kind,date,data) VALUES (?,?,?,?,?)').bind(r.id,ctx.userId,r.kind,r.date,JSON.stringify(r))));return{ok:true}}),
 clearDemo:auth.mutation(async({ctx})=>{await ctx.db.prepare("DELETE FROM records WHERE user_id=? AND json_extract(data,'$.demo')=1").bind(ctx.userId).run();return{ok:true}})
});
