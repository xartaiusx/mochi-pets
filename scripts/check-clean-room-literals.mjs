import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const privateDenylistPath = resolve(root, process.env.MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST_PATH || '.local/clean-room-denylist.txt');
const envTerms = splitTerms(process.env.MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST || '');
const fileTerms = existsSync(privateDenylistPath) ? splitTerms(readFileSync(privateDenylistPath, 'utf8')) : [];
const denylist = unique([...envTerms, ...fileTerms]);
const failures = [];
const scanned = [];

const ignoredDirectories = new Set([
  '.git',
  '.local',
  'coverage',
  'dist',
  'node_modules',
  'reports'
]);

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.tmx',
  '.tsx',
  '.xml'
]);

await main();

async function main() {
  if (denylist.length === 0) {
    console.log(`Clean-room literal scan skipped private term matching because no denylist was found at ${pathForReport(privateDenylistPath)}.`);
  }

  await scanDirectory(root);
  checkRuntimeAssetsAreLedgered();

  if (failures.length) {
    console.error('Mochirii clean-room scan failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Mochirii clean-room scan passed (${scanned.length} text file(s) checked).`);
}

async function scanDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) await scanDirectory(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!shouldScanTextFile(fullPath)) continue;
    scanFile(fullPath);
  }
}

function scanFile(file) {
  const text = readFileSync(file, 'utf8');
  scanned.push(file);
  for (const term of denylist) {
    if (!term) continue;
    if (text.toLowerCase().includes(term.toLowerCase())) {
      failures.push(`${pathForReport(file)} contains a private clean-room denylist literal.`);
    }
  }
}

function checkRuntimeAssetsAreLedgered() {
  const ledgerPath = resolve(root, 'docs/asset-ledger.md');
  if (!existsSync(ledgerPath)) {
    failures.push('docs/asset-ledger.md is missing.');
    return;
  }

  const ledger = readFileSync(ledgerPath, 'utf8');
  for (const directory of [resolve(root, 'apps/game/public/spritesheets'), resolve(root, 'apps/game/src/tiled')]) {
    if (!existsSync(directory)) continue;
    const files = listFilesSync(directory).filter((file) => file.endsWith('.png'));
    for (const file of files) {
      const rel = pathForReport(file);
      if (!ledger.includes(rel)) {
        failures.push(`${rel} is a runtime PNG without docs/asset-ledger.md coverage.`);
      }
    }
  }
}

function listFilesSync(directory) {
  const results = [];
  for (const entry of readdirSyncSafe(directory)) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...listFilesSync(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function readdirSyncSafe(directory) {
  return existsSync(directory) ? readdirSync(directory) : [];
}

function shouldScanTextFile(file) {
  const rel = pathForReport(file);
  if (rel === 'package-lock.json') return false;
  if (rel.startsWith('assets/source/game/hd/') && extname(file) === '.png') return false;
  return textExtensions.has(extname(file));
}

function splitTerms(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((term) => term.trim())
    .filter((term) => term && !term.startsWith('#'));
}

function unique(values) {
  return Array.from(new Set(values));
}

function pathForReport(file) {
  return relative(root, file).replace(/\\/g, '/');
}
