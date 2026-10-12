import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const write=(p,s)=>writeFileSync(p,s);
const current=()=>read('dist/release.mjs').match(/RELEASE_VERSION\s*=\s*['"]([^'"]+)/)?.[1];
const id=v=>'v'+v.replaceAll('.','');
const parts=v=>{assert(/^\d+\.\d+\.\d+$/.test(v),`Version invalide : ${v}`);return v.split('.').map(Number);};
const newer=(a,b)=>{const x=parts(a),y=parts(b);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i];return false;};
const [command,...args]=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
if(command==='prepare'){
  const version=args[0],title=option('--title'),file=option('--notes-file'),old=current();
  assert(newer(version,old),`La version doit dépasser ${old}`);
  assert(title?.trim()&&file,'Usage: npm run release:prepare -- 0.7.9 --title "Titre" --notes-file /tmp/notes.md');
  const body=read(file).trim();assert(body,'Les notes ne peuvent pas être vides');
  const notes=read('docs/versions.md');assert(!notes.includes(`{#${id(version)}}`),'Cette version existe déjà');
  const date=new Intl.DateTimeFormat('fr-CA',{timeZone:'America/Toronto',year:'numeric',month:'long',day:'numeric'}).format(new Date());
  // Validate inputs before touching the release files.
  for(const name of readdirSync('dist'))if(/\.(mjs|html)$/.test(name)){
    const path='dist/'+name;
    write(path,read(path).replace(/\?v=[\w.-]+/g,'?v='+version));
  }
  write('dist/release.mjs',read('dist/release.mjs').replace(/(RELEASE_VERSION\s*=\s*['"])[^'"]+/,`$1${version}`).replace(/(PATCH_NOTES\s*=\s*\[)/,`$1'${id(version)}',`));
  write('dist/index.html',read('dist/index.html').replace(/(id="version"[^>]*>)v[\d.]+/,`$1v${version}`));
  for(const path of ['package.json','package-lock.json']){
    const data=JSON.parse(read(path));data.version=version;
    if(data.packages?.[''])data.packages[''].version=version;
    write(path,JSON.stringify(data,null,2)+'\n');
  }
  write('README.md',read('README.md').replace(/(# Garage vivant · v)[\d.]+/,`$1${version}`));
  write('docs/.vitepress/config.mjs',read('docs/.vitepress/config.mjs').replace(/Documentation de la version [\d.]+/,'Documentation de la version '+version));
  write('docs/versions.md',notes.replace(/# Notes de version\r?\n/,'# Notes de version\n\n'+`## V${version} — ${title} {#${id(version)}}\n\n${date}.\n\n${body}\n`));
  write('docs/CHANGELOG.md',`# V${version} — ${date}\n\n${title}. [Notes complètes](./versions.md#${id(version)}).\n\n`+read('docs/CHANGELOG.md'));
  console.log(`Version ${old} → ${version} préparée. Relire le diff puis npm run test:quick.`);
}else if(command==='check'){
  const version=current();parts(version);
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version,version);assert.equal(lock.version,version);assert.equal(lock.packages[''].version,version);
  assert(read('dist/index.html').match(/id="version"[^>]*>v([^<]+)/)?.[1]===version,'Version HTML incohérente');
  assert(read('README.md').includes('# Garage vivant · v'+version),'Version README incohérente');
  assert(read('docs/.vitepress/config.mjs').includes('Documentation de la version '+version),'Version documentaire incohérente');
  assert(read('dist/release.mjs').match(/PATCH_NOTES\s*=\s*\[['"]([^'"]+)/)?.[1]===id(version),'Première note incohérente');
  assert(read('docs/versions.md').includes(`{#${id(version)}}`),'Notes manquantes');
  assert(read('docs/CHANGELOG.md').startsWith('# V'+version+' —'),'Changelog manquant');
  const base=option('--base');
  if(base){
    assert(/^[a-f0-9]{40}$/.test(base),'--base attend un SHA Git complet');
    const previous=JSON.parse(execFileSync('git',['show',`${base}:package.json`],{encoding:'utf8'})).version;
    assert(newer(version,previous),`Version ${version} déjà sur main (${previous}) : préparer une version supérieure avant fusion`);
  }
  console.log(`Version ${version} et notes cohérentes${base?' ; progression vérifiée face à main':''}.`);
}else throw Error('Commande attendue : prepare ou check');
