import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const result = await build({entryPoints:['src/app.js'],bundle:true,minify:true,format:'iife',target:['es2020'],legalComments:'inline',write:false});
const template = await readFile('src/index.html','utf8');
const script = result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',template.replace('<!-- APP_SCRIPT -->',()=>`<script>${script}</script>`));
console.log('Built self-contained dist/index.html');
