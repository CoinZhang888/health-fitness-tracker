import './scripts/generate-icons.mjs';
import {build as viteBuild} from 'vite';import{build}from'esbuild';import{mkdir,cp,readFile,writeFile}from'node:fs/promises';
await viteBuild();await mkdir('dist/server',{recursive:true});
// Embed the compiled client in the Worker so the deployment is self-contained.
let html=await readFile('dist/client/index.html','utf8');
html=await replaceAsync(html,/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,async(_,p)=>`<script type="module">${(await readFile('dist/client'+p,'utf8')).replace(/<\/script/gi,'<\\/script')}</script>`);
html=await replaceAsync(html,/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,async(_,p)=>`<style>${await readFile('dist/client'+p,'utf8')}</style>`);
await writeFile('dist/client/index.html',html);
await build({entryPoints:['server/worker.ts'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',loader:{'.html':'text','.svg':'text','.webmanifest':'text','.png':'binary','.zip':'binary'},minify:true});await mkdir('dist/.openai',{recursive:true});await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/drizzle',{recursive:true});
async function replaceAsync(s,re,fn){const matches=[...s.matchAll(re)];const vals=await Promise.all(matches.map(m=>fn(...m)));let i=0;return s.replace(re,()=>vals[i++])}
