import { existsSync, readFileSync } from 'node:fs';

const blockedToolReferencePattern = new RegExp(`\\b(?:${
  [
    ['Co', 'dex'].join(''),
    ['A', 'I'].join(''),
    ['Open', 'A', 'I'].join(''),
    ['L', 'L', 'M'].join(''),
    ['ag', 'ent'].join(''),
    ['tool', 'ing'].join('')
  ].join('|')
})\\b`, 'i');

const checks = [
  {
    file: 'README.md',
    includes: [
      'shared guild room',
      'create a curated character',
      'meet Lirabao',
      'care for the guild pet together',
      'no real value',
      'tester password',
      'Member sign-in'
    ],
    forbidden: [
      blockedToolReferencePattern,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout|buying|selling)\b/i,
      /\bpublic[- ](?:launch|release)\b/i,
      /\bwider release\b/i,
      /\b(?:Distributed Authority|Cloud Save|Edge Function|Unity Custom ID)\b/i
    ]
  },
  {
    file: 'docs/README.md',
    includes: [
      'shared guild room',
      'create a curated character',
      'meet Lirabao',
      'care for the guild pet together',
      'no real value',
      'Player-Facing Playtest Docs',
      'tester page',
      'public game UI'
    ],
    forbidden: [
      blockedToolReferencePattern,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout|buying|selling)\b/i,
      /\bpublic[- ](?:launch|release)\b/i,
      /\bwider release\b/i,
      /\b(?:Distributed Authority|Cloud Save|Edge Function|Unity Custom ID)\b/i,
      /\b(?:operator|ledger)\b/i
    ]
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: [
      'shared guild room',
      'create a curated character',
      'meet Lirabao',
      'care for the guild pet together',
      'tester password',
      'Mochirii member sign-in',
      'no real value',
      'playtest paused message'
    ],
    forbidden: [
      blockedToolReferencePattern,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout|buying|selling)\b/i,
      /\bpublic[- ](?:launch|release)\b/i,
      /\bwider release\b/i,
      /\b(?:Distributed Authority|Cloud Save|Edge Function|Unity Custom ID)\b/i,
      /\b(?:operator|ledger)\b/i
    ]
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: [
      'Playtest temporarily paused',
      'The Mochi Social room is not available right now.',
      'saved play will resume when the room is ready.',
      'Saved play could not be reached right now. Please try again soon.',
      'Playtest action recorded locally. Sign in through Mochirii for saved play.',
      'Saved play is not connected for this room yet.'
    ],
    forbidden: [
      /Mochi Social Unity build missing/i,
      /Unity WebGL build is required/i,
      /npm run unity:build:webgl/i,
      /Supabase alpha Edge Function/i,
      /Configure Mochirii Supabase Edge Functions/i,
      /Signed-in account progress requires Mochirii Supabase Edge Functions/i,
      /Mochirii Supabase alpha progress could not be reached/i
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
      'Shared Lirabao state could not be loaded',
      'Lirabao is resting. Try again soon.',
      "Another tester cared for Lirabao first. The room refreshed Lirabao's latest mood."
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
      blockedToolReferencePattern,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout|buying|selling)\b/i,
      /\bpublic[- ](?:launch|release)\b/i,
      /\bwider release\b/i
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
      blockedToolReferencePattern,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout|buying|selling)\b/i,
      /\bpublic[- ](?:launch|release)\b/i,
      /\bwider release\b/i
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
      blockedToolReferencePattern,
      /\b(?:Enjin|Canary|funded-chain|configured-preview-stub)\b/i,
      /\b(?:market|trade|trading|cashout|buying|selling)\b/i,
      /\bpublic[- ](?:launch|release)\b/i,
      /\bwider release\b/i
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
