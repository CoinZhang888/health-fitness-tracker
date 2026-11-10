import {z} from 'zod';
export const avatarSchema=z.object({
 height:z.number().min(100).max(220),weight:z.number().min(30).max(220),
 chest:z.number().min(50).max(160),waist:z.number().min(40).max(180),hip:z.number().min(50).max(170),
 shoulders:z.number().min(28).max(65),arm:z.number().min(15).max(60),thigh:z.number().min(25).max(100),calf:z.number().min(20).max(65),legRatio:z.number().min(.43).max(.56),muscle:z.number().min(0).max(100),
 head:z.number().min(.85).max(1.15),faceWidth:z.number().min(.75).max(1.25),jaw:z.number().min(.65).max(1.35),chin:z.number().min(.7).max(1.3),cheek:z.number().min(.7).max(1.3),eyes:z.number().min(.7).max(1.3),eyeSpacing:z.number().min(.75).max(1.25),nose:z.number().min(.6).max(1.4),mouth:z.number().min(.7).max(1.3),
 skin:z.enum(['porcelain','sand','warm','umber','graphite']),hair:z.enum(['none','short','long'])
});
export type AvatarParams=z.infer<typeof avatarSchema>;
export const bodyModelsSchema=z.object({current:avatarSchema,target:avatarSchema});
export type BodyModels=z.infer<typeof bodyModelsSchema>;
export const baseAvatar:AvatarParams={height:175,weight:75,chest:96,waist:84,hip:98,shoulders:43,arm:30,thigh:55,calf:36,legRatio:.49,muscle:35,head:1,faceWidth:1,jaw:1,chin:1,cheek:1,eyes:1,eyeSpacing:1,nose:1,mouth:1,skin:'porcelain',hair:'none'};
export type AvatarField={key:keyof AvatarParams;label:string;min:number;max:number;step:number;unit?:string};
export const bodyFields:AvatarField[]=[
 {key:'height',label:'Height',min:100,max:220,step:1,unit:'cm'}, {key:'weight',label:'Weight',min:30,max:220,step:.5,unit:'kg'},
 {key:'chest',label:'Chest',min:50,max:160,step:.5,unit:'cm'}, {key:'waist',label:'Waist',min:40,max:180,step:.5,unit:'cm'}, {key:'hip',label:'Hip',min:50,max:170,step:.5,unit:'cm'},
 {key:'shoulders',label:'Shoulder width',min:28,max:65,step:.5,unit:'cm'}, {key:'arm',label:'Upper arm',min:15,max:60,step:.5,unit:'cm'}, {key:'thigh',label:'Thigh',min:25,max:100,step:.5,unit:'cm'}, {key:'calf',label:'Calf',min:20,max:65,step:.5,unit:'cm'}, {key:'legRatio',label:'Leg proportion',min:.43,max:.56,step:.005}, {key:'muscle',label:'Muscle definition',min:0,max:100,step:1}];
export const faceFields:AvatarField[]=[
 {key:'head',label:'Head size',min:.85,max:1.15,step:.01}, {key:'faceWidth',label:'Face width',min:.75,max:1.25,step:.01}, {key:'jaw',label:'Jaw width',min:.65,max:1.35,step:.01}, {key:'chin',label:'Chin length',min:.7,max:1.3,step:.01}, {key:'cheek',label:'Cheek fullness',min:.7,max:1.3,step:.01}, {key:'eyes',label:'Eye size',min:.7,max:1.3,step:.01}, {key:'eyeSpacing',label:'Eye spacing',min:.75,max:1.25,step:.01}, {key:'nose',label:'Nose profile',min:.6,max:1.4,step:.01}, {key:'mouth',label:'Mouth width',min:.7,max:1.3,step:.01}];
export function initialModels(height:number,weight:number|undefined,targetWeight:number,chest?:number,waist?:number,hip?:number,targetWaist?:number):BodyModels{
 const current={...baseAvatar,height:Math.min(220,Math.max(100,height)),weight:Math.min(220,Math.max(30,weight||75)),chest:Math.min(160,Math.max(50,chest||96)),waist:Math.min(180,Math.max(40,waist||84)),hip:Math.min(170,Math.max(50,hip||98))};
 const ratio=Math.sqrt(Math.min(220,Math.max(30,targetWeight))/current.weight);
 return{current,target:{...current,weight:Math.min(220,Math.max(30,targetWeight)),waist:Math.min(180,Math.max(40,targetWaist||current.waist*ratio)),chest:Math.min(160,Math.max(50,current.chest*ratio)),hip:Math.min(170,Math.max(50,current.hip*ratio)),arm:Math.max(15,current.arm*ratio),thigh:Math.max(25,current.thigh*ratio),calf:Math.max(20,current.calf*ratio)}};
}
