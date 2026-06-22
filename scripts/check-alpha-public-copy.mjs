import { existsSync, readFileSync } from 'node:fs';

const checks = [
  {
    file: 'README.md',
    includes: [
      'shared guild room',
      'create a curated character',
      'meet Lirabao',
      'care for the guild pet together',
      'no real value',
      'Tester password',
      'Member sign-in'
    ],
    forbidden: [
      /\b(?:Codex|OpenAI|LLM|agent|tooling)\b/i,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout)\b/i,
      /\b(?:Distributed Authority|Cloud Save|Edge Function|Unity Custom ID)\b/i
    ]
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: [
      'Playtest temporarily paused',
      'The Mochi Social room is not available right now.',
      'saved play will resume when the room is ready.'
    ],
    forbidden: [
      /Mochi Social Unity build missing/i,
      /Unity WebGL build is required/i,
      /npm run unity:build:webgl/i
    ]
  },
  {
    file: 'unity/Assets/MochiSocial/Scripts/Runtime/MochiSocialBootstrap.cs',
    includes: [
      'Create your character',
      'Choose a character preset.',
      'Choose your character.',
      'Saved play uses one of these curated Mochirii presets.',
      'Room signal',
      'Status:',
      '1 Settling in  |  2 Caring  |  3 Waving',
      'Your latest room spot could not be saved.',
      'Signing into Mochi Social.',
      'Sign-in failed.',
      'Signed out of Mochi Social.',
      'Shared Lirabao state could not be loaded'
    ],
    forbidden: [
      /Signing into Unity services/i,
      /Unity auth failed/i,
      /Signed out of Unity services/i,
      /Shared pet Cloud Code/i
    ]
  },
  {
    file: 'unity/Assets/MochiSocial/Scripts/Data/LocalSocialSignalCatalog.cs',
    includes: [
      'settling-in',
      'Caring for Lirabao',
      'Waving hello'
    ],
    forbidden: [
      /\b(?:Codex|OpenAI|LLM|agent|tooling)\b/i,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout)\b/i
    ]
  },
  {
    file: 'unity/Assets/MochiSocial/Scripts/Runtime/LirabaoInteractionPrompt.cs',
    includes: [
      'E Care  |  Q Wave',
      'InteractWithLirabao("approach")',
      'InteractWithLirabao("care")',
      'InteractWithLirabao("wave")'
    ],
    forbidden: [
      /\b(?:Codex|OpenAI|LLM|agent|tooling)\b/i,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout)\b/i
    ]
  },
  {
    file: 'unity/Assets/Plugins/WebGL/MochiSocialBridge.jslib',
    includes: [
      'MOCHI_SOCIAL_READY',
      'MOCHI_SOCIAL_AUTH_STATE',
      'MOCHI_SOCIAL_ERROR',
      'MOCHI_SOCIAL_AUTH',
      'MOCHI_SOCIAL_SIGN_OUT'
    ],
    forbidden: [
      /\b(?:Codex|OpenAI|LLM|agent|tooling)\b/i,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout)\b/i
    ]
  }
];

const failures = [];

for (const check of checks) {
  if (!existsSync(check.file)) {
    failures.push(`${check.file}: missing file.`);
    continue;
  }

  const text = readFileSync(check.file, 'utf8');
  for (const snippet of check.includes) {
    if (!text.includes(snippet)) failures.push(`${check.file}: missing ${snippet}`);
  }

  for (const pattern of check.forbidden) {
    if (pattern.test(text)) failures.push(`${check.file}: public-facing copy matched ${pattern}`);
  }
}

if (failures.length) {
  console.error('Mochi Social public copy check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Social public copy check passed.');
