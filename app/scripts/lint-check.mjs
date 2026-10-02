import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const checks = [
  ['format', 'format:check'],
  ['errors', 'lint:errors'],
  ['types', 'lint:types'],
  ['styled', 'lint:styled'],
  ['i18n', 'lint:i18n'],
  ['unused', 'lint:unused'],
  ['arch', 'lint:arch'],
];

let hasErrors = false;

for (const [name, script] of checks) {
  const result = spawnSync(npm, ['run', script], {
    encoding: 'utf8',
  });

  const code = result.status === 0 ? 0 : 1;

  console.log(`${name}: ${code}`);

  if (code !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }

    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    hasErrors = true;
  }
}

process.exit(hasErrors ? 1 : 0);
