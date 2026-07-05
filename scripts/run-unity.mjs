import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const unityProjectPath = resolve(readEnv('MOCHI_PETS_UNITY_PROJECT_PATH', 'MOCHI_SOCIAL_UNITY_PROJECT_PATH') || 'unity');
const unityEditorPath = process.env.UNITY_EDITOR_PATH ||
  'C:\\Program Files\\Unity\\Hub\\Editor\\6000.5.0f1\\Editor\\Unity.exe';
const localDir = resolve(readEnv('MOCHI_PETS_UNITY_REPORT_DIR', 'MOCHI_SOCIAL_UNITY_REPORT_DIR') || 'unity/Logs/MochiPetsLocal');

const command = process.argv[2] || '';
const commands = new Map([
  ['open', openUnity],
  ['bootstrap', () => runBatch('bootstrap', [
    '-executeMethod',
    'MochiSocial.Editor.MochiSocialProjectBootstrap.RunAll'
  ])],
  ['test-editmode', () => runUnityTests('editmode tests', 'editmode', 'unity-editmode-results.xml')],
  ['test-playmode', () => runUnityTests('playmode tests', 'playmode', 'unity-playmode-results.xml')],
  ['build-webgl', () => runBatch('WebGL build', [
    '-executeMethod',
    'MochiSocial.Editor.MochiSocialProjectBootstrap.BuildWebGL'
  ])],
  ['verify', verifyUnity]
]);

if (!commands.has(command)) {
  console.error(`Unknown Unity command: ${command || '<missing>'}`);
  console.error(`Usage: node scripts/run-unity.mjs ${Array.from(commands.keys()).join('|')}`);
  process.exit(1);
}

ensureUnityAvailable();
mkdirSync(localDir, { recursive: true });
commands.get(command)();
normalizeUnityYaml();

function openUnity() {
  runUnity('open editor', [
    '-projectPath',
    unityProjectPath
  ]);
}

function verifyUnity() {
  runUnityTests('editmode tests', 'editmode', 'unity-editmode-results.xml');
  runUnityTests('playmode tests', 'playmode', 'unity-playmode-results.xml');
  runBatch('WebGL build', [
    '-executeMethod',
    'MochiSocial.Editor.MochiSocialProjectBootstrap.BuildWebGL'
  ]);
}

function runUnityTests(label, platform, resultFileName) {
  const resultPath = resolve(localDir, resultFileName);
  const startedAt = Date.now();
  runUnity(label, [
    '-batchmode',
    '-projectPath',
    unityProjectPath,
    '-runTests',
    '-testPlatform',
    platform,
    '-testResults',
    resultPath,
    '-logFile',
    resolve(localDir, `unity-${slug(label)}.log`)
  ]);

  if (!freshFile(resultPath, startedAt)) {
    const defaultResultPath = getDefaultUnityTestResultsPath();
    if (defaultResultPath && freshFile(defaultResultPath, startedAt)) {
      copyFileSync(defaultResultPath, resultPath);
    }
  }

  if (!freshFile(resultPath, startedAt)) {
    console.error(`Unity ${label} did not write test results to ${resultPath}.`);
    process.exit(1);
  }

  const text = readFileSync(resultPath, 'utf8');
  if (!/\bresult="Passed"/.test(text) || !/\bfailed="0"/.test(text)) {
    console.error(`Unity ${label} did not pass. See ${resultPath}.`);
    process.exit(1);
  }
}

function runBatch(label, extraArgs) {
  runUnity(label, [
    '-batchmode',
    '-quit',
    '-projectPath',
    unityProjectPath,
    ...extraArgs,
    '-logFile',
    resolve(localDir, `unity-${slug(label)}.log`)
  ]);
}

function runUnity(label, args) {
  const result = spawnSync(unityEditorPath, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    console.error(`Unity ${label} failed to start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Unity ${label} failed with exit code ${result.status}.`);
    process.exit(result.status || 1);
  }
}

function ensureUnityAvailable() {
  if (!existsSync(unityProjectPath)) {
    console.error(`Unity project not found at ${unityProjectPath}.`);
    process.exit(1);
  }

  if (!existsSync(unityEditorPath)) {
    console.error(`Unity editor not found at ${unityEditorPath}. Set UNITY_EDITOR_PATH to the installed Unity editor.`);
    process.exit(1);
  }
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function freshFile(file, startedAt) {
  if (!existsSync(file)) return false;
  return statSync(file).mtimeMs >= startedAt - 2000;
}

function getDefaultUnityTestResultsPath() {
  if (!process.env.USERPROFILE) return '';
  return resolve(process.env.USERPROFILE, 'AppData/LocalLow/Mochirii/Mochi Social/TestResults.xml');
}

function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function normalizeUnityYaml() {
  for (const file of [
    'unity/Assets/Settings/Mobile_RPAsset.asset',
    'unity/Assets/Settings/PC_RPAsset.asset',
    'unity/Assets/Settings/UniversalRenderPipelineGlobalSettings.asset',
    'unity/ProjectSettings/ProjectSettings.asset',
    'unity/ProjectSettings/ShaderGraphSettings.asset'
  ]) {
    const path = resolve(file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, 'utf8');
    const normalized = text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n');
    if (normalized !== text) {
      writeFileSync(path, normalized);
    }
  }
}
