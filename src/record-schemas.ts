import {z} from 'zod';
import {bodyModelsSchema} from './avatar-config';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v,'Invalid date');
const base=z.object({id:z.string().min(1).max(100),date,note:z.string().max(1000).optional(),demo:z.boolean().optional()});
export const recordSchema=z.discriminatedUnion('kind',[
base.extend({kind:z.literal('weight'),weight:z.number().min(20).max(500)}),
base.extend({kind:z.literal('exercise'),exerciseType:z.string().min(1).max(80),duration:z.number().int().min(1).max(1440),intensity:z.enum(['Low','Moderate','High'])}),
base.extend({kind:z.literal('sleep'),hours:z.number().min(.1).max(24)}),
base.extend({kind:z.literal('measurement'),chest:z.number().min(20).max(300),waist:z.number().min(20).max(300),hip:z.number().min(20).max(300)})]);
export const goalSchema=z.object({height:z.number().min(100).max(250),targetWeight:z.number().min(20).max(500),targetWaist:z.number().min(20).max(300),targetDate:date,weeklyExercise:z.number().min(0).max(10080),dailySleep:z.number().min(1).max(24),weeklyTargets:z.array(z.object({date,weight:z.number().min(20).max(500)})).max(100),bodyModels:bodyModelsSchema.optional()});
