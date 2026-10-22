import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const checks = [
  ['format', 'format:check'],
  ['types', 'typecheck'],
  ['tests', 'test-check'],
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
