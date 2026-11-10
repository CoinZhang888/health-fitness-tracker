import {readFile,writeFile,mkdir}from'node:fs/promises';import sharp from 'sharp';
// Reuse the approved logo's exact paths, keeping the app icons in sync with the header.
const component=await readFile(new URL('../src/SmileMark.tsx',import.meta.url),'utf8');
const match=component.match(/(<path\s[\s\S]+)<\/svg>/);if(!match)throw Error('Health Logo paths could not be found');
const paths=match[1].replaceAll('strokeWidth=','stroke-width=').replaceAll('strokeLinejoin=','stroke-linejoin=');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 128 128"><rect width="128" height="128" fill="#ffffff"/><g transform="translate(14 28) scale(2)" color="#1d1d1f">${paths}</g></svg>`;
const out=new URL('../public/',import.meta.url);await mkdir(out,{recursive:true});await writeFile(new URL('favicon.svg',out),svg);
for(const [name,size]of[['favicon-32.png',32],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512],['icon-maskable-512.png',512]])await sharp(Buffer.from(svg)).resize(size,size).png().toFile(new URL(name,out).pathname);
