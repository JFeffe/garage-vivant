import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

test('release preparation synchronizes metadata and cache without changing saves; stale versions and missing notes fail',()=>{
  const dir=mkdtempSync(join(tmpdir(),'garage-release-'));
  try{
    for(const folder of ['dist','docs/.vitepress','scripts'])mkdirSync(join(dir,folder),{recursive:true});
    for(const file of ['package.json','package-lock.json','README.md','dist/release.mjs','dist/index.html','dist/engine.mjs','docs/versions.md','docs/CHANGELOG.md','docs/.vitepress/config.mjs','scripts/release.mjs'])cpSync(file,join(dir,file));
    const old=JSON.parse(readFileSync(join(dir,'package.json'))).version;
    const v=old.split('.').map(Number);v[2]++;const next=v.join('.');
    const engineBefore=readFileSync(join(dir,'dist/engine.mjs'),'utf8');
    const run=args=>spawnSync(process.execPath,[resolve(dir,'scripts/release.mjs'),...args],{cwd:dir,encoding:'utf8'});
    assert.notEqual(run(['prepare',next,'--title','Test','--notes-file','absent.md']).status,0);
    assert.equal(JSON.parse(readFileSync(join(dir,'package.json'))).version,old);
    writeFileSync(join(dir,'notes.md'),'- Nouvelle livraison test.\n');
    const prepared=run(['prepare',next,'--title','Test','--notes-file','notes.md']);assert.equal(prepared.status,0,prepared.stderr);
    const checked=run(['check']);assert.equal(checked.status,0,checked.stderr);
    assert.equal(readFileSync(join(dir,'dist/engine.mjs'),'utf8').replaceAll('?v='+next,'?v='+old),engineBefore,'Save implementation unchanged');
    assert.notEqual(run(['prepare',next,'--title','Repeated','--notes-file','notes.md']).status,0);
    writeFileSync(join(dir,'package.json'),JSON.stringify({version:old}));assert.notEqual(run(['check']).status,0);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
