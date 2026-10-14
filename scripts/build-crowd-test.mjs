import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/build-bandlive-test.mjs','BandLive-test/LANCER-Public-pack.html','--crowd'],{stdio:'inherit'});
