import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function sh(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
}

function getSha() {
  // 1) Prefer injected SHA (Docker/CI)
  const envSha =
    process.env.GIT_SHA ||
    process.env.EXNULLA_GIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA;

  if (envSha && envSha.trim()) return envSha.trim();

  // 2) Fallback: only works if .git exists in the build context
  try {
    return sh('git -C .. rev-parse HEAD');
  } catch {
    return 'unknown';
  }
}

const sha = getSha();
const short = sha === 'unknown' ? 'unknown' : sha.slice(0, 7);
const builtAt = new Date().toISOString();

const outPath = new URL('../public/meta/version.json', import.meta.url);
mkdirSync(dirname(outPath.pathname), { recursive: true });

writeFileSync(outPath, JSON.stringify({ sha, short, builtAt }, null, 2) + '\n', 'utf8');

console.log(`[version] ${short} ${builtAt}`);
