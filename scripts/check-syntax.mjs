import {readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for (const dir of ['dist','scripts']) for (const name of readdirSync(dir)) {
  if (name.endsWith('.mjs')) execFileSync(process.execPath,['--check',`${dir}/${name}`],{stdio:'inherit'});
}
