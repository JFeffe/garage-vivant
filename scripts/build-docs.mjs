import {readFile,writeFile,mkdir,cp,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {indexDocument} from './doc-index.mjs';
import {RELEASE_VERSION} from '../dist/release.mjs';
execFileSync(process.execPath,['node_modules/vitepress/bin/vitepress.js','build','docs'],{stdio:'inherit'});
await mkdir('dist/docs',{recursive:true});
await cp('docs/.vitepress/dist','dist/docs',{recursive:true});
// VitePress keeps this explicit download link; publish the report beside the page.
for(const report of ['BALANCE_V7_2.json','BALANCE_V7_3.json','AUDIT_V7_3_BASELINE.json','AUDIT_V7_3.json'])await cp('docs/'+report,'dist/docs/'+report);
const files=['docs/index.md',...(await readdir('docs/gdd')).filter(x=>x.endsWith('.md')).map(x=>'docs/gdd/'+x)];
const entries=[];
for(const file of files)entries.push(...indexDocument(file,await readFile(file,'utf8')));
await writeFile('dist/doc-index.json',JSON.stringify({version:RELEASE_VERSION,entries}));
