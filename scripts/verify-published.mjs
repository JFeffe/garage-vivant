import assert from 'node:assert/strict';
import {RELEASE_VERSION} from '../dist/release.mjs';
const site=process.env.SITE_URL;
assert(site?.startsWith('https://'),'SITE_URL doit être une URL HTTPS');
let error;
for(let attempt=0;attempt<12;attempt++){
  try{
    const url=new URL('build.json',site.endsWith('/')?site:site+'/');
    url.searchParams.set('verify',`${process.env.GITHUB_SHA}-${Date.now()}`);
    const response=await fetch(url,{signal:AbortSignal.timeout(10000),cache:'no-store'});
    assert(response.ok,`HTTP ${response.status}`);
    const build=await response.json();
    assert.equal(build.version,RELEASE_VERSION);
    assert.equal(build.commit,process.env.GITHUB_SHA);
    console.log(`Publié et vérifié : v${build.version} · ${build.commit}`);process.exit(0);
  }catch(e){error=e;console.log(`Publication non encore confirmée (${attempt+1}/12) : ${e.message}`);}
  if(attempt<11)await new Promise(resolve=>setTimeout(resolve,10000));
}
throw error;
