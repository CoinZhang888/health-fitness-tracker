import sourceArchive from './downloads/health-fitness-tracker-source.zip';
import favicon from '../public/favicon.svg';
import faviconPng from '../public/favicon-32.png';
import appleIcon from '../public/apple-touch-icon.png';
import icon192 from '../public/icon-192.png';
import icon512 from '../public/icon-512.png';
import maskableIcon from '../public/icon-maskable-512.png';
import manifest from '../public/manifest.webmanifest';
const appAssets:Record<string,{body:string|Uint8Array;type:string}>={
 '/favicon.svg':{body:favicon,type:'image/svg+xml'},'/favicon.ico':{body:faviconPng,type:'image/png'},'/favicon-32.png':{body:faviconPng,type:'image/png'},
 '/apple-touch-icon.png':{body:appleIcon,type:'image/png'},'/icon-192.png':{body:icon192,type:'image/png'},'/icon-512.png':{body:icon512,type:'image/png'},'/icon-maskable-512.png':{body:maskableIcon,type:'image/png'},
 '/manifest.webmanifest':{body:manifest,type:'application/manifest+json'}
};
import {fetchRequestHandler} from '@trpc/server/adapters/fetch';import{appRouter}from'./router';
import html from '../dist/client/index.html';
export default {async fetch(request:Request,env:{DB:D1Database}){const url=new URL(request.url);if(url.pathname==='/downloads/health-fitness-tracker-source.zip'){if(!request.headers.get('oai-authenticated-user-id'))return new Response('Please sign in',{status:401});return new Response(new Uint8Array(sourceArchive).buffer,{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="health-fitness-tracker-source.zip"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}if(url.pathname.startsWith('/api/trpc/')){try{return await fetchRequestHandler({endpoint:'/api/trpc',req:request,router:appRouter,createContext:()=>({db:env.DB,userId:request.headers.get('oai-authenticated-user-id')||''})})}catch{return Response.json({error:{message:'The service is temporarily unavailable. Please try again.'}},{status:500})}}
const asset=appAssets[url.pathname];if(asset)return new Response(typeof asset.body==='string'?asset.body:new Uint8Array(asset.body).buffer,{headers:{'Content-Type':asset.type,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
if(url.pathname==='/health')return Response.json({ok:true});if(url.pathname.startsWith('/assets/'))return new Response('Not found',{status:404});return new Response(html,{headers:{'Content-Type':'text/html;charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}})}};
