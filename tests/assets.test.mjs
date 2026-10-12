import test from 'node:test';
import {RELEASE_VERSION} from '../dist/release.mjs';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';

test('the browser entry and complete module graph use the displayed release cache version',()=>{
  const html=readFileSync('dist/index.html','utf8');
  const entry=html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/);
  assert(entry,'The browser has an explicit versioned module entry');
  const token=new URL(entry[1],'https://example.invalid/').searchParams.get('v');
  assert.equal(token,RELEASE_VERSION,'Cache URLs must match the displayed release');
  const files=readdirSync('dist').filter(name=>name.endsWith('.mjs'));
  let imports=0;
  for(const file of files){
    const source=readFileSync('dist/'+file,'utf8');
    for(const [,specifier] of source.matchAll(/['"](\.\/[^'"\n]+\.mjs(?:\?[^'"\n]*)?)['"]/g)){
      const url=new URL(specifier,'https://example.invalid/');
      assert(existsSync(resolve('dist','.'+url.pathname)),`${file}: missing ${specifier}`);
      assert.equal(url.searchParams.get('v'),token,`${file}: ${specifier} can mix old and new module exports`);
      imports++;
    }
  }
  assert(imports>30,'Check the whole executable graph, not just the BandLive entry');
  for(const [,href] of html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)){
    if(/^[a-z]+:/i.test(href))continue;
    const url=new URL(href,'https://example.invalid/');
    assert.equal(url.searchParams.get('v'),token,`Stale stylesheet: ${href}`);
  }
});
